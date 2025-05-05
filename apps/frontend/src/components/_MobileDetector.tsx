// /src/components/MobileDetector.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Attributes } from 'react';
import isMobile from '@/src/lib/is-mobile';

interface MobileDetectorProps {
  children: React.ReactNode;
}

export default function MobileDetector({ children }: MobileDetectorProps) {
  const [isMobileState, setIsMobileState] = useState<boolean | null>(null);

  useEffect(() => {
    const storedIsMobile = sessionStorage.getItem('isMobile');

    if (storedIsMobile) {
      setIsMobileState(storedIsMobile === 'true');
    } else {
      const fetchIsMobile = async () => {
        const isMobileFromServer = await isMobile();
        setIsMobileState(isMobileFromServer);
        sessionStorage.setItem('isMobile', String(isMobileFromServer));
      };
      fetchIsMobile();
    }
  }, []);

  if (isMobileState === null) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isMobile: isMobileState
          } as Partial<unknown> & Attributes);
        }
        return child;
      })}
    </>
  );
}
