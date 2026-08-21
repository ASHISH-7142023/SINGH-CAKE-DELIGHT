import { db } from "./db";
import { users, orders } from "../shared/schema";
import { exportTableToExcel } from "./excel";
import { eq } from "drizzle-orm";

function formatIsoToIndianTime(isoStr: string): string {
  if (!isoStr) return isoStr;
  
  // If it's already formatted (contains "/" and either "am" or "pm"), return as is.
  if (isoStr.includes("/") && (isoStr.toLowerCase().includes("am") || isoStr.toLowerCase().includes("pm"))) {
    return isoStr;
  }
  
  try {
    const dateObj = new Date(isoStr);
    if (isNaN(dateObj.getTime())) {
      return isoStr; // Fallback if invalid date
    }
    const datePart = dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const timePart = dateObj.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    return `${datePart.replace(/-/g, "/")}, ${timePart.toLowerCase()}`;
  } catch {
    return isoStr;
  }
}

/**
 * Migration function to update all ISO-formatted 'created_at' fields in the
 * 'users' and 'orders' tables to 12-hour Indian IST format with am/pm.
 */
export async function migrateDatabaseTimestamps() {
  try {
    console.log("[Migration] Starting database timestamp migration...");

    // 1. Migrate users table
    const allUsers = await db.select().from(users);
    let usersUpdated = 0;
    for (const user of allUsers) {
      const originalTime = user.createdAt;
      const formattedTime = formatIsoToIndianTime(originalTime);
      if (formattedTime !== originalTime) {
        await db.update(users)
          .set({ createdAt: formattedTime })
          .where(eq(users.id, user.id));
        usersUpdated++;
      }
    }
    if (usersUpdated > 0) {
      console.log(`[Migration] Successfully updated ${usersUpdated} user timestamps.`);
      exportTableToExcel("users");
    } else {
      console.log("[Migration] No user timestamps needed update.");
    }

    // 2. Migrate orders table
    const allOrders = await db.select().from(orders);
    let ordersUpdated = 0;
    for (const order of allOrders) {
      const originalTime = order.createdAt;
      const formattedTime = formatIsoToIndianTime(originalTime);
      if (formattedTime !== originalTime) {
        await db.update(orders)
          .set({ createdAt: formattedTime })
          .where(eq(orders.id, order.id));
        ordersUpdated++;
      }
    }
    if (ordersUpdated > 0) {
      console.log(`[Migration] Successfully updated ${ordersUpdated} order timestamps.`);
      exportTableToExcel("orders");
    } else {
      console.log("[Migration] No order timestamps needed update.");
    }

    console.log("[Migration] Database timestamp migration complete.");
  } catch (err: any) {
    console.error("[Migration] Error during timestamp migration:", err.message || err);
  }
}
