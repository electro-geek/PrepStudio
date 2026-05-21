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
        background: {
          dark: "#0F172A",
          light: "#F8FAFC"
        },
        card: {
          dark: "#1E293B",
          light: "#FFFFFF"
        },
        border: {
          dark: "#334155",
          light: "#E2E8F0"
        },
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA"
        }
      },
      borderRadius: {
        card: "12px",
        btn: "8px"
      }
    },
  },
  plugins: [],
}
