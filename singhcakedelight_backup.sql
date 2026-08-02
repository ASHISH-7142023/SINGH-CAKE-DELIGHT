-- Singh Cake Delight PostgreSQL Database Backup & Migration Script
-- This script creates the required tables and seeds them with clean, up-to-date store catalog and gallery data.
-- You can copy-paste and run this script directly in your Neon.tech or Supabase SQL Editor.

-- ====================================================
-- 1. Create Tables
-- ====================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    cake_name TEXT,
    cake_image TEXT,
    notes TEXT,
    custom_image TEXT,
    custom_changes TEXT,
    pickup_date TEXT NOT NULL,
    pickup_time TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- ====================================================
-- 2. Clear Existing Seed Data (Prevents duplicates)
-- ====================================================

TRUNCATE TABLE users, products, gallery_images CASCADE;

-- ====================================================
-- 3. Seed Admin Account
-- ====================================================

INSERT INTO users (id, name, email, phone, password, created_at) VALUES
(1, 'Admin', 'singhcakedelight1981.official@gmail.com', '+919438131576', 'eb0e5d0d12707fbf9c8c1b8a8e154fba81b9269b34e253fdbe6929f434202338a5fec161723e6590ac1fbac268d113fad517384a9c342f72268a74669d0dd471.619e1e9ff01bc6fea537d6ad1156eed5', '18/06/2026, 11:27:32 am');

-- ====================================================
-- 4. Seed Products Menu (13 Items)
-- ====================================================

INSERT INTO products (id, name, description, image_url, category) VALUES
(1, 'Butterscotch Cake', 'Smooth butterscotch flavored sponge with crunchy praline topping and creamy frosting.', 'Butterscotch-og-cake.jpeg', 'Butterscotch Cake'),
(2, 'Vanilla Cake', 'Classic soft and fluffy eggless vanilla sponge with rich cream frosting.', 'Vanilla-Cake.jpeg', 'Vanilla Cake'),
(3, 'Chocolate Cake', 'Decadent eggless chocolate cake with layers of rich chocolate ganache.', 'Chocolate-Crunch-Overload-Cake.jpg', 'Chocolate Cake'),
(4, 'Black Forest Cake', 'Layers of chocolate sponge, cherry filling, whipped cream, and chocolate shavings.', 'Black-forest-Cake.jpeg', 'Black Forest Cake'),
(5, 'Strawberry Cake', 'Fresh strawberry sponge cake with real strawberry compote and whipped cream.', 'Strawberry Cake.jpeg', 'Strawberry Cake'),
(6, 'Rasmalai Cake', 'Unique fusion cake inspired by the classic Rasmalai, topped with pistachios and saffron cream.', 'Rasmalai-Cake.jpeg', 'Rasmalai Cake'),
(7, 'Truffle Cake', 'Ultimate chocolate indulgence with premium dark chocolate ganache and truffle finish.', 'Truffle_Cake.jpeg', 'Truffle Cake'),
(8, 'Cupcakes', 'Soft eggless cupcakes in 6 flavors: Chocolate, Vanilla, and Strawberry Frostings. Perfect for parties!', 'cup-cake2.jpeg', 'Cupcake'),
(9, 'Glass Cake', 'Elegant layered cake served in a glass — a beautiful and delicious treat.', 'Glass_cake.jpg', 'Specialty'),
(10, 'Candy Bites', 'Irresistible chocolate candy bites — perfect for gifting and snacking.', 'Chocolate Candy Bites.jpeg', 'Specialty'),
(11, 'Muffins', 'Soft and fluffy eggless muffins bursting with real mango flavor.', 'Muffins.jpg', 'Specialty'),
(12, 'Jar Cake', 'Layers of rich chocolate sponge and smooth cream inside a cute, portable glass jar.', 'Chocolate-jar-cake.jpeg', 'Specialty'),
(13, 'Box Cake', 'Premium eggless cake layers beautifully packed in a convenient celebration box.', 'BOX-Cake.webp', 'Specialty');

-- ====================================================
-- 5. Seed Gallery Images (87 Items)
-- ====================================================

