'use client';

import React from 'react';
import { useSidebarContext } from '../context/sidebar-provider';

export default function Main({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarContext();
  return (
    <div
      className={`flex flex-1 flex-col overflow-y-auto ${!isCollapsed ? 'hidden sm:block' : ''}`}
    >
      {children}
    </div>
  );
}
