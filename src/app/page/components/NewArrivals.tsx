
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Autopart from "@/app/components/autopart";
import type { AutoPart } from '@/types/autopart';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllAutoParts } from '@/services/autoparts';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LatestProductsProps {
  onAddToCart: (product: AutoPart) => void;
}

export const NewArrivals: React.FC<LatestProductsProps> = ({ onAddToCart }) => {
  const [latestItems, setLatestItems] = useState<AutoPart[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const fetchLatestProducts = useCallback(async () => {
    setDataLoading(true);
    setLoadingError(null);
    try {
      const allItems = await getAllAutoParts();
      const newItems = allItems
        .slice(0, 5)
        .map(p => ({
          ...p,
          dataAiHint: p.dataAiHint || `${p.category} ${p.brand}`
        }));
      setLatestItems(newItems);
    } catch (error: any) {
      console.error("Error fetching new arrivals:", error);
      setLoadingError("Не удалось загрузить новые поступления.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestProducts();
  }, [fetchLatestProducts]);

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Новые поступления</h2>
        {dataLoading ? (
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
        ) : loadingError ? (
          <p className="text-center text-destructive">{loadingError}</p>
        ) : latestItems.length === 0 ? (
            <p className="text-center text-muted-foreground">Новые поступления не найдены.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {latestItems.map((item) => (
                <Autopart key={item.id} productInfo={item} onAddToCart={onAddToCart}/>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/shop?sort=newest">Смотреть все новинки</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
