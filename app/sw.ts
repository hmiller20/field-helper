/// <reference lib="webworker" />

import { Serwist } from "serwist";
import { NetworkFirst } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // Cache Next.js navigation requests specifically
    {
      matcher: ({ url, request }) => {
        return request.destination === 'document' || 
               url.pathname.startsWith('/_next/') ||
               url.pathname.match(/\/(consent|demographics|information|exampleDrawing|prepBaseline|prepControl|prepPrestige|prepDominance|prepLowStatus|vignetteControl|vignettePrestige|vignetteDominance|vignetteLowStatus|drawBaseline|drawControl|drawPrestige|drawDominance|drawLowStatus|surveyControl|surveyPrestige|surveyDominance|surveyLowStatus|debriefing|experimenter)$/);
      },
      handler: new NetworkFirst({
        cacheName: "navigation-cache"
      }),
    },
    // Catch-all for everything else
    {
      matcher: ({ url }) => url.protocol.startsWith('http'),
      handler: new NetworkFirst({
        cacheName: "offlineCache",
      }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});