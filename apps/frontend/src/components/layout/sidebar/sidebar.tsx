'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSidebarContext } from '@/src/components/context/sidebar-provider';
import NavLink from '@/src/components/ui/navlink';
import Summary from '@/src/components/ui/summary';
import { DIVIDER_LABEL, SidebarItem, sidebarItems } from './sidebarItems';
import { ChevronRight } from 'lucide-react';

interface SidebarItemProps {
  item: SidebarItem;
  isCollapsed: boolean;
  isMobile: boolean;
  collapseSidebar: () => void;
  toggleCollapse: () => void;
  depth?: number;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  isCollapsed,
  isMobile,
  collapseSidebar,
  toggleCollapse,
  depth = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.addEventListener('toggle', () => {
        setIsOpen(detailsRef.current?.open || false);
      });
    }
  }, []);

  useEffect(() => {
    if (isCollapsed && detailsRef.current) {
      detailsRef.current.removeAttribute('open');
      setIsOpen(false);
    }
  }, [isCollapsed]);

  if (item.children) {
    const uniqueGroupClass = `group-${depth}-${item.label.replace(/\s+/g, '-')}`;
    return (
      <details
        ref={detailsRef}
        data-open={isOpen}
        className={`${uniqueGroupClass}`}
      >
        <Summary
          href={item.href}
          className={`flex w-full cursor-pointer list-none items-center rounded-md px-3 py-2 focus:outline-none ${
            isCollapsed ? 'hidden justify-center sm:flex' : 'justify-start'
          }`}
          onClick={isCollapsed ? toggleCollapse : undefined}
        >
          {item.icon && <span>{item.icon}</span>}
          <span
            className={`ps-1 transition-opacity duration-300 ${
              isCollapsed ? 'hidden' : 'sm:opacity-100'
            }`}
          >
            {item.label}
          </span>
          {!isCollapsed && (
            <ChevronRight
              className={`ml-auto h-4 w-4 transition-transform ${
                isOpen ? 'rotate-90' : ''
              }`}
            />
          )}
        </Summary>
        <ul
          className={`mt-2 ml-6 space-y-1 ${isCollapsed ? 'hidden' : ''} rounded-tl-md rounded-bl-3xl bg-gray-100 dark:bg-gray-700`}
        >
          {item.children.map((child) =>
            child.label === DIVIDER_LABEL ? (
              <li
                key={child.label}
                className='my-2 border-b border-gray-300 dark:border-gray-600'
              />
            ) : (
              <li key={child.label}>
                <SidebarItemComponent
                  item={child}
                  isCollapsed={isCollapsed}
                  isMobile={isMobile}
                  collapseSidebar={collapseSidebar}
                  toggleCollapse={toggleCollapse}
                  depth={depth + 1}
                />
              </li>
            )
          )}
        </ul>
      </details>
    );
  } else if (item.href) {
    return (
      <NavLink
        href={item.href}
        className={`flex items-center rounded-md px-4 py-2 ${
          isCollapsed ? 'hidden justify-center sm:flex' : 'justify-start'
        }`}
        onClick={() => {
          if (isMobile) {
            collapseSidebar();
          }
        }}
      >
        {item.icon && <span>{item.icon}</span>}
        <span
          className={`ps-1 transition-opacity duration-300 ${
            isCollapsed ? 'hidden' : 'opacity-100'
          }`}
        >
          {item.label}
        </span>
      </NavLink>
    );
  } else {
    return <span className='block px-4 py-2 ps-1'>{item.label}</span>;
  }
};

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleCollapse, isMobile } = useSidebarContext();
  const sidebarRef = useRef<HTMLElement>(null);
  // const [mounted, setMounted] = React.useState(false);

  const collapseSidebar = () => {
    if (!isCollapsed) {
      toggleCollapse();
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className={`${sidebarRef.current ? 'flex' : 'hidden'} overflow-x-hidden overflow-y-auto bg-gray-50 text-gray-700 transition-all duration-300 sm:flex dark:bg-gray-800 dark:text-gray-300 ${
        isCollapsed ? 'w:0 sm:w-16' : 'w-full sm:w-64'
      } border-r`}
    >
      <nav className='mt-1 flex w-full flex-col'>
        <ul className='space-y-2'>
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <SidebarItemComponent
                item={item}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                collapseSidebar={collapseSidebar}
                toggleCollapse={toggleCollapse}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
