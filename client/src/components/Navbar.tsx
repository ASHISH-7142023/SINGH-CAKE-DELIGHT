import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CakeThemeToggle } from "./CakeThemeToggle";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-nav py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
              <span className="text-xl">🎂</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl leading-none text-foreground tracking-wide">
                Singh Cake Delight
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Pure Eggless
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
            <CakeThemeToggle />
            <Button 
              className="rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 transition-all hover:-translate-y-0.5 ml-2"
              onClick={() => window.open('tel:+919658181860')}
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Call Now
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-background border-b border-border transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col p-4 gap-4 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block text-lg font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-primary/5"
            >
              {link.name}
            </a>
          ))}
          <div className="px-4 pt-2">
            <Button 
              className="w-full rounded-full"
              onClick={() => window.open('tel:+919658181860')}
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              +91 96581 81860
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
