const plugin = require('tailwindcss/plugin');

module.exports = {
  mode: 'jit',
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    safeList: [],
    content: ['**/*.html', './src/**/*.tsx', './src/**/*.ts'],
  },
  theme: {
    colors: {
      base03: "#002b36",
      base02: "#073642",
      base01: "#586e75",
      base00: "#657b83",
      base0: "#839496",
      base1: "#93a1a1",
      base2: "#eee8d5",
      base3: "#fdf6e3",
      yellow: "#b58900",
      orange: "#cb4b16",
      red: "#dc322f",
      magenta: "#d33682",
      violet: "#6c71c4",
      blue: "#268bd2",
      cyan: "#2aa198",
      green: "#859900",
    }
  },
  plugins: [
    plugin(function({ addBase, theme }) {
      addBase({
        'h1': { fontSize: theme('fontSize.2xl'), marginTop: "1rem", },
        'h2': { fontSize: theme('fontSize.xl'), marginTop: "1rem", },
        'h3': { fontSize: theme('fontSize.lg'), marginTop: "1rem", },
      })
    })
  ]
};
