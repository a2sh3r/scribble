/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#191919",
        secondary: "#202020",
        textPrimary: "#E4E4E4",
        textSecondary: "#868484",
        bgRegCard: "rgba(32,32,32,0.56)",
        bgRegCardBtn: "rgb(32,32,32)",
      },
      fontFamily: {
        clashDisplay: ["ClashDisplay", "sans-serif"],
        interTight: ["InterTight", "sans-serif"],
      },
      boxShadow: {
        custom: "0px 4px 4px 0 rgba(0,0,0,0.25)",
      },
      backgroundImage: {
        "gradient-custom":
          "linear-gradient(-106deg, #E9FFBA 0%, #FF9A61 36%, #FF7918 74%, #FCBFD1 100%)",
        "gradient-custom-inverse":
          "linear-gradient(106deg, #E9FFBA 0%, #FF9A61 36%, #FF7918 74%, #FCBFD1 100%)",
      },
      screens: {
        sm: "0px", // от 0
        md: "420px", // от 420
        lg: "720px", // от 720
        xl: "1450px", // от 1450
      },
    },
  },
  plugins: [],
};
