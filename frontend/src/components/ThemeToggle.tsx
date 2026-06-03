"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/* Industrial theme switch — flips the .dark class on <html> and persists.
   LIGHT = Swiss Industrial Print · DARK = Tactical Telemetry CRT */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("ps-theme", next ? "dark" : "light"); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle colour scheme"
      title={dark ? "Switch to light" : "Switch to dark"}
      className={`btn-outline p-2.5 flex items-center justify-center ${className}`}
    >
      {/* Render a neutral glyph until mounted to avoid hydration mismatch */}
      {!mounted ? (
        <span className="block h-4 w-4" />
      ) : dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
