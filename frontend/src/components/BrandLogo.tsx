"use client";

/* ════════════════════════════════════════════════════════════
   PrepStudio mark — Swiss Industrial Print
   Sharp 90° forms · carbon ink + single hazard-red accent
   ════════════════════════════════════════════════════════════ */

interface LogoMarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function LogoMark({ size = 28, className = "", animated = false }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Bounding register box */}
      <rect x="2" y="2" width="68" height="68" stroke="currentColor" strokeWidth="3" />
      {/* P stem — left vertical bar (carbon) */}
      <rect x="14" y="14" width="9" height="44" fill="currentColor" />
      {/* Top crossbar */}
      <rect x="14" y="14" width="34" height="9" fill="currentColor" />
      {/* Mid connector (base of P bowl) */}
      <rect x="14" y="33" width="22" height="9" fill="currentColor" />
      {/* Telemetry bars — descending, hazard red */}
      <rect x="40" y="14" width="9" height="28" fill="#E61919"
            className={animated ? "telem-bar" : ""} style={animated ? { transformOrigin: "44px 42px" } : undefined} />
      <rect x="51" y="22" width="9" height="20" fill="currentColor"
            className={animated ? "telem-bar" : ""} style={animated ? { transformOrigin: "55px 42px", animationDelay: "0.2s" } : undefined} />
    </svg>
  );
}

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  logoSize?: number;
  animated?: boolean;
}

export function Wordmark({ size = "md", className = "", logoSize, animated = false }: WordmarkProps) {
  const sizes = {
    sm: { logo: 20, text: "text-[13px]" },
    md: { logo: 26, text: "text-[16px]" },
    lg: { logo: 34, text: "text-[20px]" },
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={logoSize ?? s.logo} animated={animated} />
      <div className={`flex items-baseline ${s.text} font-display font-black uppercase tracking-tightest`}>
        <span className="text-ink">PREP</span>
        <span className="text-hazard">STUDIO</span>
        <sup className="text-ink-400 text-[0.5em] font-mono font-medium ml-0.5">®</sup>
      </div>
    </div>
  );
}
