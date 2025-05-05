'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

interface SummaryProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Summary: React.FC<SummaryProps> = ({
  href,
  children,
  className,
  onClick
}) => {
  const pathname = usePathname();
  const isActive = href ? pathname.includes(href) : false; // Modified line

  return (
    <summary
      onClick={onClick}
      className={`hover:bg-sisman-green/80 hover:text-sisman-gray dark:hover:bg-sisman-green/80 ${className} ${
        isActive ? 'bg-sisman-green/30 font-semibold' : ''
      }`}
    >
      {children}
    </summary>
  );
};

export default Summary;
