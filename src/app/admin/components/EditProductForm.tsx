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

const productSchema = z.object({
  name: z.string().min(3, 'Название должно содержать не менее 3 символов'),
  brand: z.string().min(2, 'Бренд должен содержать не менее 2 символов'),
  price: z.coerce.number().positive('Цена должна быть положительным числом'),
  imageUrl: z.string().url('Неверный URL изображения'),
  description: z.string().min(10, 'Описание должно содержать не менее 10 символов'),
  category: z.string().min(3, 'Категория должна содержать не менее 3 символов'),
  compatibleVehicles: z.string().min(3, 'Укажите хотя бы одну совместимую модель'),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative('Количество должно быть не отрицательным').optional(),
  dataAiHint: z.string().optional(), // Added dataAiHint field
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductFormProps {
  product: AutoPart | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: (updatedProduct: AutoPart) => void; // Callback after successful update
}

export const EditProductForm: React.FC<EditProductFormProps> = ({ product, isOpen, onClose, onProductUpdated }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue, // To set form values initially
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product && isOpen) {
      setValue('name', product.name);
      setValue('brand', product.brand);
      setValue('price', product.price);
      setValue('imageUrl', product.imageUrl);
      setValue('description', product.description);
      setValue('category', product.category);
      setValue('compatibleVehicles', product.compatibleVehicles.join(', '));
      setValue('sku', product.sku || '');
      setValue('stock', product.stock || 0);
      setValue('dataAiHint', product.dataAiHint || ''); // Set dataAiHint value
      setError(null);
    } else if (!isOpen) {
      reset();
      setError(null);
    }
  }, [product, isOpen, reset, setValue]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!product) return;

    setIsLoading(true);
    setError(null);

    try {
       const compatibleVehiclesArray = data.compatibleVehicles.split(',').map(v => v.trim()).filter(v => v);

       // Construct the payload carefully, ensuring all fields from AutoPart are considered
       const updatePayload: Partial<Omit<AutoPart, 'id'>> = {
           name: data.name,
           brand: data.brand,
           price: data.price,
           imageUrl: data.imageUrl,
           description: data.description,
           category: data.category,
           compatibleVehicles: compatibleVehiclesArray,
           sku: data.sku || undefined,
           stock: data.stock ?? 0,
           dataAiHint: data.dataAiHint || undefined, // Include dataAiHint
           // Ensure rating and reviewCount are preserved if they exist on the original product
           rating: product.rating,
           reviewCount: product.reviewCount,
           // Quantity is not typically part of the product data itself
       };

      const updatedProduct = await updateAutoPart(product.id, updatePayload);

      toast({
        title: 'Товар обновлен!',
        description: `Товар "${updatedProduct.name}" успешно обновлен.`,
      });
      onProductUpdated(updatedProduct); // Notify parent component
      onClose(); // Close the dialog
    } catch (error: any) {
        console.error("Ошибка обновления товара:", error);
        setError(error.message || 'Не удалось обновить товар. Попробуйте позже.');
        toast({
            title: 'Ошибка',
            description: error.message || 'Не удалось обновить товар. Попробуйте позже.',
            variant: 'destructive',
        });
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать товар: {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Name */}
          <div>
            <Label htmlFor="edit-name">Название товара</Label>
            <Input id="edit-name" {...register('name')} disabled={isLoading} placeholder="Напр., Передние тормозные колодки" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Brand */}
          <div>
            <Label htmlFor="edit-brand">Бренд</Label>
            <Input id="edit-brand" {...register('brand')} disabled={isLoading} placeholder="Напр., Toyota Genuine" />
            {errors.brand && <p className="text-destructive text-xs mt-1">{errors.brand.message}</p>}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="edit-price">Цена (в тенге)</Label>
            <Input id="edit-price" type="number" step="0.01" {...register('price')} disabled={isLoading} placeholder="Напр., 37750" />
            {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="edit-imageUrl">URL изображения</Label>
            <Input id="edit-imageUrl" type="url" {...register('imageUrl')} disabled={isLoading} placeholder="https://example.com/image.jpg" />
            {errors.imageUrl && <p className="text-destructive text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>

           {/* Data AI Hint */}
           <div>
            <Label htmlFor="edit-dataAiHint">Подсказка для AI (необязательно)</Label>
            <Input id="edit-dataAiHint" {...register('dataAiHint')} disabled={isLoading} placeholder="Напр., brake pads toyota" />
            {errors.dataAiHint && <p className="text-destructive text-xs mt-1">{errors.dataAiHint.message}</p>}
           </div>

          {/* Description */}
          <div>
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea id="edit-description" {...register('description')} disabled={isLoading} placeholder="Подробное описание товара..." />
            {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="edit-category">Категория</Label>
            <Input id="edit-category" {...register('category')} disabled={isLoading} placeholder="Напр., Тормоза" />
            {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Compatible Vehicles */}
           <div>
            <Label htmlFor="edit-compatibleVehicles">Совместимые модели (через запятую)</Label>
            <Input
              id="edit-compatibleVehicles"
              {...register('compatibleVehicles')}
              disabled={isLoading}
              placeholder="Напр., Toyota Camry 2018+, Toyota RAV4 2019+"
            />
             {errors.compatibleVehicles && <p className="text-destructive text-xs mt-1">{errors.compatibleVehicles.message}</p>}
          </div>

           {/* SKU */}
          <div>
            <Label htmlFor="edit-sku">Артикул (SKU) (необязательно)</Label>
            <Input id="edit-sku" {...register('sku')} disabled={isLoading} placeholder="Напр., TG-8901-F" />
            {errors.sku && <p className="text-destructive text-xs mt-1">{errors.sku.message}</p>}
          </div>

           {/* Stock */}
            <div>
            <Label htmlFor="edit-stock">Количество на складе (необязательно)</Label>
            <Input id="edit-stock" type="number" {...register('stock')} disabled={isLoading} placeholder="Напр., 50" />
            {errors.stock && <p className="text-destructive text-xs mt-1">{errors.stock.message}</p>}
            </div>

           {/* General form error message */}
           {error && <p className="text-destructive text-sm">{error}</p>}

           <DialogFooter className="pt-4">
             <DialogClose asChild>
               <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Отмена</Button>
             </DialogClose>
             <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
               {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
             </Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
