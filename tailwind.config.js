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
          orange: '#F97316',
          yellow: '#FACC15',
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


