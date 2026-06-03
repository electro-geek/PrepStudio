/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Dual-substrate tokens — driven by CSS vars in globals.css.
             Light = paper/ink · Dark = CRT/phosphor. Flip via .dark class. ── */
        paper: {
          DEFAULT: 'rgb(var(--paper) / <alpha-value>)',
          alt:     'rgb(var(--paper-alt) / <alpha-value>)',
          dark:    'rgb(var(--paper-dark) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft:    'rgb(var(--ink-soft) / <alpha-value>)',
          700:     'rgb(var(--ink-700) / <alpha-value>)',
          500:     'rgb(var(--ink-500) / <alpha-value>)',
          400:     'rgb(var(--ink-400) / <alpha-value>)',
          300:     'rgb(var(--ink-300) / <alpha-value>)',
        },
        /* ── Aviation / hazard red — the ONLY accent ──────── */
        hazard: {
          DEFAULT: 'rgb(var(--hazard) / <alpha-value>)',
          bright:  'rgb(var(--hazard-bright) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Archivo', 'Inter', 'Arial', 'sans-serif'],   // macro / structural
        sans:    ['Inter', 'system-ui', 'sans-serif'],          // body
        mono:    ['"JetBrains Mono"', 'monospace'],             // telemetry / metadata
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',   // 90° corners enforced
      },
      letterSpacing: {
        tightest: '-0.05em',
      },
    },
  },
  plugins: [],
}
