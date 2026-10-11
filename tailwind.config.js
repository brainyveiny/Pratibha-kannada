/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', 'Noto Sans Kannada', 'system-ui', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff5f0',
          100: '#ffe8d6',
          200: '#ffc9a0',
          300: '#ffa06a',
          400: '#ff7a3c',
          500: '#ff5a1f',
          600: '#e83e0b',
          700: '#c2300a',
          800: '#9a2610',
          900: '#7c2010',
        },
      },
      backgroundImage: {
        'blob-gradient': 'radial-gradient(ellipse at 20% 20%, #ffb3a0 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, #ffd580 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, #ffcba4 0%, transparent 50%), radial-gradient(ellipse at 90% 85%, #ff9966 0%, transparent 45%)',
      },
      keyframes: {
        'blob-move': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(8px, -12px) scale(1.04)' },
          '66%': { transform: 'translate(-6px, 6px) scale(0.97)' },
        },
        'blob-move-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '40%': { transform: 'translate(-10px, 8px) scale(1.05)' },
          '70%': { transform: 'translate(5px, -5px) scale(0.96)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'blob-1': 'blob-move 10s ease-in-out infinite',
        'blob-2': 'blob-move-2 13s ease-in-out infinite',
        'blob-3': 'blob-move 15s ease-in-out infinite reverse',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
