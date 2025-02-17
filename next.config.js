const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
  dest: "public",
  // Disable PWA in development mode.
  disable: process.env.NODE_ENV === "development",
  // Automatically register the service worker and activate updates.
  register: true,
  skipWaiting: true,
  // Exclude files that should not be precached
  buildExcludes: [/\/_next\/app-build-manifest\.json$/],
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
  // Pre-cache the PDF so it's available offline
  additionalManifestEntries: [
    { url: '/old-consent-form.pdf', revision: '1' } // update revision as needed
  ],
  // Removed fallback so that interactive pages (the full app shell) are served offline.
});

module.exports = withPWA({
  reactStrictMode: true,
  // Add any additional Next.js configuration options here.
});