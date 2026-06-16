import { useEffect, useState } from "react";

export function CakeThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    const next = root.classList.contains("dark");
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="cake-toggle relative w-16 h-9 rounded-full transition-colors duration-300 flex items-center px-1"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #3b2621 0%, #5a3a30 100%)"
          : "linear-gradient(135deg, #f9e4d4 0%, #fce8d8 100%)",
        border: isDark ? "2px solid #7a5a4f" : "2px solid #e8c4b0",
      }}
    >
      <span
        className="block w-7 h-7 rounded-full transition-transform duration-300 flex items-center justify-center"
        style={{
          transform: isDark ? "translateX(28px)" : "translateX(0)",
          background: isDark
            ? "linear-gradient(135deg, #c9944a 0%, #e0b060 100%)"
            : "linear-gradient(135deg, #d4708a 0%, #e896a8 100%)",
        }}
      >
        {/* Custom cake icon */}
        <img src="/cake.png" alt="Cake Mode" className="w-5 h-5 object-contain" />
      </span>
    </button>
  );
}
