"use client";

/* ════════════════════════════════════════════════════════════
   PrepStudio mark — AlgoVizuals engineering-notebook system
   Rounded register box · foreground ink + primary accent bars
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
      className={`text-foreground ${className}`}
    >
      {/* Bounding register box */}
      <rect x="3" y="3" width="66" height="66" rx="8" stroke="currentColor" strokeWidth="3" />
      {/* P stem — left vertical bar */}
      <rect x="15" y="15" width="9" height="42" rx="2" fill="currentColor" />
      {/* Top crossbar */}
      <rect x="15" y="15" width="33" height="9" rx="2" fill="currentColor" />
      {/* Mid connector */}
      <rect x="15" y="33" width="21" height="9" rx="2" fill="currentColor" />
      {/* Telemetry bars — primary accent */}
      <rect x="40" y="15" width="9" height="27" rx="2" fill="rgb(var(--primary))"
            className={animated ? "telem-bar" : ""} style={animated ? { transformOrigin: "44px 42px" } : undefined} />
      <rect x="52" y="23" width="9" height="19" rx="2" fill="currentColor"
            className={animated ? "telem-bar" : ""} style={animated ? { transformOrigin: "56px 42px", animationDelay: "0.2s" } : undefined} />
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
    sm: { logo: 20, text: "text-[14px]" },
    md: { logo: 26, text: "text-[17px]" },
    lg: { logo: 34, text: "text-[22px]" },
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={logoSize ?? s.logo} animated={animated} />
      <div className={`flex items-baseline font-display font-extrabold tracking-tight ${s.text}`}>
        <span className="text-foreground">Prep</span>
        <span className="text-primary">Studio</span>
      </div>
    </div>
  );
}
