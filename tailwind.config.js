/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bleu + Or gradient palette
        bleu: {
          50: '#EBF5FF',
          100: '#D1E9FF',
          200: '#A3D3FF',
          300: '#6BB8FF',
          400: '#3A9BFF',
          500: '#2B5EA7',
          600: '#1E4D8C',
          700: '#163B6E',
          800: '#0F2A50',
          900: '#091A33',
        },
        or: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE588',
          300: '#FFD54F',
          400: '#FFC107',
          500: '#F9A825',
          600: '#E8960C',
          700: '#C77E0A',
          800: '#A66808',
          900: '#7A4D06',
        },
        // Rouge + Vert gradient palette
        rouge: {
          50: '#FFF1F0',
          100: '#FFE0DE',
          200: '#FFC1BD',
          300: '#FF9A93',
          400: '#FF6B61',
          500: '#D32F2F',
          600: '#B71C1C',
          700: '#961616',
          800: '#751111',
          900: '#540C0C',
        },
        vert: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#388E3C',
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#155A1F',
          900: '#0F4019',
        },
        primary: {
          DEFAULT: '#2B5EA7',
          light: '#3A9BFF',
          dark: '#163B6E'
        },
        secondary: {
          DEFAULT: '#388E3C',
          light: '#66BB6A',
          dark: '#1B5E20'
        },
        accent: {
          DEFAULT: '#F9A825',
          light: '#FFD54F',
          dark: '#F57F17'
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121'
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 25px -3px rgba(43, 94, 167, 0.12)',
        'card-hover': '0 8px 40px -3px rgba(43, 94, 167, 0.20)',
        'gold': '0 4px 25px -3px rgba(249, 168, 37, 0.25)',
        'blue': '0 4px 25px -3px rgba(43, 94, 167, 0.30)',
        'portal': '0 20px 60px -10px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
