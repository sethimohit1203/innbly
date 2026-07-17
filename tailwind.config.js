/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf6ee',
          100: '#f9e8d2',
          200: '#f1cda0',
          300: '#e7ab6a',
          400: '#dd8a41',
          500: '#c96a24',
          600: '#a8511c',
          700: '#853d19',
          800: '#6b3119',
          900: '#592a18',
        },
        accent: {
          50: '#eafaf6',
          100: '#c9f0e4',
          200: '#94e0c9',
          300: '#5cc9ab',
          400: '#2fae90',
          500: '#178f76',
          600: '#0f7460',
          700: '#0e5c4d',
          800: '#0e4a3f',
          900: '#0d3d35',
        },
        slate: {
          25: '#fbfcfd',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 12px 28px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
