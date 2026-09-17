/** @type {import('postcss-load-config').Config} */
/**
 * PostCSS configuration for styling.
 * Processes Tailwind CSS and Autoprefixer.
 */
export default {
  plugins: {
    // Tailwind and Autoprefixer for CSS processing and cross-browser support
    // (Ensure these plugins remain strictly ordered as they process CSS sequentially)
    tailwindcss: {},
    autoprefixer: {},
  },
};
