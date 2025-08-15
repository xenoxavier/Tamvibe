/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel teen-friendly colors
        pastel: {
          pink: '#FFB3D1',
          purple: '#D4AFDF', 
          blue: '#A8DADC',
          mint: '#B8E6B8',
          yellow: '#FFE066',
          peach: '#FFD3A5',
          lavender: '#E6E6FA',
          coral: '#FF9F9B'
        },
        // Dark variants for better contrast
        deep: {
          purple: '#6B46C1',
          pink: '#EC4899',
          blue: '#3B82F6',
          mint: '#10B981',
          coral: '#F59E0B'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s infinite',
        'bounce-gentle': 'bounce 1s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}