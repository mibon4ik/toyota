
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addBanner } from '@/services/banners';
import type { Banner } from '@/types/banner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const bannerSchemaObject = z.object({
  title: z.string().min(3, 'Заголовок должен содержать не менее 3 символов'),
  imageUrl: z.string().url('Неверный URL изображения'),
  buttonText: z.string().min(3, 'Текст кнопки должен содержать не менее 3 символов'),
  link: z.string().min(1, 'Ссылка обязательна (напр., /shop?promo=123)'),
  imageHint: z.string().optional(),
  dataAiHint: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BannerFormDataType = z.infer<typeof bannerSchemaObject>;

interface AddBannerFormProps {
  isFormOpen: boolean;
  closeForm: () => void;
  onBannerSave: () => void;
}

export const AddBannerForm: React.FC<AddBannerFormProps> = ({ isFormOpen, closeForm, onBannerSave }) => {
  const { toast: showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    register: registerField,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    control,
    formState: { errors: formErrors },
  } = useForm<BannerFormDataType>({
    resolver: zodResolver(bannerSchemaObject),
    defaultValues: {
        isActive: true,
        title: '',
        imageUrl: '',
        buttonText: '',
        link: '',
        imageHint: '',
        dataAiHint: '',
    }
  });

  const processSubmit: SubmitHandler<BannerFormDataType> = async (formData) => {
    setIsProcessing(true);
    try {
      const newBannerData: Omit<Banner, 'id'> = {
        ...formData,
      };
      await addBanner(newBannerData);
      showToast({
        title: 'Баннер добавлен!',
        description: `Баннер "${formData.title}" успешно добавлен.`,
      });
      onBannerSave();
      resetForm();
      closeForm();
    } catch (err: any) {
      showToast({
        title: 'Ошибка',
        description: err.message || 'Не удалось добавить баннер. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить новый баннер</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(processSubmit)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="add-banner-title">Заголовок</Label>
            <Input id="add-banner-title" {...registerField('title')} disabled={isProcessing} placeholder="Напр., Зимняя Распродажа!" />
            {formErrors.title && <p className="text-destructive text-xs mt-1">{formErrors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="add-banner-imageUrl">URL изображения</Label>
            <Input id="add-banner-imageUrl" type="url" {...registerField('imageUrl')} disabled={isProcessing} placeholder="https://example.com/banner.jpg" />
            {formErrors.imageUrl && <p className="text-destructive text-xs mt-1">{formErrors.imageUrl.message}</p>}
          </div>
          <div>
            <Label htmlFor="add-banner-buttonText">Текст кнопки</Label>
            <Input id="add-banner-buttonText" {...registerField('buttonText')} disabled={isProcessing} placeholder="Напр., Узнать больше" />
            {formErrors.buttonText && <p className="text-destructive text-xs mt-1">{formErrors.buttonText.message}</p>}
          </div>
          <div>
            <Label htmlFor="add-banner-link">Ссылка</Label>
            <Input id="add-banner-link" {...registerField('link')} disabled={isProcessing} placeholder="/shop?category=новое" />
            {formErrors.link && <p className="text-destructive text-xs mt-1">{formErrors.link.message}</p>}
          </div>
          <div>
            <Label htmlFor="add-banner-imageHint">Подсказка для Unsplash (макс. 2 слова)</Label>
            <Input id="add-banner-imageHint" {...registerField('imageHint')} disabled={isProcessing} placeholder="Напр., car sale" />
            {formErrors.imageHint && <p className="text-destructive text-xs mt-1">{formErrors.imageHint.message}</p>}
          </div>
          <div>
            <Label htmlFor="add-banner-dataAiHint">Подсказка для AI (опционально)</Label>
            <Input id="add-banner-dataAiHint" {...registerField('dataAiHint')} disabled={isProcessing} placeholder="AI-подсказка для изображения" />
            {formErrors.dataAiHint && <p className="text-destructive text-xs mt-1">{formErrors.dataAiHint.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="add-banner-isActive" {...registerField('isActive')} defaultChecked={true} disabled={isProcessing} />
            <Label htmlFor="add-banner-isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Активен
            </Label>
            {formErrors.isActive && <p className="text-destructive text-xs mt-1">{formErrors.isActive.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={closeForm} disabled={isProcessing}>Отмена</Button>
            </DialogClose>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Добавление...' : 'Добавить баннер'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
