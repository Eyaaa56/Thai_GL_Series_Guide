/** @type {import('tailwindcss').Config} */
export default {
  // The app toggles the `dark` class itself, so Tailwind must use class mode
  // rather than only reacting to the operating system preference.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'system-ui', 'sans-serif'], display: ['Playfair Display', 'serif'] },
      boxShadow: { card: '0 8px 30px rgba(91, 62, 71, .08)' },
    },
  },
  plugins: [],
};
