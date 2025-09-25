/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { Serwist, 
  NavigationRoute, 
  NetworkFirst, 
  StaleWhileRevalidate, 
  CacheFirst} from "serwist";

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
    // Rule for Next.js optimized images (like gingerbread.png)
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
      handler: new StaleWhileRevalidate({
        cacheName: "next-images",
      }),
    },
    // Rule for core Next.js static assets (JS, CSS)
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "next-static",
      }),
    },
    // Rule for fonts
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
    // Rule for any other same-origin images that aren't optimized by Next.js
    {
      matcher: ({ request, url }) =>
        request.destination === "image" && url.origin === self.location.origin,
      handler: new StaleWhileRevalidate({
        cacheName: "images",
      }),
    },
    // Rule for API routes - attempts network first, then falls back to cache.
    {
      matcher: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api",
        networkTimeoutSeconds: 2, // A short timeout is good for offline-first apps
      }),
    },
  ],
});

// This is the critical rule for offline navigation.
// It ensures that any page navigation request that can't be fulfilled by the network
// will be served the pre-cached /consent page as a fallback.
serwist.registerRoute(
  new NavigationRoute(
    serwist.createHandlerBoundToUrl("/consent")
  )
);

serwist.addEventListeners();

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

