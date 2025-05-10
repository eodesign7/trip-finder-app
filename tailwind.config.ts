import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        omio: {
          blue: "#213547",
          light: "#f5f7fa",
          red: "#ff5b5b",
          white: "#fff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
