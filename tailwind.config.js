/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14F195',
          50: '#f0f9ff',
          500: '#14F195',
          600: '#0CB574',
          700: '#1d4ed8',
          dark: '#0CB574',
        },
        secondary: {
          DEFAULT: '#9945FF',
          50: '#f8fafc',
          500: '#9945FF',
          600: '#7E37D8',
          dark: '#7E37D8',
        },
        dark: {
          DEFAULT: '#121212',
          light: '#1E1E1E',
          lighter: '#2D2D2D',
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          400: '#BDC1C6',
          500: '#9AA0A6',
          600: '#80868B',
          700: '#5F6368',
          800: '#3C4043',
          900: '#202124',
          950: '#121212',
        },
        accent: {
          yellow: '#FAD02C',
          orange: '#FF6B35',
          pink: '#FF1493',
          cyan: '#00FFFF',
          lime: '#32CD32',
          emerald: '#10B981',
          violet: '#8B5CF6',
          rose: '#F43F5E',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          primary: 'rgba(20, 241, 149, 0.1)',
          secondary: 'rgba(153, 69, 255, 0.1)',
          dark: 'rgba(18, 18, 18, 0.8)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '96': '24rem',
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'gradient-x': 'gradient-x 4s ease infinite',
        'gradient-y': 'gradient-y 4s ease infinite',
        'gradient-xy': 'gradient-xy 4s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'pulse-fast': 'pulse-fast 1s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'spin-slow-reverse': 'spin-reverse 30s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.8s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
        'scale-in': 'scale-in 0.6s ease-out forwards',
        'scale-out': 'scale-out 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'aurora': 'aurora 8s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'morph': 'morph 4s ease-in-out infinite',
        'particle-float': 'particle-float 4s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(20, 241, 149, 0.3), 0 0 10px rgba(20, 241, 149, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(20, 241, 149, 0.6), 0 0 30px rgba(20, 241, 149, 0.4)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(20, 241, 149, 0.3), 0 0 10px rgba(20, 241, 149, 0.2)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 25px rgba(20, 241, 149, 0.8), 0 0 35px rgba(20, 241, 149, 0.6)',
            transform: 'scale(1.05)'
          },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        morph: {
          '0%, 100%': { 
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' 
          },
          '50%': { 
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' 
          }
        },
        'particle-float': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '1'
          },
          '33%': { 
            transform: 'translateY(-10px) rotate(120deg)',
            opacity: '0.8'
          },
          '66%': { 
            transform: 'translateY(-5px) rotate(240deg)',
            opacity: '0.6'
          }
        },
        'text-shimmer': {
          '0%': {
            backgroundPosition: '-200% center'
          },
          '100%': {
            backgroundPosition: '200% center'
          }
        },
        'border-glow': {
          '0%': { 
            borderColor: 'rgba(20, 241, 149, 0.3)',
            boxShadow: '0 0 5px rgba(20, 241, 149, 0.2)'
          },
          '100%': { 
            borderColor: 'rgba(20, 241, 149, 0.8)',
            boxShadow: '0 0 20px rgba(20, 241, 149, 0.4)'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(20, 241, 149, 0.3)',
        'glow-sm': '0 0 10px rgba(20, 241, 149, 0.2)',
        'glow-lg': '0 0 40px rgba(20, 241, 149, 0.4)',
        'glow-secondary': '0 0 20px rgba(153, 69, 255, 0.3)',
        'glow-secondary-lg': '0 0 40px rgba(153, 69, 255, 0.4)',
        'inner-glow': 'inset 0 0 10px rgba(20, 241, 149, 0.2)',
        'neumorphism': '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neumorphism-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.3), inset -8px -8px 16px rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '98': '0.98',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '2000': '2000ms',
      },
      perspective: {
        '500': '500px',
        '1000': '1000px',
        '2000': '2000px',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.perspective-500': {
          perspective: '500px',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.perspective-2000': {
          perspective: '2000px',
        },
        '.transform-gpu': {
          transform: 'translate3d(0, 0, 0)',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.text-shadow': {
          'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
        },
        '.text-shadow-lg': {
          'text-shadow': '0 4px 8px rgba(0, 0, 0, 0.4)',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.2)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.neumorphism': {
          background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
          'box-shadow': '8px 8px 16px #0a0a0a, -8px -8px 16px #262626',
        },
        '.neumorphism-inset': {
          background: 'linear-gradient(145deg, #0d0d0d, #1a1a1a)',
          'box-shadow': 'inset 8px 8px 16px #0a0a0a, inset -8px -8px 16px #262626',
        }
      }
      addUtilities(newUtilities)
    }
  ],
} 