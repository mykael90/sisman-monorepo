import React from 'react';

export default function WarehouseLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* {modal} */}
    </>
  );
}
