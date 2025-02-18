/** @type {import('tailwindcss').Config} */
// "tailwindcss/nesting": "postcss-nested", 沒路用
module.exports = {
  plugins: {
    "postcss-nested": {},
    "tailwindcss/nesting": "postcss-nested",
    tailwindcss: {},
    autoprefixer: {},
  },
};
