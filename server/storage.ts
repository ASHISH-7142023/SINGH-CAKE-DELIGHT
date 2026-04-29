import { db } from "./db";
import { products, galleryImages, type Product, type GalleryImage, type InsertProduct, type InsertGalleryImage } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages);
  }
  
  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages).values(image).returning();
    return newImage;
  }
}

export const storage = new DatabaseStorage();