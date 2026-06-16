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
        await storage.createProduct({ name: "Butterscotch Cake", description: "Smooth butterscotch flavored sponge with crunchy praline topping and creamy frosting.", imageUrl: "Butterscotch-og-cake.jpeg", category: "Butterscotch Cake" });
        await storage.createProduct({ name: "Vanilla Cake", description: "Classic soft and fluffy eggless vanilla sponge with rich cream frosting.", imageUrl: "Vanilla-Cake.jpeg", category: "Vanilla Cake" });
        await storage.createProduct({ name: "Chocolate Cake", description: "Decadent eggless chocolate cake with layers of rich chocolate ganache.", imageUrl: "Chocolate-Crunch-Overload-Cake.jpg", category: "Chocolate Cake" });
        await storage.createProduct({ name: "Black Forest Cake", description: "Layers of chocolate sponge, cherry filling, whipped cream, and chocolate shavings.", imageUrl: "Black-forest-Cake.jpeg", category: "Black Forest Cake" });
        await storage.createProduct({ name: "Strawberry Cake", description: "Fresh strawberry sponge cake with real strawberry compote and whipped cream.", imageUrl: "Strawberry Cake.jpeg", category: "Strawberry Cake" });
        await storage.createProduct({ name: "Rasmalai Cake", description: "Unique fusion cake inspired by the classic Rasmalai, topped with pistachios and saffron cream.", imageUrl: "Rasmalai-Cake.jpeg", category: "Rasmalai Cake" });
        // Row 2
        await storage.createProduct({ name: "Truffle Cake", description: "Ultimate chocolate indulgence with premium dark chocolate ganache and truffle finish.", imageUrl: "Truffle_Cake.jpeg", category: "Truffle Cake" });
        await storage.createProduct({ name: "Cupcakes", description: "Soft eggless cupcakes in 6 flavors: Chocolate, Vanilla, and Strawberry Frostings. Perfect for parties!", imageUrl: "cup-cake2.jpeg", category: "Cupcake" });
        // Row 3 - Specialty
        await storage.createProduct({ name: "Glass Cake", description: "Elegant layered cake served in a glass — a beautiful and delicious treat.", imageUrl: "Glass_cake.jpg", category: "Specialty" });
        await storage.createProduct({ name: "Candy Bites", description: "Irresistible chocolate candy bites — perfect for gifting and snacking.", imageUrl: "Chocolate Candy Bites.jpeg", category: "Specialty" });
        await storage.createProduct({ name: "Muffins", description: "Soft and fluffy eggless muffins bursting with real mango flavor.", imageUrl: "Muffins.jpg", category: "Specialty" });
      }


      const existingGallery = await storage.getGalleryImages();
      if (existingGallery.length === 0) {
        await storage.createGalleryImage({ imageUrl: "ButterScotch-cake (2).jpeg", altText: "Chocolate Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "Ring-Ceremony-Cake.jpg", altText: "Ring Ceremony Cake" });
        await storage.createGalleryImage({ imageUrl: "cup-cake2.jpeg", altText: "Cup Cake" });
        await storage.createGalleryImage({ imageUrl: "golden-cake.jpeg", altText: "Golden Cake" });
        await storage.createGalleryImage({ imageUrl: "Rasmalai-Cake.jpeg", altText: "Rasmalai Cake" });
        await storage.createGalleryImage({ imageUrl: "Double-Chocolate-Candy-Bites.jpeg", altText: "Double Chocolate Candy Bites" });
        await storage.createGalleryImage({ imageUrl: "Vanilla-Cake.jpeg", altText: "Vanilla Cake" });
        await storage.createGalleryImage({ imageUrl: "2-small-cupcake.jpeg", altText: "2 Small Cupcake" });
        await storage.createGalleryImage({ imageUrl: "Anniversary_bento-cake.jpeg", altText: "Anniversary Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Anniversary-cake.jpeg", altText: "Anniversary Cake" });
        await storage.createGalleryImage({ imageUrl: "bento-1.jpeg", altText: "Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Rasmalai-cake-1.jpg", altText: "Rasmalai Cake" });
        await storage.createGalleryImage({ imageUrl: "Fruits_Cake.jpeg", altText: "Fruits Cake" });
        await storage.createGalleryImage({ imageUrl: "Romantic-Rose-Anniversary-Cake.jpg", altText: "Romantic Rose Anniversary Cake" });
        await storage.createGalleryImage({ imageUrl: "bento-2.jpeg", altText: "Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Black-forest-Cake.jpeg", altText: "Black Forest Cake" });
        await storage.createGalleryImage({ imageUrl: "Butterfly-cake.jpeg", altText: "Butterfly Cake" });
        await storage.createGalleryImage({ imageUrl: "Pink-Velvet-Starry-Cake.jpg", altText: "Pink Velvet Starry Cake" });
        await storage.createGalleryImage({ imageUrl: "Butterscotch-Cake.jpeg", altText: "Butterscotch Cake" });
        await storage.createGalleryImage({ imageUrl: "Butterscotch-og-cake.jpeg", altText: "Butterscotch Cake" });
        await storage.createGalleryImage({ imageUrl: "Choco-Vanilla.png", altText: "Chocolate Vanilla Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Cake_main.jpeg", altText: "Chocolate Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate Candy Bites.jpeg", altText: "Chocolate Candy Bites" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_cake_2.png", altText: "Chocolate Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Cake.png", altText: "Chocolate Cake" });
        await storage.createGalleryImage({ imageUrl: "Mom_Bday.jpeg", altText: "Mom's Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "Pink-Rose-Cake.jpg", altText: "Pink Rose Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-jar-cake-Open.jpeg", altText: "Chocolate Jar Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-jar-cake.jpeg", altText: "Chocolate Open Jar Cake " });
        await storage.createGalleryImage({ imageUrl: "Assorted-Chocolate-High-Tea-Platter.jpg", altText: "Assorted Chocolate High Tea Platter" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-chocochips.jpeg", altText: "Chocolate Choco-Chips Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-Crunch-Overload-Cake.jpg", altText: "Chocolate Crunch Overload Cake" });
        await storage.createGalleryImage({ imageUrl: "Strawberry Cake.jpeg", altText: "Strawberry Cake" });
        await storage.createGalleryImage({ imageUrl: "Vanilla_Black.jpeg", altText: "Vanilla Black Cake" });
        await storage.createGalleryImage({ imageUrl: "Teachers_Day.jpeg", altText: "Teacher's Day Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-Fruits-Cake.jpeg", altText: "Chocolate Fruits Cake" });
        await storage.createGalleryImage({ imageUrl: "cup-cake-3.jpeg", altText: "Cup Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-Rose-Bouquet-Cake.jpg", altText: "Chocolate Rose Bouquet Cake" });
        await storage.createGalleryImage({ imageUrl: "Cupcake-Match.jpeg", altText: "Cupcake Match" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Drip_Cake.jpeg", altText: "Chocolate Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "Pineapple_Cake.jpeg", altText: "Pineapple Cake" });
        await storage.createGalleryImage({ imageUrl: "Strawberry_cake_2.jpeg", altText: "Strawberry Cake" });
        await storage.createGalleryImage({ imageUrl: "KitKat-Premium-Bday-Cake.jpg", altText: "Kit Kat Premium Bday Cake" });
        await storage.createGalleryImage({ imageUrl: "Glass_cake.jpg", altText: "Glass Cake" });
        await storage.createGalleryImage({ imageUrl: "Maggie_Cake.jpg", altText: "Maggie's Cake" });
        await storage.createGalleryImage({ imageUrl: "Elegant-Butterfly-Drip-Cake.jpg", altText: "Elegant Butterfly Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "cup-cake1.jpeg", altText: "Cup Cake" });
        await storage.createGalleryImage({ imageUrl: "Choco_Drip_Black_Forest_Cake.webp", altText: "Choco Drip Black Forest Cake" });
        await storage.createGalleryImage({ imageUrl: "Rainbow_Confetti_Cake.jpg", altText: "Rainbow Confetti Cake" });
        await storage.createGalleryImage({ imageUrl: "Love-Anniversary-Cake.jpeg", altText: "Love Anniversary Cake" });
        await storage.createGalleryImage({ imageUrl: "Glass-Cake.jpeg", altText: "Glass Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Bento_Drip_Cake.jpg", altText: "Chocolate Bento Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "1yr-Anniversary-Bento-Cake.jpg", altText: "1st Year Anniversary Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "18th_B'day_Chocolate_Bento_Cake_Upper.jpg", altText: "18th Birthday Chocolate Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "18th_B'day_Chocolate_Bento_Cake_Close_Shot.jpg", altText: "18th Birthday Chocolate Bento Cake Close Shot" });
        await storage.createGalleryImage({ imageUrl: "Yellow_Rose_B'day_Cake.jpg", altText: "Yellow Rose Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "Vanilla-Cake-2.jpeg", altText: "Vanilla Cake" });
        await storage.createGalleryImage({ imageUrl: "Grass-cake.jpeg", altText: "Grass Cake" });
        await storage.createGalleryImage({ imageUrl: "Light_Chocolate_Birthday_Cake.jpg", altText: "Light Chocolate Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "Floral_Purple_Bento_Cake.jpg", altText: "Floral Purple Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Minimalist_Sage_Green_Bento_Cake.jpg", altText: "Minimalist Sage Green Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Chip_Chocolate_Bento_Cake.jpg", altText: "Chocolate Chip Chocolate Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Floral_Wreath_Bento_Cake.jpg", altText: "Floral Wreath Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Fresh_Cream_Pineapple_B'day_Cake.jpg", altText: "Fresh Cream Pineapple Birthday Cake" });


        //await storage.createGalleryImage({ imageUrl: "", altText: "" });

      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }

  // Seed on startup
  seedDatabase();

  return httpServer;
}