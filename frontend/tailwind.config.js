/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        road: {
          900: '#0B0F17',
          850: '#111726',
          800: '#161F33',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
          400: '#64748B',
          300: '#94A3B8',
          200: '#CBD5E1',
          100: '#F1F5F9',
        },
        pothole: {
          500: '#EF4444',
          600: '#DC2626',
        },
        crack: {
          500: '#F59E0B',
          600: '#D97706',
        },
        manhole: {
          500: '#10B981',
          600: '#059669',
        }
      }
    },
  },
  plugins: [],
}

