"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Prep from '@/components/Prep';
import { getCurrentSession } from '@/utils/sessionData';

export default function PrepPrestigePage() {
  const router = useRouter();
  const session = getCurrentSession();

  useEffect(() => {
    if (!session) {
      router.push('/consent');
      return;
    }
  }, [router, session]);

  if (!session) return null;
  return <Prep blockType="prestige" />;
}