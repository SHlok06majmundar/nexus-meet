import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        dark: {
          1: '#0F0F23',
          2: '#161925',
          3: '#252A41',
          4: '#1E2757',
        },
        blue: {
          1: '#3B82F6',
          2: '#1E40AF',
          3: '#60A5FA',
        },
        purple: {
          1: '#8B5CF6',
          2: '#7C3AED',
          3: '#A78BFA',
        },
        pink: {
          1: '#EC4899',
          2: '#DB2777',
          3: '#F472B6',
        },
        green: {
          1: '#10B981',
          2: '#059669',
          3: '#34D399',
        },
        orange: {
          1: '#F59E0B',
          2: '#D97706',
          3: '#FBBF24',
        },
        sky: {
          1: '#C9DDFF',
          2: '#ECF0FF',
          3: '#F5FCFF',
        },
        yellow: {
          1: '#F9A90E',
        },
        gradient: {
          1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        hero: "url('/images/hero-background.png')",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
