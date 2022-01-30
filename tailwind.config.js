module.exports = {
  purge: ['./src/**/*.tsx', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  important: true,
  theme: {
    fontFamily: {
      sans: [
        'Fira Sans',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Helvetica',
        'Arial',
        'sans-serif',
      ],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary-brand)',
          bg: 'var(--color-primary-background)',
          fg: 'var(--color-primary-foreground)',
        },
      },
      inset: {},
      screens: {
        xs: '508px',
      },
    },
  },
  plugins: [],
};
