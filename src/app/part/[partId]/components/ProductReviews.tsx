
'use client';

import React from 'react';
import type { Review, AutoPart } from '@/types/autopart';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/ui/rating-stars';
import { AddReviewForm } from './AddReviewForm';
import type { StoredUser } from '@/types/user';

interface ProductReviewsProps {
  partDetails: AutoPart;
  currentUser: StoredUser | null;
  onReviewAdded: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ partDetails, currentUser, onReviewAdded }) => {
  const reviews = partDetails.reviews || [];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Отзывы ({reviews.length})</h3>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">Отзывов пока нет. Будьте первым!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                <Avatar className="h-10 w-10">
                  {/* Placeholder for avatar image if available */}
                  {/* <AvatarImage src={review.userAvatarUrl} alt={review.username} /> */}
                  <AvatarFallback>{review.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{review.username}</CardTitle>
                  <CardDescription className="text-xs">
                    {format(new Date(review.date), 'PPP', { locale: ru })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pl-[58px]"> {/* Align with Avatar + spacing */}
                <RatingStars rating={review.rating} size={16} />
                <p className="text-sm mt-2 text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AddReviewForm partId={partDetails.id} currentUser={currentUser} onReviewAdded={onReviewAdded} />
    </div>
  );
};
