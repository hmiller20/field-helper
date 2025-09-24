'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// An array containing all the routes that need to be available offline.
// Next.js will download the necessary code for these pages in the background.
const CRITICAL_ROUTES = [
  '/consent',
  '/debriefing',
  '/demographics',
  '/drawBaseline',
  '/drawControl',
  '/drawDominance',
  '/drawLowStatus',
  '/drawPrestige',
  '/exampleDrawing',
  '/experimenter',
  '/information',
  '/prepBaseline',
  '/prepControl',
  '/prepLowStatus',
  '/prepPrestige',
  '/surveyControl',
  '/surveyDominance',
  '/surveyLowStatus',
  '/surveyPrestige',
  '/vignetteControl',
  '/vignetteDominance',
  '/vignettePrestige',
  '/vignetteLowStatus',
];

/**
 * A client component that renders nothing but silently prefetches
 * all critical application routes to ensure they are cached by the
 * service worker for offline use.
 */
export function Prefetcher() {
  const router = useRouter();

  useEffect(() => {
    // This effect runs once when the app loads.
    // We only prefetch if the user is online to avoid errors.
    if (navigator.onLine) {
      CRITICAL_ROUTES.forEach(route => {
        // router.prefetch() downloads the assets for a given page
        // without navigating to it. The service worker will automatically
        // cache these assets because of our runtime caching rules.
        router.prefetch(route);
      });
    }
  }, [router]); // The effect depends on the router and runs once.

  return null; // This component does not render any visible UI.
}