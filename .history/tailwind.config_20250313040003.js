/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          indigo: '#6366F1',
          purple: '#8B5CF6',
        },
        text: {
          dark: '#1F2937',
          light: '#FFFFFF',
        },
        secondary: {
          teal: '#14B8A6',
          amber: '#F59E0B',
        },
        dark: {
          navy: '#0F172A',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6' }],
      },
      spacing: {
        ...Array.from({ length: 20 }, (_, i) => i * 8)
          .reduce((acc, val) => ({ ...acc, [val]: `${val}px` }), {}),
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
      },
      height: {
        navbar: {
          desktop: '64px',
          mobile: '56px',
        },
      },
      width: {
        sidebar: '75vw',
      },
    },
  },
  plugins: [],
};
