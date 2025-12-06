/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          black: '#000000',
          white: '#FFFFFF',
          orange: '#B45309',
          yellow: '#F97316',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#B45309',
          500: '#B45309',
          600: '#9A3412',
          700: '#7C2D12',
          800: '#6B2410',
          900: '#5A1E0E',
          950: '#4A180C',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': 'none',
        'glass-lg': 'none',
      },
    },
  },
  plugins: [],
}


