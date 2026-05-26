import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        brand: {
          50: '#f5fbfd',
          100: '#eef6fb',
          200: '#d4e8f2',
          300: '#a8c9dd',
          400: '#7aa6c2',
          500: '#4f7ea2',
          600: '#356486',
          700: '#1f4f72',
          800: '#133b57',
          900: '#0d2b3f',
          950: '#071c28',
        },
      },
      backgroundImage: {
        glass: 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.4))',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
