
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AutoPart } from "@/types/autopart"; // Corrected import path
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface AutopartProps {
  product: AutoPart;
  onAddToCart: (product: AutoPart) => void; // Add this prop
}

const Autopart: React.FC<AutopartProps> = ({ product, onAddToCart }) => { // Receive onAddToCart prop
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Component has mounted
  }, []);


  const formatPrice = useCallback((price: number): string => {
      // Assuming price is already in Tenge (KZT) as per services/autoparts.ts
      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0, // Tenge usually doesn't show fractions
        maximumFractionDigits: 0,
      }).format(price);
    }, []); // No dependencies needed


  // Avoid rendering the button interaction part on the server
  if (!isMounted) {
     // Optionally render a placeholder or simplified version during SSR
     return (
        <Card className="w-80 product-card opacity-50">
            <CardHeader>
              <CardTitle className="h-6 w-3/4 bg-muted rounded animate-pulse"></CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
               <div className="bg-muted rounded-md mb-4 h-32 w-full animate-pulse"></div>
              <p className="text-sm text-muted-foreground h-4 w-1/4 bg-muted rounded animate-pulse mb-1"></p>
              <p className="text-lg font-semibold h-6 w-1/2 bg-muted rounded animate-pulse"></p>
               <Button disabled className="mt-4">В корзину</Button>
            </CardContent>
        </Card>
     );
  }


  return (
    <Card className="w-80 product-card flex flex-col h-full">
        <CardHeader>
            {/* Link wraps the clickable area for navigation */}
            <Link href={`/part/${product.id}`} passHref legacyBehavior>
                <a aria-label={`Посмотреть детали для ${product.name}`}>
                  <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2">{product.name}</CardTitle>
                 </a>
             </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-grow">
             <Link href={`/part/${product.id}`} passHref legacyBehavior>
                <a className="block w-full mb-4" aria-label={`Посмотреть изображение ${product.name}`}>
                    <img
                        src={product.imageUrl || 'https://picsum.photos/300/200'} // Fallback image
                        alt={product.name}
                        className="object-cover rounded-md h-40 w-full hover:opacity-90 transition-opacity"
                        loading="lazy" // Lazy load images below the fold
                         onError={(e) => (e.currentTarget.src = 'https://picsum.photos/300/200')} // Handle image load errors
                    />
                 </a>
            </Link>
            <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            <p className="text-lg font-semibold mb-4">{formatPrice(product.price)}</p>
        </CardContent>
         {/* Footer for the button, pushed to the bottom */}
         <div className="p-6 pt-0 mt-auto">
             {/* Call the passed-in onAddToCart function */}
            <Button onClick={() => onAddToCart(product)} className="w-full">В корзину</Button>
        </div>
    </Card>
  );
};

export default Autopart;
