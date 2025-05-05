'use client';

// sidebarContext.tsx (or similar)
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

interface SidebarProviderProps {
  children: React.ReactNode;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(!isMobile); // Initial state based on isMobile

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const contextValue: SidebarContextProps = {
    isCollapsed,
    toggleCollapse,
    isMobile
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};
