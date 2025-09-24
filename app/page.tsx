// app/page.tsx

'use client';
export const dynamic = 'force-static'; // important: makes this build to static HTML

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();

  useEffect(() => {
    if (navigator.onLine) {
      router.replace('/consent'); // redirect only when online
    }
  }, [router]);

  return (
    <main>
      <h1>Field Helper</h1>
      <p>Offline shell is working.</p>
      <a href="/consent">Start survey</a>
    </main>
  );
}