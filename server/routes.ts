import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.products.list.path, async (req, res) => {
    try {
      const prods = await storage.getProducts();
      res.json(prods);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.gallery.list.path, async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data function
  async function seedDatabase() {
    try {
      const existingProducts = await storage.getProducts();
      if (existingProducts.length === 0) {
        await storage.createProduct({ name: "Birthday Cake", description: "Delicious customized cake for birthdays.", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587", category: "Cake" });
        await storage.createProduct({ name: "Cupcakes", description: "Soft and spongy homemade cupcakes.", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307", category: "Cupcake" });
        await storage.createProduct({ name: "Jar Cakes", description: "Layers of joy packed in a jar.", imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c12636", category: "Jar" });
        await storage.createProduct({ name: "Bento Cakes", description: "Mini cakes perfect for small celebrations.", imageUrl: "https://images.unsplash.com/photo-1621303837174-89787a7d4729", category: "Bento" });
        await storage.createProduct({ name: "Glass Cakes", description: "Elegant cakes served in a glass.", imageUrl: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84", category: "Glass" });
      }

      const existingGallery = await storage.getGalleryImages();
      if (existingGallery.length === 0) {
        await storage.createGalleryImage({ imageUrl: "https://images.unsplash.com/photo-1621303837174-89787a7d4729", altText: "Beautiful Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587", altText: "Birthday Cake Celebration" });
        await storage.createGalleryImage({ imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307", altText: "Colorful Cupcakes" });
        await storage.createGalleryImage({ imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c12636", altText: "Jar Cake Dessert" });
        await storage.createGalleryImage({ imageUrl: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84", altText: "Strawberry Cake" });
        await storage.createGalleryImage({ imageUrl: "https://images.unsplash.com/photo-1559620192-032c4bc4674e", altText: "Elegant Celebration Cake" });
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }

  // Seed on startup
  seedDatabase();

  return httpServer;
}