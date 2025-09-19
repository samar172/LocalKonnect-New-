// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1a1a1a', // Dark Gray / Black
          accent: '#333333', // Lighter Dark Gray
          secondary: "#0080ff",
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
