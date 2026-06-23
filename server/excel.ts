import XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { sqlite } from "./db";

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : process.cwd();
const EXPORTS_DIR = path.resolve(dataDir, "exports");

/**
 * Exports a specific SQLite table's content into an Excel (.xlsx) file.
 * Saved at: exports/<tableName>.xlsx
 */
export function exportTableToExcel(tableName: string) {
  try {
    // Ensure exports directory exists
    if (!fs.existsSync(EXPORTS_DIR)) {
      fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    }
    
    // Query data directly using the initialized sqlite connection
    const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
    
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
export function syncAllTablesToExcel() {
  const tables = ["users", "products", "gallery_images", "orders"];
  console.log("[Excel Sync] Starting complete synchronization of all database tables...");
  for (const table of tables) {
    exportTableToExcel(table);
  }
  console.log("[Excel Sync] Synchronization complete.");
}
