/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./views/**/*.ejs",
      "./public/**/*.js"
    ],
    theme: {
      extend: {
        colors: {
          "google-blue": "#4285F4",
          "leaflet-green": "#199900",
        },
        animation: {
          "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }
      },
    },
    plugins: [
      
    ],
  }