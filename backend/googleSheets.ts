import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import crypto from "crypto";

/**
 * Exchange the Service Account Private Key for a Google OAuth2 Access Token.
 * Runs completely in-memory using Node's built-in crypto module.
 */
async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const signatureInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(claim)
  )}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  const signature = sign
    .sign(privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signatureInput}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to authenticate with Google: ${errText}`);
  }

  const data: any = await response.json();
  return data.access_token;
}

/**
 * Ensures that the specific sheet (tab) name exists in the spreadsheet.
 * If it doesn't, it creates it.
 */
async function ensureSheetExists(
  spreadsheetId: string,
  accessToken: string,
  sheetName: string
): Promise<void> {
  // Get spreadsheet metadata to list existing sheets
  const metaResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaResponse.ok) {
    const errText = await metaResponse.text();
    throw new Error(`Failed to fetch spreadsheet metadata: ${errText}`);
  }

  const metadata: any = await metaResponse.json();
  const existingSheets = (metadata.sheets || []).map(
    (s: any) => s.properties?.title
  );

  if (existingSheets.includes(sheetName)) {
    return; // Already exists
  }

  // Create the new sheet/tab
  const createResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      }),
    }
  );

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create sheet "${sheetName}": ${errText}`);
  }
}

/**
 * Synchronizes a specific database table's records directly to Google Sheets.
 */
export async function syncTableToGoogleSheets(tableName: string): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const clientEmail = process.env.GCP_CLIENT_EMAIL;
  const privateKey = process.env.GCP_PRIVATE_KEY;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.log(
      `[Google Sheets] Credentials not configured. Skipped sync for table: "${tableName}"`
    );
    return;
  }

  try {
    let rows: any[] = [];
    if (tableName === "users") {
      rows = await db.select().from(schema.users);
    } else if (tableName === "products") {
      rows = await db.select().from(schema.products);
    } else if (tableName === "gallery_images") {
      rows = await db.select().from(schema.galleryImages);
    } else if (tableName === "orders") {
      // Fetch orders and join with users to get customer emails
      const results = await db
        .select({
          order: schema.orders,
          userEmail: schema.users.email,
        })
        .from(schema.orders)
        .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id));

      rows = results.map((r: any) => ({
        ...r.order,
        customerEmail: r.userEmail || null,
      }));
    } else {
      console.error(`[Google Sheets Sync] Unknown table name: "${tableName}"`);
      return;
    }

    // 1. Authenticate with Google
    const cleanPrivateKey = privateKey.replace(/\\n/g, "\n").replace(/"/g, "");
    const accessToken = await getAccessToken(clientEmail, cleanPrivateKey);

    // 2. Ensure the tab exists
    await ensureSheetExists(spreadsheetId, accessToken, tableName);

    // 3. Clear existing values
    const clearResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tableName}:clear`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!clearResponse.ok) {
      const errText = await clearResponse.text();
      throw new Error(`Failed to clear sheet values: ${errText}`);
    }

    // 4. If there is data, write it in bulk
    const headers = Object.keys(rows[0] || {});
    if (headers.length > 0) {
      const values = [
        headers,
        ...rows.map((row) =>
          headers.map((h) => {
            const val = row[h];
            if (typeof val === "object" && val !== null) {
              return JSON.stringify(val);
            }
            return val === undefined || val === null ? "" : val;
          })
        ),
      ];

      const writeResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tableName}?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values,
          }),
        }
      );

      if (!writeResponse.ok) {
        const errText = await writeResponse.text();
        throw new Error(`Failed to write sheet values: ${errText}`);
      }
    }

    console.log(
      `[Google Sheets Sync] Successfully synchronized table "${tableName}" to Google Sheets.`
    );
  } catch (err: any) {
    console.error(
      `[Google Sheets Sync] Failed to synchronize table "${tableName}" to Google Sheets:`,
      err.message || err
    );
  }
}

/**
 * Perform a complete synchronization of all database tables.
 */
export async function syncAllTablesToGoogleSheets(): Promise<void> {
  const tables = ["users", "products", "gallery_images", "orders"];
  console.log("[Google Sheets Sync] Starting complete synchronization...");
  for (const table of tables) {
    await syncTableToGoogleSheets(table);
  }
  console.log("[Google Sheets Sync] Synchronization finished.");
}
