import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        noto: ['var(--font-noto-sans)'],
        notoMono: ['var(--font-noto-sans-mono)'],
        geist: ['var(--font-geist-ser)'],
        geistMono: ['var(--font-geist-mono)']
      }
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '1.5rem',
        lg: '2rem'
      }
    }
  },
  plugins: []
};
export default config;
