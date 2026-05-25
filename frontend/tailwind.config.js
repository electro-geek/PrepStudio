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
        flame: {
          DEFAULT: '#e8952c',
          light:   '#f0a640',
          dark:    '#c17a3d',
        },
        ink: {
          950: '#0c0a08',
          900: '#131109',
          850: '#1a1714',
          800: '#221f1b',
          750: '#2a261f',
          700: '#2d2820',
          600: '#3a342a',
          500: '#4a4035',
          400: '#5a5040',
        },
        parchment: {
          100: '#ede8e2',
          200: '#d8d0c5',
          300: '#c0b5a5',
          400: '#a09280',
          500: '#806b58',
          600: '#635850',
          700: '#3d3630',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '8px',
      },
    },
  },
  plugins: [],
}
