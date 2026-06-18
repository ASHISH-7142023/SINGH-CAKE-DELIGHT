import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, PhoneCall, User as UserIcon, Calendar, Clock, LogOut, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CakeThemeToggle } from "./CakeThemeToggle";
import { useIsDark } from "@/hooks/use-is-dark";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Navbar() {
  const isDark = useIsDark();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/me"],
    retry: false,
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ["/api/me/orders"],
    enabled: !!user && isProfileOpen,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      setIsProfileOpen(false);
      setLocation("/auth");
    },
  });

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Products", href: "#products" },
    { name: "Gallery", href: "#gallery" },
    { name: "Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const formattedDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatTimeTo12Hour = (timeStr: string) => {
    try {
      if (!timeStr) return "N/A";
      const [hoursStr, minutesStr] = timeStr.split(":");
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      if (isNaN(hours) || isNaN(minutes)) return timeStr;
      const ampm = hours >= 12 ? "pm" : "am";
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const displayMinutes = String(minutes).padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-nav py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${
              isDark ? "transition-transform group-hover:scale-110" : ""
            }`}>
              <img src="/og_cake_og.png" alt="Singh Cake Delight" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl leading-none text-foreground tracking-wide">
                Singh Cake Delight
              </span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                Pure Eggless
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base font-medium text-foreground/80 hover:text-pink-600 dark:hover:text-primary transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-pink-600 dark:after:bg-primary after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
            <CakeThemeToggle />
            <Button 
              className={`rounded-full bg-red-600 hover:bg-red-700 text-white ml-2 h-11 px-5 text-sm font-semibold flex items-center gap-1.5 ${
                isDark 
                  ? "shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 transition-all hover:-translate-y-0.5" 
                  : ""
              }`}
              onClick={() => window.open('tel:+' + ["91", "9438", "1315", "76"].join(""))}
            >
              <PhoneCall className="w-4 h-4" />
              Call Now
            </Button>

            {/* Logged in User Avatar Button */}
            {user && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold font-display hover:brightness-110 transition-all active:scale-95 shadow-md"
                style={{
                  backgroundColor: isDark ? "#7B3F00" : "#D7C4B7",
                  color: isDark ? "#FFF9E6" : "#241812",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)"
                }}
                title="View Account Details & Order History"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
          </nav>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-3 md:hidden">
            {user && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold hover:brightness-110 transition-all active:scale-95 shadow-md"
                style={{
                  backgroundColor: isDark ? "#7B3F00" : "#D7C4B7",
                  color: isDark ? "#FFF9E6" : "#241812",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)"
                }}
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
            <button 
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-background border-b border-border transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col p-4 gap-4 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block text-lg font-medium text-foreground/80 hover:text-pink-600 dark:hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-pink-50 dark:hover:bg-primary/5"
            >
              {link.name}
            </a>
          ))}
          <div className="px-4 pt-2">
            <Button 
              className="w-full rounded-full"
              onClick={() => window.open('tel:+' + ["91", "9438", "1315", "76"].join(""))}
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              +91 94381 31576
            </Button>
          </div>
        </nav>
      </div>

      {/* User Profile Drawer Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl w-full rounded-2xl p-6 bg-card border border-border text-foreground fancy-shadow max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="font-display font-bold text-2xl flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-pink-600 dark:text-primary" />
              My Profile Account
            </DialogTitle>
          </DialogHeader>

          {user && (
            <div className="mt-4 space-y-6">
              {/* Profile details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Full Name</p>
                  <p className="font-semibold text-foreground text-base">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">WhatsApp Phone</p>
                  <p className="font-semibold text-foreground text-base">{user.phone}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                  <p className="font-semibold text-foreground text-base">{user.email}</p>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-600 dark:text-primary" />
                  My Booking History
                </h3>

                {isLoadingOrders ? (
                  <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-xs font-semibold">Loading orders...</p>
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border/80 rounded-xl bg-secondary/10">
                    <ShoppingBag className="w-8 h-8 mx-auto opacity-30 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-muted-foreground">No orders submitted yet.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto">
                      Pre-order a custom cake at least 6 days in advance to see it listed here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1">
                    {orders.map((order: any) => (
                      <div 
                        key={order.id}
                        className="bg-card border border-border/60 hover:border-border rounded-xl p-4 transition-all flex flex-col gap-2.5"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold text-muted-foreground/80">#{order.id}</span>
                            <h4 className="font-bold text-foreground text-sm mt-0.5">{order.cakeName || "Custom Cake Customization"}</h4>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${
                            order.status === "completed" 
                              ? "bg-green-500/15 text-green-500" 
                              : "bg-amber-500/15 text-amber-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === "completed" ? "bg-green-500" : "bg-amber-500"}`}></span>
                            {order.status.toUpperCase()}
                          </span>
                        </div>

                        {order.notes && (
                          <p className="text-xs text-muted-foreground bg-secondary/20 border border-border/40 p-2.5 rounded-lg italic">
                            "{order.notes}"
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-1.5 border-t border-border/30">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-pink-600 dark:text-primary shrink-0" />
                            <span>Pickup: {formattedDate(order.pickupDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>Time: {formatTimeTo12Hour(order.pickupTime)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Logout button */}
              <div className="pt-4 border-t border-border flex justify-end">
                <Button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  variant="outline"
                  className="rounded-xl border-border hover:bg-red-500/10 hover:text-red-500 flex items-center gap-1.5 px-5 py-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Log Out Account"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
