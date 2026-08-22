import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Cake, ShieldCheck, Leaf, Star, CheckCircle2,
  MessageCircle, Navigation, Heart, ChevronsRight, X, Instagram, MapPin,
  ChevronLeft, ChevronRight, CalendarDays, ShoppingBag
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useGallery } from "@/hooks/use-gallery";
import { Navbar } from "@/components/Navbar";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";

import { useIsDark } from "@/hooks/use-is-dark";

export default function Home() {
  const isDark = useIsDark();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: gallery, isLoading: isLoadingGallery } = useGallery();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const [selectedOrderCake, setSelectedOrderCake] = useState<{ name: string; imageUrl?: string } | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formCustomImage, setFormCustomImage] = useState("");
  const [formCustomChanges, setFormCustomChanges] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { data: user } = useQuery<any>({ queryKey: ["/api/me"] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Reference photo must be smaller than 2MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormCustomImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedOrderCake && user) {
      setFormName(user.name || "");
      setFormPhone(user.phone || "");
    }
  }, [selectedOrderCake, user]);

  const getMinPickupDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 4); // Today + 4 days
    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, '0');
    const dd = String(minDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderCake) return;

    // Validate pickup time range (7:00 AM to 8:00 PM)
    if (formTime) {
      const [hour, minute] = formTime.split(":").map(Number);
      if (hour < 7 || hour > 20 || (hour === 20 && minute > 0)) {
        setFormError("Pickup orders can only be scheduled between 7:00 AM and 8:00 PM.");
        return;
      }
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const cleanPhone = formPhone.trim().replace(/\D/g, "");
      const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : (formPhone.trim().startsWith("+") ? formPhone.trim() : `+${cleanPhone}`);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formName,
          customerPhone: formattedPhone,
          cakeName: selectedOrderCake.name,
          cakeImage: selectedOrderCake.imageUrl || "",
          notes: formNotes,
          pickupDate: formDate,
          pickupTime: formTime,
          customImage: formCustomImage || null,
          customChanges: formCustomChanges || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/me/orders"] });
      setFormName("");
      setFormPhone("");
      setFormDate("");
      setFormTime("");
      setFormNotes("");
      setFormCustomImage("");
      setFormCustomChanges("");
      setSelectedOrderCake(null);
      alert("🎉 Your order request has been submitted successfully! We will contact you on WhatsApp to finalize the pickup details.");
    } catch (err: any) {
      setFormError(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleOrder = (productName?: string, productImage?: string) => {
    if (!user) {
      alert("🔒 Please log in or sign up first to place an order and track its status.");
      setLocation("/auth");
      return;
    }
    setSelectedOrderCake({
      name: productName || "Custom Customization Inquiry",
      imageUrl: productImage || ""
    });
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      <Navbar />
      <FloatingActions onWhatsAppClick={() => handleOrder()} />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className={`absolute inset-0 z-0 ${isDark ? "" : "bg-[#f3f0ea]"}`}>
          {/* landing page hero gorgeous bakery cake */}
          <img
            src={isDark ? "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2070&auto=format&fit=crop" : "/wedding-cake.jpeg"}
            alt="Gorgeous beautifully decorated cake"
            className={isDark 
              ? `w-full h-full object-cover scale-105 transform animate-[pulse_20s_ease-in-out_infinite_alternate]` 
              : `w-full h-full object-cover object-center md:absolute md:right-0 md:top-0 md:w-auto md:h-full md:object-contain md:object-right`
            }
            style={isDark ? {} : {
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
            }}
          />
          {/* Horizontal dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent dark:from-[#2a1810]/85 dark:via-[#3d261c]/60 dark:to-transparent"></div>
          {/* Bottom fade to transition to the next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-background to-transparent"></div>
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
                variant="outline"
                onClick={() => handleOrder()}
                className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full px-7 py-5 text-base font-semibold backdrop-blur-md transition-all hover:-translate-y-1"
              >
                <ShoppingBag className="mr-2 w-5 h-5 text-green-400" />
                Place Order
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://www.instagram.com/singh_cake_delight1981?igsh=MTV0YTRubHdoNDYxNA==', '_blank')}
                className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full px-7 py-5 text-base font-semibold backdrop-blur-md transition-all hover:-translate-y-1"
              >
                <Instagram className="mr-2 w-5 h-5 text-pink-400" />
                Instagram
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://maps.app.goo.gl/ZwCiakRoNcVbL9LK7', '_blank')}
                className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full px-7 py-5 text-base font-semibold backdrop-blur-md transition-all hover:-translate-y-1"
              >
                <MapPin className="mr-2 w-5 h-5 text-red-400" />
                Directions
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-4 text-base text-white font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Pickup Only</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Pre-order Required</span>
            </motion.div>
          </motion.div>
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
                <div className="mx-auto w-16 h-16 rounded-2xl bg-pink-100/80 dark:bg-primary/10 flex items-center justify-center text-pink-600 dark:text-primary mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-primary-foreground duration-300">
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
            <span className="text-pink-600 dark:text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Menu</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Signature Delights</h2>
            <p className="text-muted-foreground text-lg">Browse our most loved cake flavors. Every cake can be customized for your specific occasion and to make your day a memorable one.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {isLoadingProducts ? (
              // Skeleton loading state
              Array(5).fill(0).map((_, i) => (
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
                    className={`w-full h-full object-cover transition-transform duration-500 transform ${
                      product.name === "Box Cake" 
                        ? "scale-125 group-hover:scale-[1.32]" 
                        : "scale-100 group-hover:scale-105"
                    }`}
                    style={{
                      objectPosition: product.imageUrl === "Chocolate-jar-cake.jpeg" ? "center 75%" : "center"
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-black/40 border border-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-medium text-white tracking-wide shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-display font-bold text-xl mb-2 text-foreground">{product.name}</h3>
                  <p className="text-muted-foreground text-sm flex-grow mb-6">{product.description}</p>
                  <Button
                    onClick={() => handleOrder(product.name, product.imageUrl)}
                    variant="outline"
                    className="w-full rounded-full border border-foreground/15 dark:border-white/20 bg-foreground/5 dark:bg-white/10 backdrop-blur-md hover:bg-foreground hover:text-background text-foreground dark:text-white transition-all duration-300 font-medium py-2.5 shadow-sm"
                  >
                    Place Your Order
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
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-2xl mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 ${isDark
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
              className={`w-full sm:w-auto max-w-sm rounded-full px-10 py-7 text-lg font-bold flex items-center justify-center gap-2 mx-auto ${isDark
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
              <span className="text-pink-600 dark:text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Work</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Cake Gallery</h2>
            </div>
            <p className="text-muted-foreground max-w-md">Take a look at some of our recent custom creations. Every design is crafted with attention to detail to make your day special.</p>
          </div>

          <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
            {isLoadingGallery ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-muted rounded-2xl w-full h-64 animate-pulse mb-4 inline-block"></div>
              ))
            ) : gallery?.map((img, i) => (
              <motion.div
                key={img.id}
                initial={isDark ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={isDark ? { delay: (i % 4) * 0.1 } : { duration: 0 }}
                className={`relative overflow-hidden rounded-2xl mb-4 inline-block w-full cursor-pointer break-inside-avoid border border-border/40 ${isDark ? "group shadow-sm hover:shadow-xl transition-all duration-300" : ""
                  }`}
                onClick={() => setSelectedImageIndex(i)}
              >
                <img
                  src={img.imageUrl}
                  alt={img.altText}
                  className={`w-full h-auto object-cover ${isDark ? "group-hover:scale-105 transition-transform duration-500" : ""}`}
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${isDark ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300" : "opacity-0 hover:opacity-100"
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
              { name: "Satyajit Sethy", text: "Not only was the custom design breathtaking, but the sponge was unbelievably moist and delicious. Hands down the best cake we've ever ordered!", date: "1 week ago" },
              { name: "Surya Narayan Debata", text: "Exceeded every expectation. The design was elegant, modern, and exactly what I envisioned. When we tasted it, we were blown away—rich, flavorful, and not overly sweet. A perfect 10/10!", date: "2 weeks ago" },
              { name: "Gourav Mishra", text: "I ordered a custom cake from here for my anniversary and it was perfect! The design was exactly as I imagined and the taste was amazing. Highly recommend!", date: "2 months ago" },
              { name: "Yashaswee Mishra", text: "Delicious Cake as Always 😍😍", date: "3 months ago" },
              { name: "Pratik Sahoo", text: "I went there with my gf once and we tried the chocolate cake, it was surprisingly delicious. Definitely a must try", date: "3 months ago" },
              { name: "Sailesh Sekhar Sahoo", text: "This bakery truly knows how to create happiness in every bite. The cake was incredibly soft, moist, and full of flavor. It made our celebration extra special. Thank you for such amazing quality and service. Will definitely come back again! 👍😁", date: "3 months ago" }
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={isDark ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={isDark ? { delay: i * 0.15 } : { duration: 0 }}
                className={`bg-card p-8 rounded-3xl border border-border/40 relative ${isDark ? "fancy-shadow" : ""
                  }`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FABB05] text-[#FABB05]" />)}
                </div>
                <p className="text-foreground/80 italic mb-6 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100/85 dark:bg-primary/20 text-pink-700 dark:text-primary flex items-center justify-center font-bold font-display">
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
      <Footer onWhatsAppClick={() => handleOrder()} />

      {/* Image Lightbox Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
        <DialogContent className="max-w-5xl bg-transparent border-none shadow-none p-0 flex justify-center items-center lightbox-content">
          {selectedImageIndex !== null && gallery && gallery[selectedImageIndex] && (
            <div className="relative w-full max-w-4xl min-h-[50vh] min-w-[280px] sm:min-w-[500px] mx-auto flex flex-col items-center justify-center">
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
              <div className="relative p-2 flex flex-col items-center justify-center overflow-hidden w-full">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  src={gallery[selectedImageIndex].imageUrl}
                  alt={gallery[selectedImageIndex].altText || "Enlarged cake view"}
                  className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl object-contain transition-transform duration-500 ease-out cursor-pointer"
                />
                
                {/* Caption & Order Button */}
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 w-full justify-between bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg text-white">
                  <div className="text-left w-full sm:w-auto">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Gallery Custom Cake</p>
                    <p className="font-display font-bold text-lg text-primary">{gallery[selectedImageIndex].altText}</p>
                  </div>
                  <Button
                    onClick={() => handleOrder(gallery[selectedImageIndex].altText, gallery[selectedImageIndex].imageUrl)}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold rounded-full px-6 py-2.5 flex items-center justify-center gap-2 transition-all border border-white/30 backdrop-blur-md"
                  >
                    <ShoppingBag className="w-5 h-5 text-green-400" />
                    Place Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Web Order Form Dialog */}
      <Dialog open={selectedOrderCake !== null} onOpenChange={(open) => !open && setSelectedOrderCake(null)}>
        <DialogContent className="max-w-md w-full rounded-2xl p-6 bg-card border border-border text-foreground fancy-shadow max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {selectedOrderCake && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-2xl text-foreground">Place Order Request</h3>
                  <p className="text-muted-foreground text-xs">Fill in your details below to request a cake booking.</p>
                </div>
              </div>

              {/* Takeaway / Pickup Notice Callout */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex gap-2.5 items-start">
                <span className="text-base leading-none">⚠️</span>
                <div className="flex-grow space-y-1">
                  <p className="font-bold">Pickup Only / 4-Day Advance Order Required</p>
                  <p className="leading-relaxed opacity-95">
                    We are a home bakery in <strong>South Colony, Kansbahal</strong>. We do <strong>NOT</strong> provide delivery. Orders must be submitted at least <strong>4 days in advance</strong>.
                  </p>
                </div>
              </div>

              {/* Selected Cake Details */}
              {selectedOrderCake.imageUrl && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <img src={selectedOrderCake.imageUrl} alt={selectedOrderCake.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Selected Item</p>
                    <p className="font-display font-semibold text-sm text-foreground">{selectedOrderCake.name}</p>
                  </div>
                </div>
              )}

              {/* Order Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="customerName" className="text-xs font-semibold text-muted-foreground">Your Name *</label>
                  <input
                    id="customerName"
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="customerPhone" className="text-xs font-semibold text-muted-foreground">WhatsApp Phone Number *</label>
                  <input
                    id="customerPhone"
                    required
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="text-xs font-semibold text-muted-foreground">Pickup Date *</label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm font-normal text-left justify-start text-foreground focus:border-primary transition-all flex items-center gap-2 h-10 hover:bg-background"
                        >
                          <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                          {formDate ? format(parse(formDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : <span className="text-muted-foreground/60">dd/mm/yyyy</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border border-border rounded-xl shadow-xl z-[9999]" align="start">
                        <Calendar
                          mode="single"
                          selected={formDate ? parse(formDate, "yyyy-MM-dd", new Date()) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setFormDate(format(date, "yyyy-MM-dd"));
                            } else {
                              setFormDate("");
                            }
                            setIsDatePickerOpen(false);
                          }}
                          disabled={(date) => {
                            const minDate = new Date();
                            minDate.setDate(minDate.getDate() + 4);
                            minDate.setHours(0, 0, 0, 0);
                            return date < minDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pickupTime" className="text-xs font-semibold text-muted-foreground">Pickup Time *</label>
                    <input
                      id="pickupTime"
                      required
                      type="time"
                      min="07:00"
                      max="20:00"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-xs font-semibold text-muted-foreground">Special Customizations / Notes</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Eggless flavor customizations, text written on the cake, tier requests, shape preferences, etc."
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Add Reference Photo (Optional)</label>
                  {!formCustomImage ? (
                    <div className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors bg-secondary/10 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">Click to upload reference image (Max 2MB)</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-secondary/20 relative">
                      <img src={formCustomImage} alt="Reference Preview" className="w-12 h-12 rounded-lg object-cover border border-border" />
                      <div className="flex-grow min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Photo Selected</p>
                        <p className="text-xs truncate text-foreground/80">Reference image ready</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormCustomImage("")}
                        className="p-1.5 rounded-lg bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="customChanges" className="text-xs font-semibold text-muted-foreground">Changes You Want (Optional)</label>
                  <textarea
                    id="customChanges"
                    rows={2}
                    value={formCustomChanges}
                    onChange={(e) => setFormCustomChanges(e.target.value)}
                    placeholder="Specify any design modifications or color changes you want"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-red-500 text-xs font-medium">{formError}</p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-full flex items-center justify-center gap-2 mt-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Pickup Order"}
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
