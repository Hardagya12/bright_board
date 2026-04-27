/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        md: '2rem',
        lg: '2rem',
        xl: '3rem'
      }
    },
    extend: {
      fontFamily: {
        'display': ['"Lilita One"', '"Inter"', 'sans-serif'],
        'body': ['"Inter"', 'sans-serif'],
        'hand': ['"Caveat"', 'cursive'],
      },
      colors: {
        bb: {
          black: '#0e0f0c',
          green: '#9fe870',
          'green-dark': '#163300',
          'green-light': '#e2f6d5',
          'green-pastel': '#cdffad',
          white: '#ffffff',
          offwhite: '#f9faf6',
          danger: '#d03238',
          warning: '#ffd11a',
          orange: '#ffc091',
          positive: '#054d28',
        },
        gray: {
          dark: '#454745',
          mid: '#868685',
          light: '#e8ebe6',
        }
      },
      borderRadius: {
        'card': '30px',
        'card-sm': '16px',
        'card-lg': '40px',
        'pill': '9999px',
      },
      boxShadow: {
        'ring': 'rgba(14,15,12,0.12) 0px 0px 0px 1px',
        'card': '0 2px 16px rgba(14,15,12,0.06)',
        'card-hover': '0 8px 30px rgba(159,232,112,0.15)',
        'green-glow': '0 4px 20px rgba(159,232,112,0.3)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'float': {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' }
        },
        'wiggle': {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        'pop-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'bounce-gentle': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'pencil': {
          '0%': { transform: 'translateX(0) rotate(-5deg)' },
          '25%': { transform: 'translateX(4px) rotate(0deg)' },
          '50%': { transform: 'translateX(0) rotate(5deg)' },
          '75%': { transform: 'translateX(-4px) rotate(0deg)' },
          '100%': { transform: 'translateX(0) rotate(-5deg)' },
        }
      },
      animation: {
        'fade-up': 'fade-up 600ms ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'bounce-gentle': 'bounce-gentle 2.5s ease-in-out infinite',
        'pencil': 'pencil 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}