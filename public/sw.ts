/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { Serwist, NavigationRoute } from "serwist";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  cacheId: "field-helper",
  runtimeCaching: [
    // Next.js static assets
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "next-static",
      }),
    },
    // Next.js Image optimization
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
      handler: new StaleWhileRevalidate({
        cacheName: "next-image",
      }),
    },
    // Fonts
    {
      matcher: ({ url }) =>
        url.origin === self.location.origin &&
        (url.pathname.endsWith(".woff") ||
         url.pathname.endsWith(".woff2") ||
         url.pathname.endsWith(".ttf")),
      handler: new CacheFirst({
        cacheName: "fonts",
      }),
    },
    // Same-origin images
    {
      matcher: ({ request, url }) =>
        request.destination === "image" && url.origin === self.location.origin,
      handler: new StaleWhileRevalidate({
        cacheName: "images",
      }),
    },
    // API routes - minimal caching to avoid stale data
    {
      matcher: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api",
        networkTimeoutSeconds: 2,
      }),
    },
  ],
});

// Register proper NavigationRoute with app shell fallback
// This ensures any navigation request falls back to root app shell if the specific page isn't cached
serwist.registerRoute(
  new NavigationRoute(
    serwist.createHandlerBoundToUrl("/consent")
  )
);

serwist.addToPrecacheList([
  '/',                // keep your shell if you still use it
  '/manifest.json',
  '/favicon.ico',
]);

serwist.addEventListeners();

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});