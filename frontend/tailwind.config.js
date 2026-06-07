/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        /* ── AlgoVizuals semantic tokens — driven by CSS vars per .theme-* ── */
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        surface:    'rgb(var(--surface) / <alpha-value>)',
        panel:      'rgb(var(--panel) / <alpha-value>)',
        muted:      'rgb(var(--muted) / <alpha-value>)',
        border:     'rgb(var(--border) / <alpha-value>)',
        ring:       'rgb(var(--ring) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover:   'rgb(var(--primary-hover) / <alpha-value>)',
          fg:      'rgb(var(--primary-fg) / <alpha-value>)',
        },
        secondary: 'rgb(var(--secondary) / <alpha-value>)',

        /* ── Legacy bridge — old Swiss-Industrial names mapped to new tokens ── */
        paper: {
          DEFAULT: 'rgb(var(--background) / <alpha-value>)',
          alt:     'rgb(var(--surface) / <alpha-value>)',
          dark:    'rgb(var(--panel) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--foreground) / <alpha-value>)',
          soft:    'rgb(var(--foreground) / <alpha-value>)',
          700:     'rgb(var(--foreground) / <alpha-value>)',
          500:     'rgb(var(--muted) / <alpha-value>)',
          400:     'rgb(var(--muted) / <alpha-value>)',
          300:     'rgb(var(--border) / <alpha-value>)',
        },
        hazard: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          bright:  'rgb(var(--secondary) / <alpha-value>)',
        },
      },
      fontFamily: {
        display:  ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading:  ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:     ['ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono:     ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
      },
    },
  },
  plugins: [],
}
