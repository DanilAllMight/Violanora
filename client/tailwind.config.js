/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-bg": "var(--app-bg)",
        "app-text": "var(--app-text)",
      },
    },
  },
  plugins: [],
};
