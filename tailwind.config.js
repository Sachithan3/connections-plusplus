/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F5F5',
        'cream-50': '#FAFAFA',
        'cream-100': '#F5F5F5',
        'cream-200': '#E8E8E8',
        slate: {
          950: '#0f0f0f',
          900: '#1a1a1a',
        },
        puzzle: {
          yellow: '#F4D35E',
          green: '#1FBF83',
          blue: '#A6E8FF',
          purple: '#D4A5FF',
        }
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      animation: {
        'tile-pop': 'tile-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'tile-shuffle': 'tile-shuffle 0.4s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'tile-pop': {
          '0%': { transform: 'scale(0.95) rotateX(0deg)', opacity: '0.9' },
          '100%': { transform: 'scale(1) rotateX(0deg)', opacity: '1' },
        },
        'tile-shuffle': {
          '0%': { transform: 'translateX(0) rotateZ(0deg)' },
          '50%': { transform: 'translateX(2px) rotateZ(0.5deg)' },
          '100%': { transform: 'translateX(0) rotateZ(0deg)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backdropBlur: {
        sm: '4px',
      }
    },
  },
  plugins: [],
}

