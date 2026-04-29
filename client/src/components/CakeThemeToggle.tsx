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
      className="cake-toggle relative w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #3b2621 0%, #5a3a30 100%)"
          : "linear-gradient(135deg, #f9e4d4 0%, #fce8d8 100%)",
        border: isDark ? "2px solid #7a5a4f" : "2px solid #e8c4b0",
      }}
    >
      <span
        className="block w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center"
        style={{
          transform: isDark ? "translateX(22px)" : "translateX(0)",
          background: isDark
            ? "linear-gradient(135deg, #c9944a 0%, #e0b060 100%)"
            : "linear-gradient(135deg, #d4708a 0%, #e896a8 100%)",
        }}
      >
        {/* SVG cake icon */}
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 18h16v2H4v-2zm0-3h16v2H4v-2zm2-3h12c1 0 2 1 2 2H4c0-1 1-2 2-2zm1-2h10c.5 0 1 .5 1 1H6c0-.5.5-1 1-1z" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
