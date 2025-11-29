/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        hhp: {
          primary: "#14b8c4",
          primarySoft: "#e0f7ff",
          primaryMuted: "#9be6f0",
          accent: "#f4b163",
          accentSoft: "#fff4e5",
          surface: "#f6fbff",
          elevated: "rgba(255,255,255,0.9)",
          ink: "#0f172a",
          inkMuted: "#475569",
          border: "rgba(15,23,42,0.08)",
          card: "rgba(255,255,255,0.82)",
        },
      },
      borderRadius: {
        xl: "18px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 23, 42, 0.08)",
        card: "0 12px 32px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
}
