
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Autopart from "@/app/components/autopart";
import type { AutoPart } from '@/types/autopart';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllAutoParts } from '@/services/autoparts'; // Assuming a service to get all parts
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface NewArrivalsProps {
  onAddToCart: (product: AutoPart) => void; // Receive callback from parent
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ onAddToCart }) => {
  const [newArrivals, setNewArrivals] = useState<AutoPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewArrivals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate fetching new arrivals - maybe sort by a hypothetical 'dateAdded' or just slice differently
      const allProducts = await getAllAutoParts();
      // Example: Define "new" as products added recently (or just a slice for demo)
      const arrivals = allProducts
         // .sort((a, b) => (b.dateAdded ?? 0) - (a.dateAdded ?? 0)) // Hypothetical sorting
        .slice(0, 5) // Take first 5 as "new" for demo
        .map(p => ({
          ...p,
          dataAiHint: p.dataAiHint || `${p.category} ${p.brand}`
        }));
      setNewArrivals(arrivals);
    } catch (fetchError: any) {
      console.error("Error fetching new arrivals:", fetchError);
      setError("Не удалось загрузить новые поступления.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewArrivals();
  }, [fetchNewArrivals]);

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Новые поступления</h2>
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
        ) : newArrivals.length === 0 ? (
            <p className="text-center text-muted-foreground">Новые поступления не найдены.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {newArrivals.map((product) => (
                 // Pass the onAddToCart function down to each Autopart
                <Autopart key={product.id} product={product} onAddToCart={onAddToCart}/>
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
