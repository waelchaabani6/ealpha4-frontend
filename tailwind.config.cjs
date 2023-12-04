/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        'unset': 'unset'
      },
      colors: {
        accent: "var(--accent)",
        "light-accent": "var(--light-accent)",
        sunlight: "var(--sunlight)",
        fishgray: "var(--fishgray)",
        skypink: "var(--skypink)",
        sandgray: "var(--sandgray)",
        linegray: "var(--linegray)"
      },
      backgroundColor: {
        accent: "var(--accent)",
        "light-accent": "var(--light-accent)",
        "light-sunlight": "var(--light-sunlight)",
        sunlight: "var(--sunlight)",
        fishgray: "var(--fishgray)",
        skypink: "var(--skypink)",
        sandgray: "var(--sandgray)",
        linegray: "var(--linegray)"
      },
    },
  },
  plugins: [],
};
