/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        quest: ['"Fredoka"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper: {
          light: '#FAF8F5',
          card: '#F2EFE9',
          elevated: '#EBE6DD',
          border: '#DEDAD2',
          ink: '#141413',
          muted: '#5C5A55',
        },
        night: {
          bg: '#121211',
          card: '#1C1B19',
          elevated: '#262522',
          border: '#2E2D29',
          ink: '#EAE6DF',
          muted: '#9E9B93',
        },
        crimson: {
          DEFAULT: '#C8102E',
          bright: '#E63946',
          dark: '#9B0B22',
        },
        navy: {
          DEFAULT: '#1B365D',
          light: '#2B528C',
        }
      }
    },
  },
  plugins: [],
};
