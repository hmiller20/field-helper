const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
  dest: "public",
  // Disable PWA in development mode.
  disable: process.env.NODE_ENV === "development",
  // Optional: automatically register the service worker and activate updates.
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
  fallbacks: {
    document: "/offline.html",
  }
});

module.exports = withPWA({
  reactStrictMode: true,
  // Add any additional Next.js configuration options here.
});