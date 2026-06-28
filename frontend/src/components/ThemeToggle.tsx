"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/* ════════════════════════════════════════════════════════════
   AlgoVizuals theme picker — swaps the .theme-* class on <html>.
   Exported as both ThemePicker and ThemeToggle (legacy import name).
   ════════════════════════════════════════════════════════════ */

type Theme = {
  id: string;
  icon: string;
  label: string;
  desc: string;
  swatches: [string, string, string]; // bg · primary · secondary
};

const THEMES: Theme[] = [
  { id: "theme-neo-brutalist", icon: "🟦", label: "Neo Brutalist", desc: "Teal + ink, hard shadows", swatches: ["#fefdfb", "#2dd4bf", "#fb923c"] },
  { id: "theme-graphite-lab", icon: "🌑", label: "Carbon Studio", desc: "Charcoal + teal signal", swatches: ["#191f1c", "#32b8a6", "#d99d43"] },
  { id: "theme-high-contrast",icon: "⚡", label: "Daylight",      desc: "Crisp blue + orange",     swatches: ["#ffffff", "#0048ff", "#c74700"] },
  { id: "theme-paper-brutalist",icon: "🧱", label: "Paper Brutalist", desc: "Mono, ink, terracotta", swatches: ["#f4f1ea", "#1a1a1a", "#d88060"] },
  // Hidden modes (CSS kept in globals.css — re-add here to expose):
  // { id: "theme-paper-lab",  icon: "📄", label: "Paper Lab",   desc: "Warm paper, cobalt notes", swatches: ["#f6efe3", "#2457d6", "#a94922"] },
  // { id: "theme-sage-board", icon: "🌿", label: "Sage Board",  desc: "Green boards, clay ink",   swatches: ["#edf1e7", "#2f67b1", "#9a6043"] },
];

// All theme classes that may exist on <html> (incl. hidden ones) — used to
// fully clear before applying a new theme. Keep in sync with globals.css.
const ALL = [
  "theme-neo-brutalist",
  "theme-graphite-lab",
  "theme-high-contrast",
  "theme-paper-brutalist",
  "theme-paper-lab",
  "theme-sage-board",
];

export function ThemePicker({ className = "" }: { className?: string }) {
  const [active, setActive] = useState("theme-neo-brutalist");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cur = ALL.find((c) => document.documentElement.classList.contains(c));
    if (cur) setActive(cur);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const pick = (id: string) => {
    const d = document.documentElement;
    ALL.forEach((c) => d.classList.remove(c));
    d.classList.add(id);
    setActive(id);
    setOpen(false);
    try { localStorage.setItem("ps-theme", id); } catch {}
  };

  const current = THEMES.find((t) => t.id === active) ?? THEMES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch theme"
        aria-expanded={open}
        className="btn-ghost !px-3 !py-2 text-sm gap-2"
      >
        <span className="text-base leading-none">{mounted ? current.icon : "🎨"}</span>
        <span className="hidden sm:inline font-medium">{mounted ? current.label : "Theme"}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="card absolute right-0 mt-2 w-64 p-1.5 shadow-glow z-50">
          {THEMES.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => pick(t.id)}
                className={`w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                  isActive ? "bg-[var(--primary-soft)]" : "hover:bg-panel"
                }`}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-foreground truncate">{t.label}</span>
                  <span className="block text-xs text-muted truncate">{t.desc}</span>
                </span>
                <span className="flex items-center gap-1">
                  {t.swatches.map((c) => (
                    <span key={c} className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: c }} />
                  ))}
                </span>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Legacy alias — existing pages import { ThemeToggle } */
export const ThemeToggle = ThemePicker;
