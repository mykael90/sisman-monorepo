import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRatingDisplay({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  className
}: StarRatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= maxRating; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star
            key={i}
            className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')}
          />
        );
      } else {
        stars.push(
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              'text-muted-foreground fill-gray-200'
            )}
          />
        );
      }
    }

    return stars;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className='flex items-center'>{renderStars()}</div>
      {showValue && (
        <span className='text-muted-foreground text-sm font-medium'>
          {rating.toFixed(2)}
        </span>
      )}
    </div>
  );
}

interface StarRatingDistributionProps {
  individualRatings: { [key: string]: { count: number; percentage: number } };
  totalResponses: number;
  averageRating: number;
}

export function StarRatingDistribution({
  individualRatings,
  totalResponses,
  averageRating
}: StarRatingDistributionProps) {
  const ratingKeys = Object.keys(individualRatings).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='font-medium'>Distribuição das Avaliações</h4>
          <p className='text-muted-foreground text-sm'>
            Total: {totalResponses} respostas
          </p>
        </div>
        <div className='text-right'>
          <p className='text-muted-foreground text-sm'>Média</p>
          <StarRatingDisplay
            rating={averageRating}
            size='md'
            showValue={true}
          />
        </div>
      </div>

      <div className='space-y-3'>
        {ratingKeys.map((key) => {
          const rating = individualRatings[key];
          const starCount = parseInt(key);

          return (
            <div key={key} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='flex'>
                    {Array.from({ length: starCount }).map((_, i) => (
                      <Star
                        key={i}
                        className='h-4 w-4 fill-yellow-400 text-yellow-400'
                      />
                    ))}
                  </div>
                  <span className='text-sm font-medium'>
                    {starCount} estrela{starCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className='text-sm'>
                  <span className='font-medium'>{rating.count}</span>
                  <span className='text-muted-foreground ml-1'>
                    ({rating.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                <div
                  className='bg-primary h-full rounded-full'
                  style={{ width: `${rating.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
