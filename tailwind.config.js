/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/**/*.{html,js,jsx,ts,tsx,vue}', // Adjust the path according to your project structure
  ],
  darkMode: 'class', // Habilita el modo oscuro
  theme: {
    extend: {
      colors: {
        'gradient-start': '#161873cc',
        'gradient-middle': '#401fb798', 
        'gradient-end': '#673cb3be',
        'button-hover': 'rgba(206, 7, 7, 0.776)',
      },
    },
  },
  plugins: [],
}



