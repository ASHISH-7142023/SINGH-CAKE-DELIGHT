import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

export let db: any;
export let sqlite: any = null;

if (process.env.TURSO_DATABASE_URL) {
  // Production: Cloud SQLite using Turso
  const { drizzle } = require("drizzle-orm/libsql");
  const { createClient } = require("@libsql/client");
  
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  db = drizzle(client, { schema });
} else {
  // Development: Local SQLite using better-sqlite3
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const Database = require("better-sqlite3");

  const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : process.cwd();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.resolve(dataDir, "sqlite.db");

  // Ensure strict Owner-Only permissions (0o600: read/write by owner only)
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "", { mode: 0o600 });
  } else {
    try {
      fs.chmodSync(dbPath, 0o600);
    } catch (err) {
      console.warn("[DB] Failed to set owner-only permissions on sqlite.db:", err);
    }
  }

  sqlite = new Database(dbPath);

  // Enable WAL mode for better performance
  sqlite.pragma("journal_mode = WAL");

  // Enable Forensic Scrubbing (PRAGMA secure_delete = ON)
  // Wipes deleted rows by overwriting them with zeroes
  sqlite.pragma("secure_delete = ON");

  // Enable Volatile Cache (PRAGMA temp_store = MEMORY)
  // Prevents temporary databases/tables from leaking onto physical disk platters
  sqlite.pragma("temp_store = MEMORY");

  // Lock WAL and SHM files to Owner-Only permissions if they exist
  const lockHelperFiles = () => {
    for (const suffix of ["-wal", "-shm"]) {
      const helperPath = dbPath + suffix;
      if (fs.existsSync(helperPath)) {
        try {
          fs.chmodSync(helperPath, 0o600);
        } catch (err) {
          // Ignore errors if file is currently locked/in use
        }
      }
    }
  };
  lockHelperFiles();

  db = drizzle(sqlite, { schema });
}