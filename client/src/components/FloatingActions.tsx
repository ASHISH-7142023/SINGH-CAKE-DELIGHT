import { MessageCircle, Phone } from "lucide-react";
import { useIsDark } from "@/hooks/use-is-dark";

export function FloatingActions() {
  const isDark = useIsDark();
  const WHATSAPP_URL = "https://wa.me/919658181860";
  const PHONE_URL = "tel:+919658181860";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Phone Button */}
      <button
        onClick={() => window.open(PHONE_URL)}
        className={`group relative flex items-center justify-center w-14 h-14 bg-secondary text-secondary-foreground rounded-full border border-border/40 ${
          isDark ? "shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300" : ""
        }`}
        aria-label="Call Us"
      >
        <Phone className={`w-6 h-6 ${isDark ? "group-hover:scale-110 transition-transform" : ""}`} />
        <span className="absolute right-full mr-4 bg-foreground text-background text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Call Us
        </span>
      </button>

      {/* WhatsApp Button */}
      <button
        onClick={() => window.open(WHATSAPP_URL, '_blank')}
        className={`group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full ${
          isDark ? "shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300" : ""
        }`}
        aria-label="Order on WhatsApp"
      >
        <MessageCircle className={`w-7 h-7 ${isDark ? "group-hover:scale-110 transition-transform" : ""}`} />
        <span className="absolute right-full mr-4 bg-foreground text-background text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Order on WhatsApp
        </span>
      </button>
    </div>
  );
}
