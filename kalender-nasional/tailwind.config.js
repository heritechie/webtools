/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          base: '#0f172a',
          card: '#111c31',
          highlight: '#182540',
        },
        accent: {
          blue: '#38bdf8',
          green: '#34d399',
          amber: '#fbbf24',
          red: '#f87171',
        },
      },
    },
  },
  plugins: [],
};
