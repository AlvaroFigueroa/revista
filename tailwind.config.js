/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        brandBlue: '#1D4ED8',
        brandSlate: '#0F172A',
        brandLight: '#E0ECFF',
      },
      boxShadow: {
        soft: '0 24px 60px -30px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};
