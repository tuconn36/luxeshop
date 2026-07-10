import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fbf7f3',
          100: '#f4eadf',
          200: '#e8d3bd',
          300: '#d9b594',
          400: '#c8916a',
          500: '#b07650',
          600: '#965d40',
          700: '#7a4a36',
          800: '#5e3829',
          900: '#3e251c',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', '"Inter"', 'serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -10px rgba(58, 37, 28, 0.18)',
        ring: '0 0 0 1px rgba(255,255,255,0.05), 0 4px 18px -6px rgba(0,0,0,0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [animate],
}