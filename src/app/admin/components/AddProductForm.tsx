
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

const productSchemaObject = z.object({
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

type ProductFormDataType = z.infer<typeof productSchemaObject>;

type NewProductType = Omit<AutoPart, 'id' | 'compatibleVehicles'> & {
  compatibleVehicles: string[];
};


export const AddProductForm: React.FC = () => {
  const { toast: showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    register: registerField,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    formState: { errors: formErrors },
  } = useForm<ProductFormDataType>({
    resolver: zodResolver(productSchemaObject),
  });

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const processSubmit: SubmitHandler<ProductFormDataType> = async (formData) => {
    setIsProcessing(true);
    setSubmissionError(null);

    try {
       const compatibleVehiclesList = formData.compatibleVehicles.split(',').map(v => v.trim()).filter(v => v);

        const newProductData: NewProductType = {
            ...formData,
            compatibleVehicles: compatibleVehiclesList,
            stock: formData.stock ?? 0,
        };

      await addAutoPart(newProductData);

      showToast({
        title: 'Товар добавлен!',
        description: `Товар "${formData.name}" успешно добавлен.`,
      });
      resetForm();
    } catch (err: any) {
        console.error("Ошибка добавления товара:", err);
        setSubmissionError(err.message || 'Не удалось добавить товар. Попробуйте позже.');
        showToast({
            title: 'Ошибка',
            description: err.message || 'Не удалось добавить товар. Попробуйте позже.',
            variant: 'destructive',
        });
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Добавить новый товар</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit(processSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Название товара</Label>
            <Input id="name" {...registerField('name')} disabled={isProcessing} placeholder="Напр., Передние тормозные колодки" />
            {formErrors.name && <p className="text-destructive text-xs mt-1">{formErrors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="brand">Бренд</Label>
            <Input id="brand" {...registerField('brand')} disabled={isProcessing} placeholder="Напр., Toyota Genuine" />
            {formErrors.brand && <p className="text-destructive text-xs mt-1">{formErrors.brand.message}</p>}
          </div>

          <div>
            <Label htmlFor="price">Цена (в тенге)</Label>
            <Input id="price" type="number" step="0.01" {...registerField('price')} disabled={isProcessing} placeholder="Напр., 37750" />
            {formErrors.price && <p className="text-destructive text-xs mt-1">{formErrors.price.message}</p>}
          </div>

          <div>
            <Label htmlFor="imageUrl">URL изображения</Label>
            <Input id="imageUrl" type="url" {...registerField('imageUrl')} disabled={isProcessing} placeholder="https://example.com/image.jpg" />
            {formErrors.imageUrl && <p className="text-destructive text-xs mt-1">{formErrors.imageUrl.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" {...registerField('description')} disabled={isProcessing} placeholder="Подробное описание товара..." />
            {formErrors.description && <p className="text-destructive text-xs mt-1">{formErrors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Категория</Label>
            <Input id="category" {...registerField('category')} disabled={isProcessing} placeholder="Напр., Тормоза" />
            {formErrors.category && <p className="text-destructive text-xs mt-1">{formErrors.category.message}</p>}
          </div>

           <div>
            <Label htmlFor="compatibleVehicles">Совместимые модели (через запятую)</Label>
            <Input
              id="compatibleVehicles"
              {...registerField('compatibleVehicles')}
              disabled={isProcessing}
              placeholder="Напр., Toyota Camry 2018+, Toyota RAV4 2019+"
            />
             {formErrors.compatibleVehicles && <p className="text-destructive text-xs mt-1">{formErrors.compatibleVehicles.message}</p>}
          </div>

          <div>
            <Label htmlFor="sku">Артикул (SKU) (необязательно)</Label>
            <Input id="sku" {...registerField('sku')} disabled={isProcessing} placeholder="Напр., TG-8901-F" />
            {formErrors.sku && <p className="text-destructive text-xs mt-1">{formErrors.sku.message}</p>}
          </div>

            <div>
            <Label htmlFor="stock">Количество на складе (необязательно)</Label>
            <Input id="stock" type="number" {...registerField('stock')} disabled={isProcessing} placeholder="Напр., 50" />
            {formErrors.stock && <p className="text-destructive text-xs mt-1">{formErrors.stock.message}</p>}
            </div>

           {submissionError && <p className="text-destructive text-sm">{submissionError}</p>}

          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? 'Добавление...' : 'Добавить товар'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
