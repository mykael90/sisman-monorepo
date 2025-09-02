import { Info } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { cn } from '@/lib/utils';

type InfoHoverCardProps = {
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  className?: string;
};

export const InfoHoverCard: React.FC<InfoHoverCardProps> = ({
  title,
  subtitle,
  content,
  className
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Info className='h-4 w-4 flex-shrink-0 cursor-pointer text-gray-500' />
      </HoverCardTrigger>
      <HoverCardContent
        className={cn('w-80 rounded-sm border bg-white text-sm', className)}
      >
        <div className='space-y-1'>
          {title && <p className='font-bold'>{title}</p>}
          {subtitle && <p className='italic'>{subtitle}</p>}
          {content && (
            <>
              <hr className='my-2' />
              {content}
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
