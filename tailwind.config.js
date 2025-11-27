/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#f8f9fb",
        card: "#ffffff",
        border: "#e5e7eb",
        muted: "#6b7280",
        primary: "#0f172a",
        brand: {
          bg: "#0f172a",
          surface: "#ffffff",
          subtle: "#f1f5f9",
          primary: "#0f9ecf",
          primarySoft: "#e0f7ff",
          accent: "#22c55e",
          danger: "#ef4444",
        },
        hhp: {
          bgTop: "#0b3b47",
          bgBottom: "#d9f6ff",
          card: "rgba(255,255,255,0.82)",
          border: "rgba(255,255,255,0.35)",
          textMain: "#0f172a",
          textLight: "#f8fafc",
          textMuted: "#6c7a89",
          accentPrimary: "#0fa3c8",
          accentPrimaryLight: "#37c2df",
          accentSoft: "#e0f7ff",
        },
      },
      borderRadius: {
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
        card: "0 10px 30px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
}
