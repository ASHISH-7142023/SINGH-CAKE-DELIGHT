import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Cake, ShieldCheck, Leaf, Star, CheckCircle2, 
  MessageCircle, Navigation, Heart, ChevronsRight, X, Instagram, MapPin,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useGallery } from "@/hooks/use-gallery";
import { Navbar } from "@/components/Navbar";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";

import { useIsDark } from "@/hooks/use-is-dark";

export default function Home() {
  const isDark = useIsDark();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: gallery, isLoading: isLoadingGallery } = useGallery();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handlePrevImage = () => {
    if (!gallery || selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => 
      prev !== null && prev > 0 ? prev - 1 : gallery.length - 1
    );
  };

  const handleNextImage = () => {
    if (!gallery || selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => 
      prev !== null && prev < gallery.length - 1 ? prev + 1 : 0
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, gallery]);

  const WHATSAPP_NUMBER = "919658181860";

  // Animation variants dynamic based on isDark
  const fadeInUp = isDark ? {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } : {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0 } }
  };

  const staggerContainer = isDark ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  } : {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { duration: 0 }
    }
  };
  
  const handleOrder = (productName?: string) => {
    const text = productName 
      ? `Hi! I'd like to inquire about ordering the ${productName} cake.` 
      : "Hi! I'd like to place an order for a cake.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      <Navbar />
      <FloatingActions />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          {/* landing page hero gorgeous bakery cake */}
          <img 
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2070&auto=format&fit=crop" 
            alt="Gorgeous beautifully decorated cake"
            className={`w-full h-full object-cover ${isDark ? "scale-105 transform animate-[pulse_20s_ease-in-out_infinite_alternate]" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent dark:from-[#2a1810]/85 dark:via-[#3d261c]/60 dark:to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={`max-w-2xl text-white mr-auto text-left ${isDark ? "transition-all duration-700" : ""}`}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 mb-6">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium tracking-wide text-primary-foreground/90">5-Star Rated in Kansbahal</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-balance">
              Delight In <span className="text-primary italic">Every Bite</span>{" "}
              <img src="/new_cake.png" alt="Cake Icon" className="w-12 h-12 md:w-16 md:h-16 inline-block align-middle ml-2" />
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/90 mb-10 text-balance leading-relaxed">
              100% Homemade, Pure Eggless Cakes crafted with premium ingredients and lots of love. Experience the perfect celebration centerpiece.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button 
                onClick={() => handleOrder()}
                className={`w-full sm:w-auto bg-[#25D366] hover:bg-[#1fb855] text-white rounded-full px-7 py-5 text-base font-semibold ${
                  isDark ? "shadow-lg shadow-[#25D366]/25 hover:shadow-xl transition-all hover:-translate-y-1" : ""
                }`}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                WhatsApp
              </Button>
              <Button 
                onClick={() => window.open('https://www.instagram.com/singh_cake_delight', '_blank')}
                className={`w-full sm:w-auto bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white rounded-full px-7 py-5 text-base font-semibold ${
                  isDark ? "shadow-lg transition-all hover:-translate-y-1" : ""
                }`}
              >
                <Instagram className="mr-2 w-5 h-5" />
                Instagram
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://goo.gl/maps/YourMapsLinkHere', '_blank')}
                className={`w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full px-7 py-5 text-base font-semibold backdrop-blur-sm ${
                  isDark ? "transition-all hover:-translate-y-1" : ""
                }`}
              >
                <MapPin className="mr-2 w-5 h-5 text-red-400" />
                Directions
              </Button>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-4 text-sm text-white/70 font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary" /> Pickup Only</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary" /> Pre-order Required</span>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Decorative bottom wave/curve */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 rotate-180">
          <svg className="block w-full h-[50px] md:h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-background"></path>
          </svg>
        </div>
      </section>

      {/* WHY CHOOSE US / FEATURES */}
      <section className="py-20 bg-background relative" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Heart, title: "100% Homemade", desc: "Baked fresh in our home kitchen with absolute hygiene." },
              { icon: Leaf, title: "Pure Eggless", desc: "Strictly vegetarian recipes with no compromise on softness." },
              { icon: ShieldCheck, title: "Fresh Ingredients", desc: "No artificial preservatives, only premium quality ingredients." },
              { icon: Star, title: "Made with Love", desc: "Every cake is handcrafted uniquely for your celebration." },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-card p-8 rounded-2xl border border-border/50 text-center fancy-shadow group hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-primary-foreground duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* OUR PRODUCTS */}
      <section className={`py-24 ${isDark ? "bg-secondary/30" : "bg-background"}`} id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Menu</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Signature Delights</h2>
            <p className="text-muted-foreground text-lg">Browse our most loved cake flavors. Every cake can be customized for your specific occasion.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingProducts ? (
              // Skeleton loading state
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-3xl overflow-hidden border border-border/30 dark:border-white/5 flex flex-col fancy-shadow animate-pulse">
                  <div className="w-full aspect-square bg-muted"></div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-5/6 mb-6"></div>
                    <div className="h-10 bg-muted rounded-full w-full"></div>
                  </div>
                </div>
              ))
            ) : products?.map((product) => (
              <motion.div 
                key={product.id}
                initial={isDark ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={isDark ? { duration: 0.5 } : { duration: 0 }}
                className="bg-card rounded-3xl overflow-hidden border border-border/30 dark:border-white/5 flex flex-col fancy-shadow group cursor-pointer"
              >
                <div className="relative w-full aspect-square overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-medium text-white tracking-wide shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-display font-bold text-xl mb-2 text-foreground">{product.name}</h3>
                  <p className="text-muted-foreground text-sm flex-grow mb-6">{product.description}</p>
                  <Button 
                    onClick={() => handleOrder(product.name)}
                    variant="outline"
                    className="w-full rounded-full border-foreground/25 bg-transparent hover:bg-foreground hover:text-background text-foreground transition-all duration-300 font-medium py-2.5"
                  >
                    Order via WhatsApp
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO ORDER */}
      <section className={`py-24 relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#20130d] text-[#F2E6DF]" : "bg-background text-[#2D1E17]"}`}>
        {/* Background Decorative SVGs */}
        {/* Top-Left Swirl */}
        <div className="absolute top-0 left-0 w-72 h-72 opacity-25 dark:opacity-10 pointer-events-none select-none hidden dark:block">
          <svg className="w-full h-full text-[#a67c65]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M 10,10 C 50,10 80,30 90,60 C 95,80 85,95 75,95 C 65,95 55,85 60,70 C 65,50 90,40 110,60 C 130,80 120,110 100,120 C 80,130 60,110 60,90 C 60,70 80,60 95,75" />
            <path d="M 10,40 C 40,40 60,50 70,70 C 75,80 70,90 60,90 C 50,90 45,80 48,70 C 52,55 70,50 85,65 C 100,80 90,100 80,105 C 70,110 55,100 55,85" />
            <path d="M 10,80 C 30,80 40,90 40,100 C 40,105 35,110 30,110 C 25,110 20,105 22,98 C 25,90 35,90 42,98" />
          </svg>
        </div>
        
        {/* Bottom-Left Swirl (Flipped/Rotated) */}
        <div className="absolute bottom-0 left-0 w-72 h-72 opacity-25 dark:opacity-10 pointer-events-none select-none transform scale-y-[-1] hidden dark:block">
          <svg className="w-full h-full text-[#a67c65]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M 10,10 C 50,10 80,30 90,60 C 95,80 85,95 75,95 C 65,95 55,85 60,70 C 65,50 90,40 110,60 C 130,80 120,110 100,120 C 80,130 60,110 60,90 C 60,70 80,60 95,75" />
            <path d="M 10,40 C 40,40 60,50 70,70 C 75,80 70,90 60,90 C 50,90 45,80 48,70 C 52,55 70,50 85,65 C 100,80 90,100 80,105 C 70,110 55,100 55,85" />
            <path d="M 10,80 C 30,80 40,90 40,100 C 40,105 35,110 30,110 C 25,110 20,105 22,98 C 25,90 35,90 42,98" />
          </svg>
        </div>

        {/* Top-Right Utensils */}
        <div className="absolute top-0 right-0 w-80 h-80 opacity-25 dark:opacity-10 pointer-events-none select-none hidden dark:block">
          <svg className="w-full h-full text-[#a67c65]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Rolling pin tilted */}
            <g transform="rotate(-30 130 60)">
              <path d="M 80,57 C 75,57 75,63 80,63 L 90,63 L 90,57 Z" />
              <rect x="90" y="52" width="70" height="16" rx="2" />
              <path d="M 160,57 L 170,57 C 175,57 175,63 170,63 Z" />
            </g>
            {/* Mixing bowl */}
            <path d="M 110,120 C 110,150 160,150 160,120 L 165,110 L 105,110 Z" />
            <path d="M 125,110 L 115,90" />
            {/* Swirls */}
            <path d="M 170,170 C 150,180 130,170 120,150 C 115,140 120,130 130,130 C 140,130 145,140 140,150" />
          </svg>
        </div>

        {/* Bottom-Right Utensils & Sparkles */}
        <div className="absolute bottom-0 right-0 w-80 h-80 opacity-25 dark:opacity-10 pointer-events-none select-none hidden dark:block">
          <svg className="w-full h-full text-[#a67c65]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Whisk */}
            <g transform="rotate(45 80 120)">
              <rect x="77" y="130" width="6" height="30" rx="1" />
              <path d="M 80,130 C 70,110 70,80 80,75 C 90,80 90,110 80,130" />
              <path d="M 80,130 C 75,110 75,85 80,80 C 85,85 85,110 80,130" />
              <path d="M 80,130 C 65,110 65,90 80,85 C 95,90 95,110 80,130" />
            </g>
            {/* Rolling pin */}
            <g transform="translate(40, 60) rotate(15)">
              <path d="M 20,40 L 30,40" />
              <rect x="30" y="35" width="80" height="10" rx="1" />
              <path d="M 110,40 L 120,40" />
            </g>
            {/* Pastry board / line */}
            <path d="M 10,140 C 30,150 40,130 60,140" />
            {/* Sparkles */}
            <path d="M 150,80 L 153,70 L 156,80 L 166,83 L 156,86 L 153,96 L 150,86 L 140,83 Z" fill="currentColor" opacity="0.3" />
            <path d="M 120,40 L 122,35 L 124,40 L 129,42 L 124,44 L 122,49 L 120,44 L 115,42 Z" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#2D1E17] dark:text-[#F2E6DF]">How to Order</h2>
            <p className="text-[#5C4338] dark:text-[#D4BCAE] text-lg max-w-2xl mx-auto">Ordering your custom cake is as easy as 1-2-3.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {[
              { step: "01", title: "Reach Out", desc: "Message us on WhatsApp or call us to share your requirements and date." },
              { step: "02", title: "Customize", desc: "Pick your flavor, design, and size. We'll confirm the price and details." },
              { step: "03", title: "Pick Up", desc: "Collect your freshly baked cake from our Kansbahal home bakery on your date." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={isDark ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={isDark ? { delay: i * 0.2, duration: 0.5 } : { duration: 0 }}
                className="relative z-10 flex flex-col items-center text-center px-4 group cursor-pointer"
              >
                {/* Clean dark circular badge */}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-2xl mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                    isDark 
                      ? "bg-[#1a0f0a] text-[#E6C5A3] border border-[#986E55]/30 shadow-[0_0_15px_rgba(195,155,132,0.15)]" 
                      : "bg-[#241812] text-white shadow-lg shadow-black/10 border border-[#241812]/10"
                  }`}
                >
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-2xl mb-3 text-[#2D1E17] dark:text-[#F2E6DF]">{item.title}</h3>
                <p className="text-[#5C4338] dark:text-[#D4BCAE] leading-relaxed max-w-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              size="lg"
              onClick={() => handleOrder()}
              className={`w-full sm:w-auto max-w-sm rounded-full px-10 py-7 text-lg font-bold flex items-center justify-center gap-2 mx-auto ${
                isDark 
                  ? "bg-[#1a0f0a] hover:bg-[#241812] text-[#E6C5A3] border border-[#986E55]/30 shadow-[0_0_15px_rgba(195,155,132,0.15)] transition-all duration-300 hover:-translate-y-0.5" 
                  : "bg-[#241812] hover:bg-[#322219] text-white border border-[#241812] shadow-md"
              }`}
            >
              Start Your Order <ChevronsRight className={`ml-1 w-5 h-5 ${isDark ? "text-[#E6C5A3]" : "text-white"}`} />
            </Button>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-24 bg-background" id="gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Work</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Cake Gallery</h2>
            </div>
            <p className="text-muted-foreground max-w-md">Take a look at some of our recent custom creations. Every design is crafted with attention to detail.</p>
          </div>

          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {isLoadingGallery ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-muted rounded-2xl w-full h-64 animate-pulse mb-4 inline-block"></div>
              ))
            ) : gallery?.map((img, i) => (
              <motion.div 
                key={img.id}
                initial={isDark ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={isDark ? { delay: (i % 3) * 0.1 } : { duration: 0 }}
                className={`relative overflow-hidden rounded-2xl mb-4 inline-block w-full cursor-pointer break-inside-avoid border border-border/40 ${
                  isDark ? "group shadow-sm hover:shadow-xl transition-all duration-300" : ""
                }`}
                onClick={() => setSelectedImageIndex(i)}
              >
                <img 
                  src={img.imageUrl} 
                  alt={img.altText} 
                  className={`w-full h-auto object-cover ${isDark ? "group-hover:scale-105 transition-transform duration-500" : ""}`}
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${
                  isDark ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300" : "opacity-0 hover:opacity-100"
                }`}>
                  <span className="text-white font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">View Image</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className={`py-24 border-t border-border/30 ${isDark ? "bg-secondary/20" : "bg-background"}`} id="reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Happy Customers</h2>
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-foreground">
              4.9 <div className="flex gap-1"><Star className="w-5 h-5 fill-[#FABB05] text-[#FABB05]" /><Star className="w-5 h-5 fill-[#FABB05] text-[#FABB05]" /><Star className="w-5 h-5 fill-[#FABB05] text-[#FABB05]" /><Star className="w-5 h-5 fill-[#FABB05] text-[#FABB05]" /><Star className="w-5 h-5 fill-[#FABB05] text-[#FABB05]" /></div>
            </div>
            <p className="text-muted-foreground mt-2">Based on local Google Reviews in Kansbahal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Priya S.", text: "Absolutely loved the Black Forest cake! The sponge was so soft even though it was completely eggless. Will definitely order again for all family birthdays.", date: "1 month ago" },
              { name: "Rahul M.", text: "Best home baker in Kansbahal. The custom design was exactly what we asked for, and the taste was incredible. Highly recommend the Rose Pistachio flavor.", date: "2 months ago" },
              { name: "Ananya K.", text: "Fresh, delicious, and perfectly sweetened. You can tell she uses high-quality ingredients. The pickup process was smooth and the packaging was lovely.", date: "3 weeks ago" },
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial={isDark ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={isDark ? { delay: i * 0.15 } : { duration: 0 }}
                className={`bg-card p-8 rounded-3xl border border-border/40 relative ${
                  isDark ? "fancy-shadow" : ""
                }`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FABB05] text-[#FABB05]" />)}
                </div>
                <p className="text-foreground/80 italic mb-6 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-display">
                      {review.name.charAt(0)}
                    </div>
                    <span className="font-bold text-foreground">{review.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Image Lightbox Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
        <DialogContent className="max-w-5xl bg-transparent border-none shadow-none p-0 flex justify-center items-center lightbox-content">
          {selectedImageIndex !== null && gallery && gallery[selectedImageIndex] && (
            <div className="relative w-full max-w-4xl min-h-[50vh] min-w-[280px] sm:min-w-[500px] mx-auto flex items-center justify-center">
              {/* Prev Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 md:-left-16 z-50 text-white hover:text-primary transition-all bg-black/40 hover:bg-black/60 rounded-full p-3 backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 md:-right-16 z-50 text-white hover:text-primary transition-all bg-black/40 hover:bg-black/60 rounded-full p-3 backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedImageIndex(null)}
                className="absolute -top-12 right-4 md:right-0 text-white hover:text-primary transition-colors bg-black/20 rounded-full p-2 backdrop-blur-sm z-50"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Image Container */}
              <div className="relative p-2 flex justify-center items-center overflow-hidden">
                <motion.img 
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  src={gallery[selectedImageIndex].imageUrl} 
                  alt={gallery[selectedImageIndex].altText || "Enlarged cake view"} 
                  className="max-h-[80vh] w-auto max-w-full rounded-lg shadow-2xl object-contain hover:scale-[1.02] transition-transform duration-500 ease-out cursor-pointer"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
