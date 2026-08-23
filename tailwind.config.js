/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F6F2', panel: '#FFFFFF', ink: '#2B2B33', muted: '#8A8896',
        line: '#ECEAE3', line2: '#E2DFD6', accent: '#6C5CE0',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
