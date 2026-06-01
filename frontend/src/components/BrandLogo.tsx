"use client";

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
      className={className}
    >
      {/* P stem — left vertical bar */}
      <rect x="9" y="9" width="9" height="54" rx="4.5" fill="#F1F5F9" />
      {/* Top crossbar */}
      <rect x="9" y="9" width="46" height="9" rx="4.5" fill="#F1F5F9" />
      {/* Mid connector (base of P bowl) */}
      <rect x="9" y="36" width="25" height="9" rx="4.5" fill="#F1F5F9" />
      {/* Waveform bar 1 — tallest */}
      <rect x="22" y="18" width="9" height="27" rx="4.5" fill="#6366F1" />
      {/* Waveform bar 2 — medium */}
      <rect
        x="35" y="22" width="9" height="19" rx="4.5"
        fill="#6366F1" opacity="0.58"
        className={animated ? "logo-bar-2" : ""}
        style={animated ? { transformOrigin: "39.5px 31px" } : undefined}
      />
      {/* Waveform bar 3 — shortest */}
      <rect
        x="48" y="27" width="9" height="9" rx="4.5"
        fill="#6366F1" opacity="0.28"
        className={animated ? "logo-bar-3" : ""}
        style={animated ? { transformOrigin: "52.5px 31.5px" } : undefined}
      />
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
      <div className={`flex items-baseline gap-[1px] ${s.text} tracking-tight`}>
        <span className="font-black text-[#F1F5F9]">prep</span>
        <span className="font-light text-[#F1F5F9]/38">studio</span>
      </div>
    </div>
  );
}
