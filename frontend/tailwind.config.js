/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0F19',
        darkCard: '#151D30',
        accentBlue: '#3B82F6',
        accentGreen: '#10B981',
        accentRed: '#EF4444'
      }
    },
  },
  plugins: [],
}