import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : process.cwd();
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, "sqlite.db");

// Ensure strict Owner-Only permissions (0o600: read/write by owner only)
// Note: On Windows, chmod only supports setting/unsetting the read-only attribute,
// but applying it ensures compatibility and POSIX-level owner-only locking.
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, "", { mode: 0o600 });
} else {
  try {
    fs.chmodSync(dbPath, 0o600);
  } catch (err) {
    console.warn("[DB] Failed to set owner-only permissions on sqlite.db:", err);
  }
}

export const sqlite = new Database(dbPath);

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

export const db = drizzle(sqlite, { schema });