module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base': '#FCFCFC',
        'base-color': '#FCFCFC',
        'base-cont': '#080d1b',
        'base-cont-transparent': '#080d1be6',
        'main': '#80b341',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}