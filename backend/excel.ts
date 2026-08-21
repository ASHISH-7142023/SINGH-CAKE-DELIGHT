import XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { db } from "./db";
import * as schema from "../shared/schema";

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : process.cwd();
const EXPORTS_DIR = path.resolve(dataDir, "exports");

/**
 * Exports a specific SQLite table's content into an Excel (.xlsx) file.
 * Saved at: exports/<tableName>.xlsx
 */
export async function exportTableToExcel(tableName: string) {
  try {
    // Ensure exports directory exists
    if (!fs.existsSync(EXPORTS_DIR)) {
      fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    }
    
    // Query data using Drizzle which is database-agnostic
    let rows: any[] = [];
    if (tableName === "users") {
      rows = await db.select().from(schema.users);
    } else if (tableName === "products") {
      rows = await db.select().from(schema.products);
    } else if (tableName === "gallery_images") {
      rows = await db.select().from(schema.galleryImages);
    } else if (tableName === "orders") {
      rows = await db.select().from(schema.orders);
    }
    
    // Convert to Excel workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
    
    // Save workbook to file
    const filePath = path.join(EXPORTS_DIR, `${tableName}.xlsx`);
    XLSX.writeFile(workbook, filePath);
    console.log(`[Excel Sync] Table "${tableName}" successfully synchronized to "${filePath}"`);
  } catch (err: any) {
    console.error(`[Excel Sync] Failed to synchronize table "${tableName}" to Excel:`, err.message || err);
  }
}

/**
 * Export all database tables to Excel on application startup.
 */
export async function syncAllTablesToExcel() {
  const tables = ["users", "products", "gallery_images", "orders"];
  console.log("[Excel Sync] Starting complete synchronization of all database tables...");
  for (const table of tables) {
    await exportTableToExcel(table);
  }
  console.log("[Excel Sync] Synchronization complete.");
}
