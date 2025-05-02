
"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AutoPart } from '@/types/autopart';
import { formatPrice } from '@/lib/utils'; // Assuming formatPrice is moved to utils

interface ProductListProps {
  products: AutoPart[];
  isLoading: boolean;
  error: string | null;
  onEdit: (product: AutoPart) => void; // Callback to handle edit action
}

export const ProductList: React.FC<ProductListProps> = ({ products, isLoading, error, onEdit }) => {

  if (isLoading) {
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

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Товары:</h2>
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell className="font-mono text-xs">{product.sku || '-'}</TableCell>
                <TableCell>{product.stock ?? 0}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
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
