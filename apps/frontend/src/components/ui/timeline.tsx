import * as React from 'react';
import { cn } from '@/lib/utils'; // Certifique-se de que o caminho para cn está correto

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn('border-border relative border-s', className)}
    {...props}
  />
));
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('ms-6 mb-10', className)} {...props} />
));
TimelineItem.displayName = 'TimelineItem';

const TimelineConnector = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'bg-primary ring-background absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8',
      className
    )}
    {...props}
  />
));
TimelineConnector.displayName = 'TimelineConnector';

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-primary ring-background absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8',
      className
    )}
    {...props}
  />
));
TimelineIcon.displayName = 'TimelineIcon';

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between gap-x-2', className)}
    {...props}
  />
));
TimelineHeader.displayName = 'TimelineHeader';

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-foreground flex items-center text-lg font-semibold',
      className
    )}
    {...props}
  />
));
TimelineTitle.displayName = 'TimelineTitle';

const TimelineDate = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'text-muted-foreground me-2 inline-flex items-center text-sm leading-none font-normal',
      className
    )}
    {...props}
  />
));
TimelineDate.displayName = 'TimelineDate';

const TimelineBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-muted-foreground mt-2 text-base font-normal',
      className
    )}
    {...props}
  />
));
TimelineBody.displayName = 'TimelineBody';

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-muted-foreground text-sm font-normal', className)}
    {...props}
  />
));
TimelineDescription.displayName = 'TimelineDescription';

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineIcon,
  TimelineHeader,
  TimelineTitle,
  TimelineDate,
  TimelineBody,
  TimelineDescription
};
