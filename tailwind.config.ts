import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff8ff',
          100: '#dbeffe',
          200: '#bee2fd',
          300: '#91d1fc',
          400: '#5db8f8',
          500: '#3899f4',
          600: '#1f78e9',
          700: '#1a63d6',
          800: '#1c51ad',
          900: '#1c4688',
          950: '#152c53',
        },
        pernik: {
          dark: '#1a2744',
          mid: '#2d4a7a',
          light: '#4a7ab5',
          accent: '#e8b931',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
