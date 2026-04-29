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
        // Row 1
        await storage.createProduct({ name: "Butterscotch Cake", description: "Smooth butterscotch flavored sponge with crunchy praline topping and creamy frosting.", imageUrl: "/cakes/butterscotch-cake.png", category: "Cake" });
        await storage.createProduct({ name: "Truffle Cake", description: "Ultimate chocolate indulgence with premium dark chocolate ganache and truffle finish.", imageUrl: "/cakes/truffle-cake.png", category: "Cake" });
        await storage.createProduct({ name: "Strawberry Cake", description: "Fresh strawberry sponge cake with real strawberry compote and whipped cream.", imageUrl: "/cakes/strawberry-jar-cake.png", category: "Cake" });
        await storage.createProduct({ name: "Cupcakes", description: "Soft eggless cupcakes in 6 flavors: Chocolate, Vanilla, and Strawberry Frostings. Perfect for parties!", imageUrl: "/cakes/oreo-cake.png", category: "Cupcake" });
        // Row 2
        await storage.createProduct({ name: "Vanilla Cake", description: "Classic soft and fluffy eggless vanilla sponge with rich cream frosting.", imageUrl: "/cakes/birthday-cake.png", category: "Cake" });
        await storage.createProduct({ name: "Chocolate Cake", description: "Decadent eggless chocolate cake with layers of rich chocolate ganache.", imageUrl: "/cakes/chocolate-cake.png", category: "Cake" });
        await storage.createProduct({ name: "Rasmalai Cake", description: "Unique fusion cake inspired by the classic Rasmalai, topped with pistachios and saffron cream.", imageUrl: "/cakes/rasmalai-cake.png", category: "Cake" });
        await storage.createProduct({ name: "Black Forest Cake", description: "Layers of chocolate sponge, cherry filling, whipped cream, and chocolate shavings.", imageUrl: "/cakes/black-forest-cake.png", category: "Cake" });
        // Row 3 - Specialty
        await storage.createProduct({ name: "Glass Cake", description: "Elegant layered cake served in a glass — a beautiful and delicious treat.", imageUrl: "/cakes/jar-cake.png", category: "Specialty" });
        await storage.createProduct({ name: "Candy Bites", description: "Irresistible chocolate candy bites — perfect for gifting and snacking.", imageUrl: "/cakes/candy-lollipop.png", category: "Specialty" });
        await storage.createProduct({ name: "Muffins", description: "Soft and fluffy eggless muffins bursting with real mango flavor.", imageUrl: "/cakes/chocolate-muffins.png", category: "Specialty" });
      }

      const existingGallery = await storage.getGalleryImages();
      if (existingGallery.length === 0) {
        await storage.createGalleryImage({ imageUrl: "/cakes/chocolate-cake.png", altText: "Chocolate Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "/cakes/chocolate-muffins.png", altText: "Chocolate Chip Muffins" });
        await storage.createGalleryImage({ imageUrl: "/cakes/birthday-cake.png", altText: "Birthday Cake Celebration" });
        await storage.createGalleryImage({ imageUrl: "/cakes/rasmalai-cake.png", altText: "Rasmalai Cake" });
        await storage.createGalleryImage({ imageUrl: "/cakes/oreo-cake.png", altText: "Oreo Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "/cakes/jar-cake.png", altText: "Glass Cake" });
        await storage.createGalleryImage({ imageUrl: "/cakes/strawberry-jar-cake.png", altText: "Strawberry Jar Cake" });
        await storage.createGalleryImage({ imageUrl: "/cakes/candy-lollipop.png", altText: "Candy Bites" });
        await storage.createGalleryImage({ imageUrl: "/cakes/black-forest-cake.png", altText: "Black Forest Cake" });
        await storage.createGalleryImage({ imageUrl: "/cakes/truffle-cake.png", altText: "Truffle Cake" });
        await storage.createGalleryImage({ imageUrl: "/cakes/butterscotch-cake.png", altText: "Butterscotch Cake" });
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }

  // Seed on startup
  seedDatabase();

  return httpServer;
}