const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
  dest: "public",
  // Disable PWA in development mode.
  disable: process.env.NODE_ENV === "development",
  // Automatically register the service worker and activate updates.
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.pdf$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-pdf-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    ...runtimeCaching,
  ],
  // Removed fallbacks so that the full app shell is served offline.
});

module.exports = withPWA({
  reactStrictMode: true,
  // Add any additional Next.js configuration options here.
});