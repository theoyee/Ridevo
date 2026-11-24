/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#101820",
        accent: "#C8F560",
        background: "#FFFFFF",
        surface: "#F4F5F7",
        border: "#E4E7EC",
        muted: "#667085",
        disabled: "#98A2B3",
        success: "#15803D",
        error: "#DC2626",
        warning: "#D97706",
        info: "#2563EB",
      },
      fontFamily: {
        regular: ["Inter-Regular"],
        medium: ["Inter-Medium"],
        semibold: ["Inter-SemiBold"],
        bold: ["Inter-Bold"],
      },
      borderRadius: {
        card: "20px",
        button: "9999px",
      },
    },
  },
  plugins: [],
};
