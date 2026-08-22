import { db } from "../backend/db.js";
import { orders } from "../shared/schema.js";

async function main() {
  try {
    const allOrders = await db.select().from(orders);
    console.log(`Total orders in DB: ${allOrders.length}`);
    allOrders.forEach(o => {
      console.log(`Order ID: #${o.id}, User ID: ${o.userId}, Name: ${o.customerName}, Phone: ${o.customerPhone}, Cake: ${o.cakeName}, Status: ${o.status}`);
    });
  } catch (err) {
    console.error("DB Query error:", err);
  }
}

main();