INSERT INTO gallery_images (id, image_url, alt_text) VALUES
(1, 'ButterScotch-cake (2).jpeg', 'Chocolate Drip Cake'),
(2, 'cup-cake2.jpeg', 'Cup Cake'),
(3, 'golden-cake.jpeg', 'Golden Cake'),
(4, 'Rasmalai-Cake.jpeg', 'Rasmalai Cake'),
(5, 'Double-Chocolate-Candy-Bites.jpeg', 'Double Chocolate Candy Bites'),
(6, 'Vanilla-Cake.jpeg', 'Vanilla Cake'),
(7, '2-small-cupcake.jpeg', '2 Small Cupcake'),
(8, 'Anniversary_bento-cake.jpeg', 'Anniversary Bento Cake'),
(9, 'Anniversary-cake.jpeg', 'Anniversary Cake'),
(10, 'bento-1.jpeg', 'Bento Cake'),
(11, 'Rasmalai-cake-1.jpg', 'Rasmalai Cake'),
(12, 'Fruits-Cake.jpeg', 'Fruits Cake'),
(13, 'Romantic-Rose-Anniversary-Cake.jpg', 'Romantic Rose Anniversary Cake'),
(14, 'bento-2.jpeg', 'Bento Cake'),
(15, 'Black-forest-Cake.jpeg', 'Black Forest Cake'),
(16, 'Butterfly-cake.jpeg', 'Butterfly Cake'),
(17, 'Pink-Velvet-Starry-Cake.jpg', 'Pink Velvet Starry Cake'),
(18, 'Butterscotch-Cake.jpeg', 'Butterscotch Cake'),
(19, 'Butterscotch-og-cake.jpeg', 'Butterscotch Cake'),
(20, 'Glass-Cake-3.jpeg', 'Triple Glass Cake'),
(21, 'Chocolate Cake.jpeg', 'Chocolate Cake'),
(22, 'Designed Chocolate-Cake.jpeg', 'Designed Chocolate Cake'),
(23, 'Ring-Ceremony-Cake.jpg', 'Ring Ceremony Cake'),
(24, 'TRI-Glass-Cake.jpeg', 'Tri Glass Cake'),
(25, 'Chocolate_Cake_main.jpeg', 'Chocolate Cake'),
(26, 'Chocolate Candy Bites.jpeg', 'Chocolate Candy Bites'),
(27, 'Chocolate_cake_2.png', 'Chocolate Cake'),
(28, 'Chocolate_Cake.png', 'Chocolate Cake'),
(29, 'Mom_Bday.jpeg', 'Mom''s Birthday Cake'),
(30, 'Pink-Rose-Cake.jpg', 'Pink Rose Cake'),
(31, 'Chocolate-jar-cake-Open.jpeg', 'Chocolate Jar Cake'),
(32, 'Chocolate-jar-cake.jpeg', 'Chocolate Open Jar Cake '),
(33, '2-Tier-Chocolate-Cake.jpeg', '2 Tier Chocolate Cake '),
(34, 'Assorted-Chocolate-High-Tea-Platter.jpg', 'Assorted Chocolate High Tea Platter'),
(35, 'Chocolate-chocochips.jpeg', 'Chocolate Choco-Chips Cake'),
(36, 'Chocolate-Crunch-Overload-Cake.jpg', 'Chocolate Crunch Overload Cake'),
(37, 'Strawberry Cake.jpeg', 'Strawberry Cake'),
(38, 'Pink Velvet Floral Elegance Cake.jpeg', 'Pink Velvet Floral Elegance Cake'),
(39, 'Teachers_Day.jpeg', 'Teacher''s Day Cake'),
(40, 'Chocolate-Fruits-Cake.jpeg', 'Chocolate Fruits Cake'),
(41, 'cup-cake-3.jpeg', 'Cup Cake'),
(42, 'Chocolate-Rose-Bouquet-Cake.jpg', 'Chocolate Rose Bouquet Cake'),
(43, 'Cupcake-Match.jpeg', 'Cupcake Match'),
(44, 'Chocolate_Drip_Cake.jpeg', 'Chocolate Drip Cake'),
(45, 'Pineapple_Cake.jpeg', 'Pineapple Cake'),
(46, 'Strawberry_cake_2.jpeg', 'Strawberry Cake'),
(47, 'Pink-Cake.jpeg', 'Pink Cake'),
(48, 'KitKat-Premium-Bday-Cake.jpg', 'Kit Kat Premium Bday Cake'),
(49, 'Glass_cake.jpg', 'Glass Cake'),
(50, 'Combo.jpeg', 'Combo Of Glass Cake & Cup Cake'),
(51, 'Maggie_Cake.jpg', 'Maggie''s Cake'),
(52, 'Elegant-Butterfly-Drip-Cake.jpg', 'Elegant Butterfly Drip Cake'),
(53, 'cup-cake1.jpeg', 'Cup Cake'),
(54, 'Choco_Drip_Black_Forest_Cake.webp', 'Choco Drip Black Forest Cake'),
(55, 'Rainbow_Confetti_Cake.jpg', 'Rainbow Confetti Cake'),
(56, 'Love-Anniversary-Cake.jpeg', 'Love Anniversary Cake'),
(57, 'Glass-Cake.jpeg', 'Glass Cake'),
(58, 'Chocolate_Bento_Drip_Cake.jpg', 'Chocolate Bento Drip Cake'),
(59, '1yr-Anniversary-Bento-Cake.jpg', '1st Year Anniversary Bento Cake'),
(60, '18th_B''day_Chocolate_Bento_Cake_Upper.jpg', '18th Birthday Chocolate Bento Cake'),
(61, 'Yellow_Rose_B''day_Cake.jpg', 'Yellow Rose Birthday Cake'),
(62, 'Vanilla-Cake-2.jpeg', 'Vanilla Cake'),
(63, 'Grass-cake.jpeg', 'Grass Cake'),
(64, 'Light_Chocolate_Birthday_Cake.jpg', 'Light Chocolate Birthday Cake'),
(65, 'Floral_Purple_Bento_Cake.jpg', 'Floral Purple Bento Cake'),
(66, 'Minimalist_Sage_Green_Bento_Cake.jpg', 'Minimalist Sage Green Bento Cake'),
(67, 'Chocolate_Chip_Chocolate_Bento_Cake.jpg', 'Chocolate Chip Chocolate Bento Cake'),
(68, 'Floral_Wreath_Bento_Cake.jpg', 'Floral Wreath Bento Cake'),
(69, 'Fresh_Cream_Pineapple_B''day_Cake.jpg', 'Fresh Cream Pineapple Birthday Cake'),
(70, 'Blueberry_Twilight_Floral_Cake.jpg', 'Blueberry Twilight Floral Cake'),
(71, 'Blushing_Rose_Garden-Cake.jpg', 'Blushing Rose Garden Cake'),
(72, 'Classic_Basketball_Slam_Dunk_Cake.jpg', 'Classic Basketball Slam Dunk Cake'),
(73, 'Crimson_Mirror_Elegance_Glaze_Cake.jpg', 'Crimson Mirror Elegance Glaze Cake'),
(74, 'Patriotic_Pride_Sponge_Cake.jpg', 'Patriotic Pride Sponge Cake'),
(75, 'Royal_Fairy_Tale_Tiered_Cake.jpg', 'Royal Fairy Tale Tiered Cake'),
(76, 'Royal_Lavender_Ribbon_Cake.jpg', 'Royal Lavender Ribbon Cake'),
(77, 'Scarlet_Heart_Anniversary_Cake.jpg', 'Scarlet Heart Anniversary Cake'),
(78, 'The_Pineapple_Abstract_Shard_Cake.jpg', 'The Pineapple Abstract Shard Cake'),
(79, 'The_Sunshine_Clown_Carnival_Cake.jpg', 'The Sunshine Clown Carnival Cake'),
(80, 'Vanilla_Peach_Blossom_Cake.jpg', 'Vanilla Peach Blossom Cake'),
(81, 'White_Forest_Elegance_Cake.jpg', 'White Forest Elegance Cake'),
(82, 'Amour_Blossom_Heart_Cake.jpg', 'Amour Blossom Heart Cake'),
(83, 'Blushing_Bouquet_Anniversary_Two-Tier_Cake.jpg', 'Blushing Bouquet Anniversary Two Tier Cake'),
(84, 'Blushing_Carnival_Rosewood_Cake.jpg', 'Blushing Carnival Rosewood Cake'),
(85, 'Mint_Carnival_Sprinkle_Cake.jpg', 'Mint Carnival Sprinkle Cake'),
(86, 'Onyx_Velvet_Blue_Rose_Cake.jpg', 'Onyx Velvet Blue Rose Cake'),
(87, 'Pink_Ribbon_Rosette_Cake.jpg', 'Pink Ribbon Rosette Cake');

-- ====================================================
-- 6. Synchronize Serial Sequences
-- ====================================================

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('gallery_images_id_seq', (SELECT MAX(id) FROM gallery_images));
