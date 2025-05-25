
'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalStars = 5,
  size = 16,
  className,
  onRatingChange,
  interactive = false,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleStarClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const handleStarHover = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)} onMouseLeave={handleMouseLeave}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const currentRatingToDisplay = hoverRating || rating;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              'transition-colors',
              currentRatingToDisplay >= starValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300',
              interactive ? 'cursor-pointer hover:text-yellow-300 hover:fill-yellow-300' : ''
            )}
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleStarHover(index)}
          />
        );
      })}
    </div>
  );
};
