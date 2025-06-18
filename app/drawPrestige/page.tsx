"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Draw from '@/components/Draw';
import { getCurrentSession } from '@/utils/sessionData';

export default function DrawPrestigePage() {
  const router = useRouter();
  const session = getCurrentSession();
  const blocksSoFar = session?.blocks?.length || 0;
  
  useEffect(() => {
    if (!session) {
      router.push('/consent');
      return;
    }

    // After drawing, route to demographics if this was the last block
    if (blocksSoFar === 2) {
      router.push('/demographics');
    } else {
      // Otherwise route to the next block based on pdOrder
      const nextBlock = session.order[blocksSoFar - 1];
      router.push(`/prep${nextBlock.charAt(0).toUpperCase() + nextBlock.slice(1)}`);
    }
  }, [blocksSoFar, router, session]);

  if (!session) return null;
  return <Draw blockType="prestige" />;
}