import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

/**
 * Synchronizes a specific database table's records to Google Sheets.
 * If the GOOGLE_SHEETS_WEBHOOK_URL is not set, this fails silently.
 */
export async function syncTableToGoogleSheets(tableName: string): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(`[Google Sheets] Webhook URL not configured. Skipped sync for table: "${tableName}"`);
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

    // Call the Google Sheets Apps Script Webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sheetName: tableName,
        rows: rows,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: any = await response.json();
    if (result && result.status === "success") {
      console.log(`[Google Sheets Sync] Successfully synchronized table "${tableName}" to Google Sheets.`);
    } else {
      console.error(`[Google Sheets Sync] Webhook returned error for table "${tableName}":`, result?.message || result);
    }
  } catch (err: any) {
    console.error(`[Google Sheets Sync] Failed to synchronize table "${tableName}" to Google Sheets:`, err.message || err);
  }
}

/**
 * Perform a complete synchronization of all core database tables to Google Sheets.
 */
export async function syncAllTablesToGoogleSheets(): Promise<void> {
  const tables = ["users", "products", "gallery_images", "orders"];
  console.log("[Google Sheets Sync] Starting complete synchronization of all database tables...");
  for (const table of tables) {
    await syncTableToGoogleSheets(table);
  }
  console.log("[Google Sheets Sync] Complete synchronization finished.");
}
