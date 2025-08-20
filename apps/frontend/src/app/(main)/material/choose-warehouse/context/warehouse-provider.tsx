'use client';

import { createContext, useContext, useState } from 'react';
import { IWarehouse } from '../../../warehouse/warehouse-types';

interface WarehouseContextProps {
  warehouse: IWarehouse | null;
  setWarehouse: (warehouse: IWarehouse) => void;
}

export const WarehouseContext = createContext<
  WarehouseContextProps | undefined
>(undefined);

interface WarehouseProviderProps {
  children: React.ReactNode;
  initialWarehouse: IWarehouse;
}

export const WarehouseProvider: React.FC<WarehouseProviderProps> = ({
  children,
  initialWarehouse
}) => {
  const [warehouse, setWarehouse] = useState<IWarehouse | null>(
    initialWarehouse
  ); // Initial state

  const contextValue: WarehouseContextProps = {
    warehouse,
    setWarehouse
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
