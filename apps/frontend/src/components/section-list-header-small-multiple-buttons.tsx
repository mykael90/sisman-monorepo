'use client';

import { type FC } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/components/ui/button';

interface ActionButton {
  text: string;
  Icon?: FC<{ className?: string }>;
  onClick: () => void;
  variant?: VariantProps<typeof buttonVariants>['variant'];
}

interface SectionListHeaderSmallMultipleButtonsProps {
  title: string;
  subtitle?: string;
  TitleIcon?: FC<{ className?: string }>;
  actionButtons?: ActionButton[];
}

export function SectionListHeaderSmallMultipleButtons({
  title,
  subtitle,
  TitleIcon,
  actionButtons
}: SectionListHeaderSmallMultipleButtonsProps) {
  return (
    <div className='mt-4 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
      <div className='flex items-center'>
        {TitleIcon && (
          <div className='mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-lg'>
            <TitleIcon className='h-6 w-6' />
          </div>
        )}
        <div>
          <h1 className='text-primary text-xl font-bold'>{title}</h1>
          {subtitle && (
            <p className='text-md text-muted-foreground'>{subtitle}</p>
          )}
        </div>
      </div>

      {actionButtons && actionButtons.length > 0 && (
        <div className='flex w-full flex-wrap justify-end gap-2 sm:w-auto'>
          {actionButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.variant || 'outline'}
              onClick={button.onClick}
            >
              {button.Icon && <button.Icon className='mr-2 h-4 w-4' />}
              {button.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
