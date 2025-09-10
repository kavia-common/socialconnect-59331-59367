/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#262626",
        secondary: "#fafafa",
        accent: "#0095f6"
      }
    }
  },
  plugins: []
};
