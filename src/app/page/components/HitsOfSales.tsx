
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Autopart from "@/app/components/autopart";
import type { AutoPart } from '@/types/autopart';
import { getAllAutoParts } from '@/services/autoparts';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BestSellersProps {
  onAddToCart: (product: AutoPart) => void;
}

export const HitsOfSales: React.FC<BestSellersProps> = ({ onAddToCart }) => {
  const [topProducts, setTopProducts] = useState<AutoPart[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadPopularItems = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const allItems = await getAllAutoParts();
      const popularItems = allItems
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 10)
        .map(p => ({
          ...p,
          dataAiHint: p.dataAiHint || `${p.category} ${p.brand}`
        }));
      setTopProducts(popularItems);
    } catch (error: any) {
      console.error("Error fetching popular products:", error);
      setFetchError("Не удалось загрузить хиты продаж.");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadPopularItems();
  }, [loadPopularItems]);

  return (
    <section className="py-12 bg-secondary rounded-lg">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Хиты продаж</h2>
        {isLoadingData ? (
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
        ) : fetchError ? (
          <p className="text-center text-destructive">{fetchError}</p>
        ) : topProducts.length === 0 ? (
           <p className="text-center text-muted-foreground">Хиты продаж не найдены.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {topProducts.map((item) => (
              <Autopart key={item.id} productInfo={item} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
