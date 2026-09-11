/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // For Create React App
    './pages/**/*.{js,ts,jsx,tsx}', // For Next.js pages
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
        'archivo-black': ['var(--font-archivo-black)', 'sans-serif'],
        'plus-jakarta': ['var(--font-plus-jakarta)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
    plugins: [],
  }
};
