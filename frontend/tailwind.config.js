/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0C2721',
          800: '#123B32', // Deep forest green
          700: '#1B5144', // Primary dark green
          600: '#266C5C',
          500: '#348874',
          100: '#E2EFEA',
          50: '#F0F6F4',
        },
        lime: {
          accent: '#DDF18A', // Soft lime accent
          hover: '#CEE66E',
          soft: '#EEF8BE',
        },
        ivory: {
          DEFAULT: '#FAF9F5', // Warm ivory background
          card: '#FFFFFF',
          muted: '#F3F2EB',
        },
        travel: {
          text: '#1D2925',   // Main text
          muted: '#737B75',  // Muted text
          border: '#E7E8E1', // Borders
          subtle: '#FAF9F5',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(18, 59, 50, 0.05), 0 1px 2px rgba(18, 59, 50, 0.03)',
        'card': '0 4px 20px -2px rgba(18, 59, 50, 0.06), 0 2px 6px -1px rgba(18, 59, 50, 0.03)',
        'elevated': '0 12px 32px -4px rgba(18, 59, 50, 0.12), 0 4px 12px -2px rgba(18, 59, 50, 0.06)',
        'lime-glow': '0 0 25px -3px rgba(221, 241, 138, 0.45)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
