"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Survey from '@/components/Survey';
import { getCurrentSession } from '@/utils/sessionData';

export default function SurveyPrestigePage() {
  const router = useRouter();
  const session = getCurrentSession();

  useEffect(() => {
    if (!session) {
      router.push('/consent');
      return;
    }
  }, [router, session]);

  if (!session) return null;
  return <Survey blockType="prestige" />;
}