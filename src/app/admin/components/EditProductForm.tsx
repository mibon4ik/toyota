
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateAutoPart } from '@/services/autoparts';
import type { AutoPart } from '@/types/autopart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const productValidationSchema = z.object({
  name: z.string().min(3, 'Название должно содержать не менее 3 символов'),
  brand: z.string().min(2, 'Бренд должен содержать не менее 2 символов'),
  price: z.coerce.number().positive('Цена должна быть положительным числом'),
  imageUrl: z.string().url('Неверный URL изображения'),
  description: z.string().min(10, 'Описание должно содержать не менее 10 символов'),
  category: z.string().min(3, 'Категория должна содержать не менее 3 символов'),
  compatibleVehicles: z.string().min(3, 'Укажите хотя бы одну совместимую модель'),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative('Количество должно быть не отрицательным').optional(),
  dataAiHint: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productValidationSchema>;

interface EditFormProps {
  productData: AutoPart | null;
  isFormOpen: boolean;
  closeForm: () => void;
  onProductSave: (updatedProduct: AutoPart) => void;
}

export const EditProductForm: React.FC<EditFormProps> = ({ productData, isFormOpen, closeForm, onProductSave }) => {
  const { toast: displayToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue: setFieldValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productValidationSchema),
  });

  useEffect(() => {
    if (productData && isFormOpen) {
      setFieldValue('name', productData.name);
      setFieldValue('brand', productData.brand);
      setFieldValue('price', productData.price);
      setFieldValue('imageUrl', productData.imageUrl);
      setFieldValue('description', productData.description);
      setFieldValue('category', productData.category);
      setFieldValue('compatibleVehicles', productData.compatibleVehicles.join(', '));
      setFieldValue('sku', productData.sku || '');
      setFieldValue('stock', productData.stock || 0);
      setFieldValue('dataAiHint', productData.dataAiHint || '');
      setFormError(null);
    } else if (!isFormOpen) {
      reset();
      setFormError(null);
    }
  }, [productData, isFormOpen, reset, setFieldValue]);

  const handleFormSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!productData) return;

    setSubmitting(true);
    setFormError(null);

    try {
       const compatibleVehiclesList = data.compatibleVehicles.split(',').map(v => v.trim()).filter(v => v);

       const payloadToUpdate: Partial<Omit<AutoPart, 'id'>> = {
           name: data.name,
           brand: data.brand,
           price: data.price,
           imageUrl: data.imageUrl,
           description: data.description,
           category: data.category,
           compatibleVehicles: compatibleVehiclesList,
           sku: data.sku || undefined,
           stock: data.stock ?? 0,
           dataAiHint: data.dataAiHint || undefined,
           rating: productData.rating,
           reviewCount: productData.reviewCount,
       };

      const savedProduct = await updateAutoPart(productData.id, payloadToUpdate);

      displayToast({
        title: 'Товар обновлен!',
        description: `Товар "${savedProduct.name}" успешно обновлен.`,
      });
      onProductSave(savedProduct);
      closeForm();
    } catch (err: any) {
        setFormError(err.message || 'Не удалось обновить товар. Попробуйте позже.');
        displayToast({
            title: 'Ошибка',
            description: err.message || 'Не удалось обновить товар. Попробуйте позже.',
            variant: 'destructive',
        });
    } finally {
      setSubmitting(false);
    }
  };

  if (!productData) return null;

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать товар: {productData.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="edit-name">Название товара</Label>
            <Input id="edit-name" {...register('name')} disabled={submitting} placeholder="Напр., Передние тормозные колодки" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-brand">Бренд</Label>
            <Input id="edit-brand" {...register('brand')} disabled={submitting} placeholder="Напр., Toyota Genuine" />
            {errors.brand && <p className="text-destructive text-xs mt-1">{errors.brand.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-price">Цена (в тенге)</Label>
            <Input id="edit-price" type="number" step="0.01" {...register('price')} disabled={submitting} placeholder="Напр., 37750" />
            {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-imageUrl">URL изображения</Label>
            <Input id="edit-imageUrl" type="url" {...register('imageUrl')} disabled={submitting} placeholder="https://example.com/image.jpg" />
            {errors.imageUrl && <p className="text-destructive text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>

           <div>
            <Label htmlFor="edit-dataAiHint">Подсказка для AI (необязательно)</Label>
            <Input id="edit-dataAiHint" {...register('dataAiHint')} disabled={submitting} placeholder="Напр., brake pads toyota" />
            {errors.dataAiHint && <p className="text-destructive text-xs mt-1">{errors.dataAiHint.message}</p>}
           </div>

          <div>
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea id="edit-description" {...register('description')} disabled={submitting} placeholder="Подробное описание товара..." />
            {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-category">Категория</Label>
            <Input id="edit-category" {...register('category')} disabled={submitting} placeholder="Напр., Тормоза" />
            {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
          </div>

           <div>
            <Label htmlFor="edit-compatibleVehicles">Совместимые модели (через запятую)</Label>
            <Input
              id="edit-compatibleVehicles"
              {...register('compatibleVehicles')}
              disabled={submitting}
              placeholder="Напр., Toyota Camry 2018+, Toyota RAV4 2019+"
            />
             {errors.compatibleVehicles && <p className="text-destructive text-xs mt-1">{errors.compatibleVehicles.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-sku">Артикул (SKU) (необязательно)</Label>
            <Input id="edit-sku" {...register('sku')} disabled={submitting} placeholder="Напр., TG-8901-F" />
            {errors.sku && <p className="text-destructive text-xs mt-1">{errors.sku.message}</p>}
          </div>

            <div>
            <Label htmlFor="edit-stock">Количество на складе (необязательно)</Label>
            <Input id="edit-stock" type="number" {...register('stock')} disabled={submitting} placeholder="Напр., 50" />
            {errors.stock && <p className="text-destructive text-xs mt-1">{errors.stock.message}</p>}
            </div>

           {formError && <p className="text-destructive text-sm">{formError}</p>}

           <DialogFooter className="pt-4">
             <DialogClose asChild>
               <Button type="button" variant="outline" onClick={closeForm} disabled={submitting}>Отмена</Button>
             </DialogClose>
             <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
               {submitting ? 'Сохранение...' : 'Сохранить изменения'}
             </Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
