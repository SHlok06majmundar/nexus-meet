/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './component/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        prime: '#0a0f16',
        secondary: '#172033',
        buttonPrimary: '#4f46e5',
        accent: '#7c3aed',
        accentLight: '#8b5cf6',
        highlight: '#10b981',
        danger: '#ef4444',
        darkText: '#1e293b',
        lightText: '#e2e8f0'
      }
    },
  },
  plugins: [],
}
