import { db } from "./db.js";
import { 
  products, galleryImages, orders, users,
  type Product, type GalleryImage, type Order, type User,
  type InsertProduct, type InsertGalleryImage, type InsertOrder, type InsertUser 
} from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { exportTableToExcel } from "./excel.js";
import { syncTableToGoogleSheets } from "./googleSheets.js";

export function getIndianTimeString(): string {
  const dateObj = new Date();
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
}

export interface IStorage {
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  getOrders(): Promise<(Order & { customerEmail?: string | null })[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  
  // User Authentication and Profiles
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  updateUserPassword(id: number, passwordHash: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    exportTableToExcel("products");
    syncTableToGoogleSheets("products").catch(console.error);
    return newProduct;
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages);
  }
  
  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages).values(image).returning();
    exportTableToExcel("gallery_images");
    syncTableToGoogleSheets("gallery_images").catch(console.error);
    return newImage;
  }

  async getOrders(): Promise<(Order & { customerEmail?: string | null })[]> {
    const results = await db
      .select({
        order: orders,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id));

    return results.map((r: any) => ({
      ...r.order,
      customerEmail: r.userEmail || null,
    }));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values({
      ...order,
      status: "pending",
      createdAt: getIndianTimeString(),
    }).returning();
    exportTableToExcel("orders");
    syncTableToGoogleSheets("orders").catch(console.error);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    if (!updatedOrder) {
      throw new Error(`Order with id ${id} not found`);
    }
    exportTableToExcel("orders");
    syncTableToGoogleSheets("orders").catch(console.error);
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
    exportTableToExcel("orders");
    syncTableToGoogleSheets("orders").catch(console.error);
  }

  // User Authentication and Profiles
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      createdAt: getIndianTimeString(),
    }).returning();
    exportTableToExcel("users");
    syncTableToGoogleSheets("users").catch(console.error);
    return newUser;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async updateUserPassword(id: number, passwordHash: string): Promise<void> {
    await db.update(users)
      .set({ password: passwordHash })
      .where(eq(users.id, id));
    exportTableToExcel("users");
    syncTableToGoogleSheets("users").catch(console.error);
  }
}

export const storage = new DatabaseStorage();