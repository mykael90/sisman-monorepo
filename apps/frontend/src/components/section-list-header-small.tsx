'use client';

import { type FC } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/components/ui/button';

interface SectionListHeaderSmallProps {
  title: string;
  subtitle?: string;
  TitleIcon?: FC<{ className?: string }>;
  actionButton?: {
    text: string;
    Icon?: FC<{ className?: string }>;
    onClick: () => void;
    variant?: VariantProps<typeof buttonVariants>['variant'];
  };
}

export function SectionListHeaderSmall({
  title,
  subtitle,
  TitleIcon,
  actionButton
}: SectionListHeaderSmallProps) {
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
      {actionButton && (
        <div className='flex w-full justify-end sm:w-auto'>
          <Button
            variant={actionButton.variant || 'outline'}
            onClick={actionButton.onClick}
          >
            {actionButton.Icon && (
              <actionButton.Icon className='mr-2 h-4 w-4' />
            )}
            {actionButton.text}
          </Button>
        </div>
      )}
    </div>
  );
}
