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
        'gill-sans': ['"Gill Sans"','"Gill Sans MT"','Calibri','"Trebuchet MS"','sans-serif'],
        'comic': ['"Comic Sans MS"','Comic Sans','"Comic Neue"','cursive']
      },
      colors: {
        bw: {
          0: '#000000',
          12: '#1F1F1F',
          25: '#404040',
          37: '#616161',
          50: '#808080',
          62: '#9E9E9E',
          75: '#BFBFBF',
          87: '#DEDEDE',
          100: '#FFFFFF'
        }
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        'blur-in': { '0%': { filter: 'blur(12px)', opacity: '0' }, '100%': { filter: 'blur(0)', opacity: '1' } },
        'shimmer': { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } }
      },
      animation: {
        'fade-in': 'fade-in 600ms ease-out',
        'fade-up': 'fade-up 600ms ease-out',
        'float': 'float 3s ease-in-out infinite',
        'blur-in': 'blur-in 700ms ease-out',
        'shimmer': 'shimmer 2s linear infinite'
      }
    },
  },
  plugins: [],
}