import { MapPin, Phone, Clock, Instagram, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Brand & Intro */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-foreground">
                <span className="text-xl">🎂</span>
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
                href="#" 
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
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
                  Q/R No. - 8/5, S Colony Rd,<br/>
                  Kansbahal, Odisha 770034
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+919658181860" className="text-background/80 hover:text-primary transition-colors">
                  +91 96581 81860
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14806.911855663731!2d84.66205835!3d22.19323035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a201c10d7a0494d%3A0xc34a413d0fc784e1!2sKansbahal%2C%20Odisha%20770034!5e0!3m2!1sen!2sin!4v1709748612151!5m2!1sen!2sin" 
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
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> in Kansbahal
          </p>
        </div>
      </div>
    </footer>
  );
}
