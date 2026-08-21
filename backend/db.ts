import * as schema from "../shared/schema.js";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { readFileSync, existsSync } from "fs";
import path from "path";

// Load .env variables immediately upon execution before variables are configured
const envPath = path.resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const index = trimmed.indexOf("=");
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          let val = trimmed.substring(index + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.error("[DB] Failed to load .env in db.ts:", err);
  }
}

const databaseUrl = process.env.DATABASE_URL;

// Fallback to local default Postgres during development if connection string is missing
const connectionString = databaseUrl || "postgres://postgres:postgres@localhost:5432/singhcakedelight";

const isNeon = connectionString.includes("neon.tech");

export const pool = new pg.Pool({
  connectionString,
  ssl: isNeon || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });