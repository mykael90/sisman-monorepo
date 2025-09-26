import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Ativo':
      case 'Sim':
        return 'bg-green-100 text-green-800';
      case 'Inativo':
      case 'Não':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
        status
      )}`}
    >
      {status}
    </span>
  );
}
