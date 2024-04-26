/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.ejs',
    './public/**/*.js',
    './public/**/*.mjs'
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      // https://www.realtimecolors.com/?colors=0c1811-f8fcfa-5dac7a-b5a1ce-c289bb&fonts=Poppins-Poppins
      colors: {
        'text': 'var(--text)',
        'text-hover': 'var(--text-hover)',
        'text-inverse': 'var(--text-inverse)',
        'text-inverse-hover': 'var(--text-inverse-hover)',

        'background': 'var(--background)',
        'background-light': 'var(--background-light)',
        'background-hover': 'var(--background-hover)',
        'background-inverse': 'var(--background-inverse)',
        'background-inverse-hover': 'var(--background-inverse-hover)',

        'primary': 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'secondary': 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        'on-secondary': 'var(--on-secondary)',
        'accent': 'var(--accent)',
        'error': 'var(--error)',
      },

      screens: {
        'max-xl': {'max': '1279px'},
        'max-lg': {'max': '1023px'},
        'max-md': {'max': '767px'},
        '3xl': {'min': '1600px'},
        'xs': {'min': '550px'},
      }
    },
  },
  plugins: [],
};
