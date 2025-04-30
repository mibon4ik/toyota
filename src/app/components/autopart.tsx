
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart'; // Corrected import path
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

   const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
       e.preventDefault(); // Prevent default link behavior if inside a link
       e.stopPropagation(); // Prevent event bubbling up to parent links
       onAddToCart(product);
       // Toast is handled within onAddToCart's context now
   };


  // Avoid rendering the button interaction part on the server
  if (!isMounted) {
     // Optionally render a placeholder or simplified version during SSR
     return (
        <Card className="w-full product-card opacity-50"> {/* Changed width to w-full */}
            <CardHeader className="p-4"> {/* Adjusted padding */}
              <CardTitle className="h-5 w-3/4 bg-muted rounded animate-pulse text-sm"></CardTitle> {/* Adjusted height and font size */}
            </CardHeader>
            <CardContent className="flex flex-col items-center p-4"> {/* Adjusted padding */}
               <div className="bg-muted rounded-md mb-3 h-28 w-full animate-pulse"></div> {/* Adjusted height */}
              <p className="text-xs text-muted-foreground h-3 w-1/3 bg-muted rounded animate-pulse mb-1"></p> {/* Adjusted size */}
              <p className="text-base font-semibold h-5 w-1/2 bg-muted rounded animate-pulse"></p> {/* Adjusted size */}
               <Button disabled className="mt-3 w-full h-9">В корзину</Button> {/* Adjusted margin and height */}
            </CardContent>
        </Card>
     );
  }


  return (
    <Card className="w-full product-card flex flex-col h-full overflow-hidden group"> {/* Changed width, added overflow-hidden and group */}
        <CardHeader className="p-4"> {/* Adjusted padding */}
            {/* Link wraps the clickable area for navigation */}
            <Link href={`/part/${product.id}`} passHref legacyBehavior={false} aria-label={`Посмотреть детали для ${product.name}`}>
                  <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2 text-sm font-medium h-10"> {/* Adjusted size and height */}
                    {product.name}
                   </CardTitle>
             </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-grow p-4 pt-0"> {/* Adjusted padding */}
             <Link href={`/part/${product.id}`} passHref legacyBehavior={false} className="block w-full mb-3" aria-label={`Посмотреть изображение ${product.name}`}>
                    <img
                        src={product.imageUrl || 'https://picsum.photos/300/200'} // Fallback image
                        alt={product.name}
                        className="object-cover rounded-md h-28 w-full group-hover:opacity-90 transition-opacity border" /* Adjusted height, added border */
                        loading="lazy" // Lazy load images below the fold
                         onError={(e) => (e.currentTarget.src = 'https://picsum.photos/300/200')} // Handle image load errors
                    />
            </Link>
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
            <p className="text-base font-semibold mb-3">{formatPrice(product.price)}</p> {/* Adjusted margin */}
        </CardContent>
         {/* Footer for the button, pushed to the bottom */}
         <div className="p-4 pt-0 mt-auto"> {/* Adjusted padding */}
             {/* Call the passed-in onAddToCart function */}
            <Button onClick={handleButtonClick} className="w-full h-9">В корзину</Button> {/* Adjusted height */}
        </div>
    </Card>
  );
};

export default Autopart;

