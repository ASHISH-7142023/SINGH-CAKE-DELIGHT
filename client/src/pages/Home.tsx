import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Cake, ShieldCheck, Leaf, Star, CheckCircle2, 
  MessageCircle, Navigation, Heart, ChevronRight, X
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useGallery } from "@/hooks/use-gallery";
import { Navbar } from "@/components/Navbar";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { useState } from "react";

// Fade in up animation variant
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: gallery, isLoading: isLoadingGallery } = useGallery();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const WHATSAPP_NUMBER = "919658181860";
  
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
            className="w-full h-full object-cover scale-105 transform animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl text-white"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 mb-6">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium tracking-wide text-primary-foreground/90">5-Star Rated in Kansbahal</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-balance">
              Delight In <span className="text-primary italic">Every Bite</span> 🎂
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/90 mb-10 text-balance leading-relaxed">
              100% Homemade, Pure Eggless Cakes crafted with premium ingredients and lots of love. Experience the perfect celebration centerpiece.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Button 
                onClick={() => handleOrder()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Order on WhatsApp
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://goo.gl/maps/YourMapsLinkHere', '_blank')}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all hover:-translate-y-1"
              >
                <Navigation className="mr-2 w-5 h-5" />
                Get Directions
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
              <motion.div key={i} variants={fadeInUp} className="bg-card p-8 rounded-2xl fancy-shadow border border-border/50 text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-primary-foreground">
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
      <section className="py-24 bg-secondary/30" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Menu</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Signature Delights</h2>
            <p className="text-muted-foreground text-lg">Browse our most loved cake flavors. Every cake can be customized for your specific occasion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingProducts ? (
              // Skeleton loading state
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-4 fancy-shadow animate-pulse">
                  <div className="w-full h-48 bg-muted rounded-xl mb-4"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-5/6 mb-6"></div>
                  <div className="h-10 bg-muted rounded-full w-full"></div>
                </div>
              ))
            ) : products?.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-card rounded-3xl overflow-hidden fancy-shadow border border-border/50 group flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-foreground">
                    {product.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-display font-bold text-xl mb-2 text-foreground">{product.name}</h3>
                  <p className="text-muted-foreground text-sm flex-grow mb-6">{product.description}</p>
                  <Button 
                    onClick={() => handleOrder(product.name)}
                    className="w-full rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground transition-colors group-hover:shadow-md"
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
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">How to Order</h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Ordering your custom cake is as easy as 1-2-3.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-primary-foreground/20 -translate-y-1/2 z-0"></div>

            {[
              { step: "01", title: "Reach Out", desc: "Message us on WhatsApp or call us to share your requirements and date." },
              { step: "02", title: "Customize", desc: "Pick your flavor, design, and size. We'll confirm the price and details." },
              { step: "03", title: "Pick Up", desc: "Collect your freshly baked cake from our Kansbahal home bakery on your date." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center text-center px-4"
              >
                <div className="w-20 h-20 rounded-full bg-background text-primary flex items-center justify-center font-display font-bold text-3xl mb-6 shadow-xl border-4 border-primary">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-2xl mb-3">{item.title}</h3>
                <p className="text-primary-foreground/80">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              size="lg"
              onClick={() => handleOrder()}
              className="bg-background text-primary hover:bg-background/90 rounded-full px-8 py-6 text-lg font-bold shadow-xl"
            >
              Start Your Order <ChevronRight className="ml-2 w-5 h-5" />
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
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="relative group overflow-hidden rounded-2xl mb-4 inline-block w-full cursor-pointer break-inside-avoid shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedImage(img.imageUrl)}
              >
                <img 
                  src={img.imageUrl} 
                  alt={img.altText} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">View Image</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="py-24 bg-secondary/20 border-t border-border/30" id="reviews">
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card p-8 rounded-3xl fancy-shadow border border-border/40 relative"
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
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl bg-transparent border-none shadow-none p-0 flex justify-center items-center lightbox-content">
          {selectedImage && (
            <div className="relative">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 md:-right-12 text-white hover:text-primary transition-colors bg-black/20 rounded-full p-2 backdrop-blur-sm"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={selectedImage} 
                alt="Enlarged cake view" 
                className="max-h-[85vh] w-auto max-w-full rounded-lg shadow-2xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
