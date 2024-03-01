/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.ejs',
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
        'background-hover': 'var(--background-hover)',
        'background-inverse': 'var(--background-inverse)',
        'background-inverse-hover': 'var(--background-inverse-hover)',

        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'accent': 'var(--accent)',
      },

      screens: {
        'max-md': {'max': '767px'}
      }
    },
  },
  plugins: [],
};
