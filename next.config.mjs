/** @type {import('next').NextConfig} */
import withSerwist from "@serwist/next";

const nextConfig = {
  // Your regular Next.js config options can go here
};

export default withSerwist({
  swSrc: "public/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  // This list ensures your core app shell, manifest, and icons are
  // available immediately offline. We removed gingerbread.png because
  // the runtime rule in sw.ts now handles all optimized images automatically.
  additionalPrecacheEntries: [
    "/consent",
    "/exampleDrawing",
    "/information",
    "/experimenter",
    // Prep pages
    "/prepBaseline",
    "/prepControl",
    "/prepDominance",
    "/prepPrestige",
    "/prepLowStatus",
    // Vignette pages
    "/vignetteControl",
    "/vignetteDominance",
    "/vignettePrestige",
    "/vignetteLowStatus",
    // Survey pages
    "/surveyControl",
    "/surveyDominance",
    "/surveyPrestige",
    "/surveyLowStatus",
    // Drawing pages
    "/drawBaseline",
    "/drawControl",
    "/drawDominance",
    "/drawPrestige",
    "/drawLowStatus",
    // Final pages
    "/demographics",
    "/debriefing",
    // Static assets
    "/manifest.json",
    "/favicon.ico",
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/icon-any.svg"
  ],
  disable: process.env.NODE_ENV === "development",
})(nextConfig);