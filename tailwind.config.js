/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f1',
          100: '#fde3e0',
          200: '#fbcac4',
          300: '#f7a89f',
          400: '#f27a6d',
          500: '#ee4c3d',
          600: '#d9332a',
          700: '#b32621',
          800: '#942220',
          900: '#7c211f',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        stone: {
          950: '#1c1917',
        },
        slate: {
          25: '#fbfcfd',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Named typography scale (Page/Section/Card heading, label, body,
      // caption) so headings are consistent by role instead of picking a
      // Tailwind size ad hoc per component — use text-page-heading etc.
      fontSize: {
        'page-heading': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }], // 40px
        'section-heading': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '800' }], // 30px
        'card-heading': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }], // 24px
        'input-label': ['0.9375rem', { lineHeight: '1.4', fontWeight: '600' }], // 15px
        'body': ['1rem', { lineHeight: '1.6' }], // 16px
        caption: ['0.8125rem', { lineHeight: '1.4' }], // 13px
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 12px 28px rgba(15, 23, 42, 0.12)',
        elevated: '0 8px 24px rgba(15, 23, 42, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
        control: '1rem', // 16px — shared radius for inputs/buttons per design system
      },
      spacing: {
        18: '4.5rem', // 72px — used for the trimmed navbar height
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
