/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#ff6b35',
        'brand-orange-light': '#ff8a5c',
        'brand-orange-dark': '#e55a2b',
        'brand-black': '#1a1a1a',
        'brand-off-white': '#fafaf9',
        'brand-gray-warm': '#f5f5f4',
        'brand-gray-cool': '#e7e5e4',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}