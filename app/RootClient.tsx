'use client';

import { useEffect } from 'react';

export default function RootClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("Attempting manual registration...");
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered:', reg))
        .catch(err => console.error('Service Worker registration error:', err));
    }
  }, []);

  return <>{children}</>;
}
