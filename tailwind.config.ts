import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f59e0b", // amber-500
          dark: "#d97706", // amber-600
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;

