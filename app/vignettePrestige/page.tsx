"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Vignette from '@/components/Vignette';
import { getCurrentSession } from '@/utils/sessionData';

export default function VignettePrestigePage() {
  const router = useRouter();
  const session = getCurrentSession();

  useEffect(() => {
    if (!session) {
      router.push('/consent');
      return;
    }
  }, [router, session]);

  if (!session) return null;
  return <Vignette blockType="prestige" />;
}