
"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AutoPart } from '@/types/autopart';
import { formatPrice } from '@/lib/utils';

interface ProductTableProps {
  productsData: AutoPart[];
  isLoadingData: boolean;
  fetchError: string | null;
  onEditClick: (product: AutoPart) => void;
}

export const ProductList: React.FC<ProductTableProps> = ({ productsData, isLoadingData, fetchError, onEditClick }) => {

  if (isLoadingData) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Товары:</h2>
        <div className="space-y-3">
            <Skeleton className="h-8 w-full rounded-md" />
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
        </div>
         <p className="text-center text-muted-foreground mt-4">Загрузка товаров...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Товары:</h2>
        <p className="text-destructive text-center">{fetchError}</p>
      </div>
    );
  }

  if (productsData.length === 0) {
    return (
       <div>
            <h2 className="text-xl font-semibold mb-4">Товары:</h2>
            <p className="text-center text-muted-foreground">Товары не найдены.</p>
       </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Товары:</h2>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Бренд</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Наличие</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsData.map((productItem) => (
              <TableRow key={productItem.id}>
                <TableCell className="font-medium">{productItem.name}</TableCell>
                <TableCell>{productItem.brand}</TableCell>
                <TableCell>{productItem.category}</TableCell>
                <TableCell>{formatPrice(productItem.price)}</TableCell>
                <TableCell className="font-mono text-xs">{productItem.sku || '-'}</TableCell>
                <TableCell>{productItem.stock ?? 0}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onEditClick(productItem)}>
                    Изменить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
