'use client';

import React from 'react';
import { useSidebarContext } from '../context/sidebar-provider';

export default function Main({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarContext();
  return (
    <div
      className={`flex-1 overflow-y-auto ${!isCollapsed ? 'hidden sm:block' : ''}`}
    >
      {children}
    </div>
  );
}
