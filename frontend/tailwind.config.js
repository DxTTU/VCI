/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VASAVI Clubs International Official Colors
        VASAVI: {
          blue: "#00338D",      // Official VASAVI Blue
          blueDark: "#00225D",
          blueLight: "#0A46B3",
          blueMuted: "rgba(0, 51, 141, 0.08)",
          gold: "#F2A900",      // Official VASAVI Gold
          goldMuted: "rgba(242, 169, 0, 0.15)",
          goldDark: "#C98B00",
        },
        // "The Ordinary" Clinical Minimalist Palette
        clinical: {
          bg: "#FFFFFF",
          subtle: "#F9F9F9",
          panel: "#F5F5F7",
          border: "#E5E5E5",
          borderDark: "#D1D1D1",
          muted: "#737373",
          secondary: "#525252",
          text: "#171717",
          stark: "#000000",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      letterSpacing: {
        widest: "0.15em",
        clinical: "0.22em",
      },
      boxShadow: {
        none: "none",
        hairline: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      },
      borderWidth: {
        hairline: "1px",
      },
    },
  },
  plugins: [],
}
