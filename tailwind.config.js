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
          400: '#FF6B35',
          500: '#FF6B35',
          600: '#E65100',
          700: '#D84315',
          800: '#BF360C',
          900: '#A12C0A',
          950: '#8B2500',
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


