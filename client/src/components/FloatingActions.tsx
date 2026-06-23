import { Instagram } from "lucide-react";
import { useIsDark } from "@/hooks/use-is-dark";

export function FloatingActions({ onWhatsAppClick }: { onWhatsAppClick?: () => void }) {
  const isDark = useIsDark();
  const WHATSAPP_URL = "/api/order-whatsapp";
  const INSTAGRAM_URL = "https://www.instagram.com/singh_cake_delight1981?igsh=MTV0YTRubHdoNDYxNA==";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Instagram Button */}
      <button
        onClick={() => window.open(INSTAGRAM_URL, '_blank')}
        className={`group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-full border border-border/40 ${
          isDark ? "shadow-lg shadow-pink-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300" : ""
        }`}
        aria-label="Instagram Inquiry"
      >
        <Instagram className={`w-6 h-6 ${isDark ? "group-hover:scale-110 transition-transform" : ""}`} />
        <span className="absolute right-full mr-4 bg-foreground text-background text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Instagram Inquiry
        </span>
      </button>

      {/* Place Order Button */}
      <button
        onClick={() => {
          if (onWhatsAppClick) {
            onWhatsAppClick();
          } else {
            window.open(WHATSAPP_URL, '_blank');
          }
        }}
        className={`group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full ${
          isDark ? "shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300" : ""
        }`}
        aria-label="Place Order"
      >
        <img 
          src="/shopping-bag.png" 
          alt="Place Order" 
          className={`w-9 h-9 object-contain ${isDark ? "group-hover:scale-110 transition-transform" : ""}`} 
        />
        <span className="absolute right-full mr-4 bg-foreground text-background text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Place Order
        </span>
      </button>
    </div>
  );
}
