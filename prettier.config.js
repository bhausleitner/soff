/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: [await import("prettier-plugin-tailwindcss")],
  tabWidth: 2,
  singleQuote: false
};

export default config;
