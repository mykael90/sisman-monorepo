import type { ReactNode } from 'react';

interface MaintenanceInstanceLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function MaintenanceInstanceLayout({
  children,
  modal
}: MaintenanceInstanceLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
