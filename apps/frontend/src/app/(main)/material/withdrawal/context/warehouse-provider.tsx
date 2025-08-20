'use client';

import { createContext, useContext, useState } from 'react';

interface WarehouseContextProps {
  warehouseId: number;
  setWarehouseId: (warehouseId: number) => void;
}

export const WarehouseContext = createContext<
  WarehouseContextProps | undefined
>(undefined);

interface WarehouseProviderProps {
  children: React.ReactNode;
  initialWarehouseId: number;
}

export const WarehouseProvider: React.FC<WarehouseProviderProps> = ({
  children,
  initialWarehouseId
}) => {
  const [warehouseId, setWarehouseId] = useState<number>(initialWarehouseId); // Initial state

  const contextValue: WarehouseContextProps = {
    warehouseId,
    setWarehouseId
  };

  return (
    <WarehouseContext.Provider value={contextValue}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouseContext = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error(
      'useWarehouseContext must be used within a WarehouseProvider'
    );
  }
  return context;
};
