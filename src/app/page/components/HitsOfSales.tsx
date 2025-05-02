'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Autopart from "@/app/components/autopart";
import type { AutoPart } from '@/types/autopart';
import { getAllAutoParts } from '@/services/autoparts'; // Assuming a service to get all parts
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface HitsOfSalesProps {
  onAddToCart: (product: AutoPart) => void;
}

export const HitsOfSales: React.FC<HitsOfSalesProps> = ({ onAddToCart }) => {
  const [popularProducts, setPopularProducts] = useState<AutoPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate fetching popular products - replace with actual logic if available
      // For now, fetch all and take a slice, or implement a proper endpoint/service
      const allProducts = await getAllAutoParts();
      // Example: Define "popular" as the first 10 products for demonstration
      const popular = allProducts.slice(0, 10).map(p => ({
        ...p,
         // Add placeholder dataAiHint if missing, based on category/brand
        dataAiHint: p.dataAiHint || `${p.category} ${p.brand}`
      }));
      setPopularProducts(popular);
    } catch (fetchError: any) {
      console.error("Error fetching popular products:", fetchError);
      setError("Не удалось загрузить хиты продаж.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  return (
    <section className="py-12 bg-secondary rounded-lg">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Хиты продаж</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
               <Card key={index} className="w-full overflow-hidden">
                  <CardHeader className="p-4"><Skeleton className="h-5 w-3/4" /></CardHeader>
                  <CardContent className="flex flex-col items-center p-4 pt-0">
                    <Skeleton className="h-28 w-full mb-3 rounded-md" />
                    <Skeleton className="h-4 w-1/3 mb-1" />
                    <Skeleton className="h-5 w-1/2 mb-3" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : popularProducts.length === 0 ? (
           <p className="text-center text-muted-foreground">Хиты продаж не найдены.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {popularProducts.map((product) => (
              <Autopart key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
