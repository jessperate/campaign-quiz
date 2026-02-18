'use client';

import { useEffect } from 'react';
import { initLogRocket } from '@/lib/logrocket';

export function LogRocketProvider() {
  useEffect(() => {
    // Initialize LogRocket on mount
    initLogRocket();
  }, []);

  // This component doesn't render anything
  return null;
}
