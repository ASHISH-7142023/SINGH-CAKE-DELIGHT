import { MapPin, Clock, Heart, Cake } from "lucide-react";
import { FaInstagram, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

export function Footer({ onWhatsAppClick }: { onWhatsAppClick?: () => void }) {
  return (
    <footer id="contact" className="bg-foreground dark:bg-[#FFF9E6] text-background pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Brand & Intro */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                <img src="/og_cake_og.png" alt="Singh Cake Delight" className="w-full h-full object-cover" />
              </div>
              <span className="font-display font-bold text-2xl tracking-wide text-primary">
                Singh Cake Delight
              </span>
            </div>
            <p className="text-background/70 leading-relaxed max-w-sm">
              Your local destination for 100% homemade, pure eggless cakes crafted with premium ingredients and lots of love. Pickup only.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/singh_cake_delight1981?igsh=MTV0YTRubHdoNDYxNA==" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="/api/order-whatsapp" 
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (onWhatsAppClick) {
                    e.preventDefault();
                    onWhatsAppClick();
                  }
                }}
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
              <a 
                href={`tel:+${["91", "9438", "1315", "76"].join("")}`}
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-foreground transition-colors"
                aria-label="Call Us"
              >
                <FaPhoneAlt className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-xl text-primary">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-background/80">
                  Q/R No. - 8/5, South Colony Road,<br/>
                  Kansbahal, Sundargarh, Odisha, India - 770034
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <FaPhoneAlt className="w-4 h-4 text-primary shrink-0" />
                <a 
                  href={`tel:+${["91", "9438", "1315", "76"].join("")}`} 
                  className="text-background/80 hover:text-primary transition-colors"
                >
                  +91 94381 31576
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <span className="text-background/80">
                  Open from 8:00 AM Daily
                </span>
              </li>
            </ul>
          </div>

          {/* Map Location */}
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-xl text-primary">Find Us</h3>
            <div className="rounded-xl overflow-hidden shadow-lg h-48 border border-white/10 relative group">
              <iframe 
                src="https://maps.google.com/maps?q=Singh%20Cake%20Delight%2C%20Q%2FR%20No.%20-%208%2F5%2C%20S%20Colony%20Rd%2C%20Kansbahal%2C%20Odisha%20770034&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              ></iframe>
            </div>
            <p className="text-sm text-primary/80 italic flex items-center gap-2">
              * Note: We are a home bakery. Pickup only, no delivery available.
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-background/60 text-sm">
          <p>© {new Date().getFullYear()} Singh Cake Delight. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted <Cake className="w-5 h-5 text-primary stroke-[1.5]" /> for Customers
          </p>
        </div>
      </div>
    </footer>
  );
}
