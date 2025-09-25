/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // This is the definitive list of every page and asset that MUST be
  // available offline. The service worker will not finish installing
  // until every single one of these has been successfully cached.
  additionalPrecacheEntries: [
    // Core Shell & PWA Assets
    "/consent",
    "/manifest.json",
    "/favicon.ico",
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/consent-form.pdf",
    "/debriefing-form.pdf",
    // All Application Pages
    "/exampleDrawing",
    "/information",
    "/experimenter",
    "/prepBaseline",
    "/prepControl",
    "/prepDominance",
    "/prepPrestige",
    "/prepLowStatus",
    "/vignetteControl",
    "/vignetteDominance",
    "/vignettePrestige",
    "/vignetteLowStatus",
    "/surveyControl",
    "/surveyDominance",
    "/surveyPrestige",
    "/surveyLowStatus",
    "/drawBaseline",
    "/drawControl",
    "/drawDominance",
    "/drawPrestige",
    "/drawLowStatus",
    "/demographics",
    "/debriefing",
  ],
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // Your regular Next.js config options can go here
};

export default withSerwist(nextConfig);