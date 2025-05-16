
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { updateBanner } from '@/services/banners';
import type { Banner } from '@/types/banner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const bannerValidationSchema = z.object({
  title: z.string().min(3, 'Заголовок должен содержать не менее 3 символов'),
  imageUrl: z.string().url('Неверный URL изображения'),
  buttonText: z.string().min(3, 'Текст кнопки должен содержать не менее 3 символов'),
  link: z.string().min(1, 'Ссылка обязательна'),
  imageHint: z.string().optional(),
  dataAiHint: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BannerFormValues = z.infer<typeof bannerValidationSchema>;

interface EditBannerFormProps {
  bannerData: Banner | null;
  isFormOpen: boolean;
  closeForm: () => void;
  onBannerSave: () => void;
}

export const EditBannerForm: React.FC<EditBannerFormProps> = ({ bannerData, isFormOpen, closeForm, onBannerSave }) => {
  const { toast: displayToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerValidationSchema),
  });

  useEffect(() => {
    if (bannerData && isFormOpen) {
      setValue('title', bannerData.title);
      setValue('imageUrl', bannerData.imageUrl);
      setValue('buttonText', bannerData.buttonText);
      setValue('link', bannerData.link);
      setValue('imageHint', bannerData.imageHint || '');
      setValue('dataAiHint', bannerData.dataAiHint || '');
      setValue('isActive', bannerData.isActive);
    } else if (!isFormOpen) {
      reset();
    }
  }, [bannerData, isFormOpen, setValue, reset]);

  const handleFormSubmitAction: SubmitHandler<BannerFormValues> = async (data) => {
    if (!bannerData) return;
    setIsSubmitting(true);
    try {
      const payloadToUpdate: Partial<Omit<Banner, 'id'>> = { ...data };
      await updateBanner(bannerData.id, payloadToUpdate);
      displayToast({
        title: 'Баннер обновлен!',
        description: `Баннер "${data.title}" успешно обновлен.`,
      });
      onBannerSave();
      closeForm();
    } catch (err: any) {
      displayToast({
        title: 'Ошибка',
        description: err.message || 'Не удалось обновить баннер. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bannerData) return null;

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Редактировать баннер: {bannerData.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmitAction)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="edit-banner-title">Заголовок</Label>
            <Input id="edit-banner-title" {...register('title')} disabled={isSubmitting} />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="edit-banner-imageUrl">URL изображения</Label>
            <Input id="edit-banner-imageUrl" type="url" {...register('imageUrl')} disabled={isSubmitting} />
            {errors.imageUrl && <p className="text-destructive text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>
          <div>
            <Label htmlFor="edit-banner-buttonText">Текст кнопки</Label>
            <Input id="edit-banner-buttonText" {...register('buttonText')} disabled={isSubmitting} />
            {errors.buttonText && <p className="text-destructive text-xs mt-1">{errors.buttonText.message}</p>}
          </div>
          <div>
            <Label htmlFor="edit-banner-link">Ссылка</Label>
            <Input id="edit-banner-link" {...register('link')} disabled={isSubmitting} />
            {errors.link && <p className="text-destructive text-xs mt-1">{errors.link.message}</p>}
          </div>
          <div>
            <Label htmlFor="edit-banner-imageHint">Подсказка для Unsplash (макс. 2 слова)</Label>
            <Input id="edit-banner-imageHint" {...register('imageHint')} disabled={isSubmitting} />
            {errors.imageHint && <p className="text-destructive text-xs mt-1">{errors.imageHint.message}</p>}
          </div>
           <div>
            <Label htmlFor="edit-banner-dataAiHint">Подсказка для AI (опционально)</Label>
            <Input id="edit-banner-dataAiHint" {...register('dataAiHint')} disabled={isSubmitting} />
            {errors.dataAiHint && <p className="text-destructive text-xs mt-1">{errors.dataAiHint.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
                id="edit-banner-isActive" 
                {...register('isActive')} 
                checked={control._formValues.isActive}
                onCheckedChange={(checked) => setValue('isActive', Boolean(checked))}
                disabled={isSubmitting} 
            />
            <Label htmlFor="edit-banner-isActive" className="text-sm font-medium leading-none">
              Активен
            </Label>
             {errors.isActive && <p className="text-destructive text-xs mt-1">{errors.isActive.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={closeForm} disabled={isSubmitting}>Отмена</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
