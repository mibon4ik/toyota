'use client'; // Keep top-level 'use client' for simplicity for now

import React, { Suspense } from 'react';
import { ShopContent } from './components/ShopContent'; // Import the new client component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for fallback
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Import Card components for fallback

// Loading component for Suspense fallback
const ShopLoadingFallback = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold text-center mb-8">Каталог автозапчастей</h1>
    {/* Skeleton for filters */}
    <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
      <Skeleton className="h-10 w-full sm:w-auto sm:min-w-[200px] rounded-md" />
      <div className="flex-grow flex gap-2 w-full sm:w-auto">
        <Skeleton className="h-10 flex-grow rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
    {/* Skeleton for product grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(10)].map((_, index) => (
        <Card key={index} className="w-full">
          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
          <CardContent className="flex flex-col items-center p-4 pt-0">
            <Skeleton className="h-28 w-full mb-3 rounded-md" />
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-6 w-1/2 mb-3" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);


const ShopPage = () => {
  return (
    // Wrap the client component that uses useSearchParams in Suspense
    // This ensures that components depending on searchParams render correctly
    // without causing hydration mismatches or build errors.
    <Suspense fallback={<ShopLoadingFallback />}>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;
