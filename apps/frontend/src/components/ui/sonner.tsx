'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      richColors
      closeButton
      position='top-center'
      duration={5000}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--accent)',
          '--success-text': 'var(--accent-foreground)',
          '--success-border': 'var(--accent)',
          '--error-bg': 'var(--destructive)',
          '--error-text': 'var(--destructive-foreground)',
          '--error-border': 'var(--destructive)',
          '--warning-bg': 'var(--muted)',
          '--warning-text': 'var(--muted-foreground)',
          '--warning-border': 'var(--muted)',
          '--info-bg': 'var(--primary)',
          '--info-text': 'var(--primary-foreground)',
          '--info-border': 'var(--primary)'
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
