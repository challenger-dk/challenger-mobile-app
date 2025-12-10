/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#171616',
        surface: '#2c2c2c',
        surfaceHighlight: '#3a3a3a',
        primary: '#0A84FF',
        success: '#016937',
        danger: '#943d40',
        warning: '#fbb03c',
        softBlue: '#2F6487',
        softGreen: '#76a179',
        softPurple: '#8572a3',
        darkBrown: '#423b38',
        text: {
          DEFAULT: '#ffffff',
          muted: '#9CA3AF',
          disabled: '#575757',
        },
      },
    },
  },
  plugins: [],
};
