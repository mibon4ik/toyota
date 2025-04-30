
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addAutoPart } from '@/services/autoparts';
import type { AutoPart } from '@/types/autopart';

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
});

type ProductFormData = z.infer<typeof productSchema>;

type NewProductData = Omit<AutoPart, 'id' | 'compatibleVehicles'> & {
  compatibleVehicles: string[];
};


export const AddProductForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
       const compatibleVehiclesArray = data.compatibleVehicles.split(',').map(v => v.trim()).filter(v => v);

        const newProductPayload: NewProductData = {
            ...data,
            compatibleVehicles: compatibleVehiclesArray,

            stock: data.stock ?? 0,
        };

      await addAutoPart(newProductPayload);

      toast({
        title: 'Товар добавлен!',
        description: `Товар "${data.name}" успешно добавлен.`,
      });
      reset();
    } catch (error: any) {
        console.error("Ошибка добавления товара:", error);
        setError(error.message || 'Не удалось добавить товар. Попробуйте позже.');
        toast({
            title: 'Ошибка',
            description: error.message || 'Не удалось добавить товар. Попробуйте позже.',
            variant: 'destructive',
        });
    } finally {
      setIsLoading(false);
    }
  };

   const [error, setError] = useState<string | null>(null);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Добавить новый товар</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Название товара</Label>
            <Input id="name" {...register('name')} disabled={isLoading} placeholder="Напр., Передние тормозные колодки" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Brand */}
          <div>
            <Label htmlFor="brand">Бренд</Label>
            <Input id="brand" {...register('brand')} disabled={isLoading} placeholder="Напр., Toyota Genuine" />
            {errors.brand && <p className="text-destructive text-xs mt-1">{errors.brand.message}</p>}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Цена (в тенге)</Label>
            <Input id="price" type="number" step="0.01" {...register('price')} disabled={isLoading} placeholder="Напр., 37750" />
            {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl">URL изображения</Label>
            <Input id="imageUrl" type="url" {...register('imageUrl')} disabled={isLoading} placeholder="https://example.com/image.jpg" />
            {errors.imageUrl && <p className="text-destructive text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" {...register('description')} disabled={isLoading} placeholder="Подробное описание товара..." />
            {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Категория</Label>
            <Input id="category" {...register('category')} disabled={isLoading} placeholder="Напр., Тормоза" />
            {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Compatible Vehicles */}
           <div>
            <Label htmlFor="compatibleVehicles">Совместимые модели (через запятую)</Label>
            <Input
              id="compatibleVehicles"
              {...register('compatibleVehicles')}
              disabled={isLoading}
              placeholder="Напр., Toyota Camry 2018+, Toyota RAV4 2019+"
            />
             {errors.compatibleVehicles && <p className="text-destructive text-xs mt-1">{errors.compatibleVehicles.message}</p>}
          </div>

           {/* SKU */}
          <div>
            <Label htmlFor="sku">Артикул (SKU) (необязательно)</Label>
            <Input id="sku" {...register('sku')} disabled={isLoading} placeholder="Напр., TG-8901-F" />
            {errors.sku && <p className="text-destructive text-xs mt-1">{errors.sku.message}</p>}
          </div>

           {/* Stock */}
            <div>
            <Label htmlFor="stock">Количество на складе (необязательно)</Label>
            <Input id="stock" type="number" {...register('stock')} disabled={isLoading} placeholder="Напр., 50" />
            {errors.stock && <p className="text-destructive text-xs mt-1">{errors.stock.message}</p>}
            </div>

           {/* General form error message */}
           {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Добавление...' : 'Добавить товар'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
