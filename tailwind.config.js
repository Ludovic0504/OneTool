// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ✅ ce que tu avais déjà
      height:   { dvh: "100dvh" },
      minHeight:{ dvh: "100dvh" },

      // ✅ nouvelle palette + glow
      colors: {
        ink: "#050810",       // fond profond
        surface: "#0b101b",   // cartes
        card: "#0e1624",      // surcouches
        accent: "#21f3b9",    // néon vert
        muted: "#7d8899",
      },
      boxShadow: {
        glow: "0 0 0.5rem rgba(34,230,184,.4), 0 0 2rem rgba(34,230,184,.25)",
      },
    },
  },
  plugins: [],
};
