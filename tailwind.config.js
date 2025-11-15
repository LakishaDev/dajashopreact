/** @type {import('tailwindcss').Config} */
/* eslint-disable no-undef */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Manji blur za backdrop (Safari radi preko autoprefixer-a)
      // backdropBlur: {
      //   xxs: "19px", // 👈 novo: super suptilno
      //   xs: "4px", // (opciono) ako želiš i xs kao u tvom CSS-u
      // },
      // (opciono) ako voliš runtime tokene:
      backdropBlur: { xxs: "var(--blur-xxs, 2px)" },
    },
  },
  plugins: [],
};
