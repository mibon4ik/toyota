
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RatingStars } from '@/components/ui/rating-stars';
import { useToast } from '@/hooks/use-toast';
import { addReviewToAutoPart } from '@/services/autoparts';
import type { StoredUser } from '@/types/user';
import { Icons } from '@/components/icons';

const reviewSchema = z.object({
  rating: z.number().min(1, "Рейтинг должен быть от 1 до 5").max(5, "Рейтинг должен быть от 1 до 5"),
  comment: z.string().min(10, "Комментарий должен содержать не менее 10 символов").max(500, "Комментарий не должен превышать 500 символов"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface AddReviewFormProps {
  partId: string;
  currentUser: StoredUser | null;
  onReviewAdded: () => void; // Callback to refresh reviews
}

export const AddReviewForm: React.FC<AddReviewFormProps> = ({ partId, currentUser, onReviewAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const currentRating = watch('rating');

  // Need to register rating field for react-hook-form
  React.useEffect(() => {
    register('rating');
  }, [register]);

  const handleRatingChange = (newRating: number) => {
    setValue('rating', newRating, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ReviewFormData> = async (data) => {
    if (!currentUser) {
      toast({ title: "Ошибка", description: "Только авторизованные пользователи могут оставлять отзывы.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addReviewToAutoPart(partId, {
        userId: currentUser.id,
        username: currentUser.username,
        rating: data.rating,
        comment: data.comment,
      });
      toast({ title: "Отзыв добавлен!", description: "Спасибо за ваш отзыв." });
      reset(); // Reset form fields
      setValue('rating', 0); // Explicitly reset rating visual
      onReviewAdded(); // Trigger review list refresh
    } catch (error: any) {
      toast({ title: "Ошибка", description: error.message || "Не удалось добавить отзыв.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return <p className="text-sm text-muted-foreground">Пожалуйста, <a href="/auth/login" className="underline">войдите</a>, чтобы оставить отзыв.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 border-t pt-6">
      <h4 className="text-lg font-semibold">Оставить отзыв</h4>
      <div>
        <Label htmlFor="rating">Ваша оценка</Label>
        <RatingStars rating={currentRating} onRatingChange={handleRatingChange} interactive size={24} />
        {errors.rating && <p className="text-destructive text-xs mt-1">{errors.rating.message}</p>}
      </div>
      <div>
        <Label htmlFor="comment">Ваш комментарий</Label>
        <Textarea
          id="comment"
          {...register('comment')}
          placeholder="Поделитесь своим мнением о товаре..."
          rows={4}
          disabled={isSubmitting}
        />
        {errors.comment && <p className="text-destructive text-xs mt-1">{errors.comment.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="bg-[#535353ff] hover:bg-[#535353ff]/90">
        {isSubmitting ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
      </Button>
    </form>
  );
};
