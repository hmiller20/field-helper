const withPWA = require("next-pwa")({
  dest: "public",
  // Disable PWA in development mode.
  disable: process.env.NODE_ENV === "development",
  // Optional: automatically register the service worker and activate updates.
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  // Add any additional Next.js configuration options here.
});