// This file should now be located at `app/sw.ts`
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NavigationRoute } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // IMPORTANT: We now use the official `defaultCache` from Serwist.
  // This handles Next.js assets (chunks, images, etc.) correctly by default.
  runtimeCaching: defaultCache,
});

// We STILL add our custom NavigationRoute. This is crucial.
// It ensures that any offline navigation falls back to our app shell (`/consent`).
serwist.registerRoute(new NavigationRoute(serwist.createHandlerBoundToUrl("/consent")));

serwist.addEventListeners();