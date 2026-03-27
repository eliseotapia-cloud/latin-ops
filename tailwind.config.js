/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          500: '#4F6AF5',
          600: '#3B55E6',
          700: '#2D44CC',
          900: '#1a2a80',
        },
        surface: {
          DEFAULT: '#0F1117',
          1: '#161B27',
          2: '#1E2535',
          3: '#252D40',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
