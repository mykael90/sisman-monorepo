'use client';

import { type FC } from 'react'; // FC for functional component types
import { type VariantProps } from 'class-variance-authority'; // To get variant types
import { Button, buttonVariants } from '@/components/ui/button'; // Button and its props type

interface SectionListHeaderSmall {
  title: string;
  subtitle?: string;
  TitleIcon?: FC<{ className?: string }>; // Optional icon for the title area
  actionButton?: {
    text: string;
    Icon?: FC<{ className?: string }>; // Optional icon for the button
    onClick: () => void;
    variant?: VariantProps<typeof buttonVariants>['variant']; // Corrected button variant type
  };
}

export function SectionListHeaderSmall({
  title,
  subtitle,
  TitleIcon,
  actionButton
}: SectionListHeaderSmall) {
  return (
    <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
      <div className='flex items-center'>
        {TitleIcon && (
          <div className='mr-3 flex h-6 w-6 shrink-0 items-center justify-center'>
            <TitleIcon className='text-muted-foreground h-12 w-12' />
          </div>
        )}
        <div>
          <h1 className='text-sisman-blue text-xl font-bold'>{title}</h1>
          {subtitle && (
            <p className='text-muted-foreground text-md'>{subtitle}</p>
          )}
        </div>
      </div>
      {actionButton && (
        <div className='flex w-full justify-end sm:w-auto'>
          <Button
            variant={actionButton.variant || 'default'}
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
