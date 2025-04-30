
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface AutopartProps {
  product: AutoPart;
  onAddToCart: (product: AutoPart) => void;
}

const Autopart: React.FC<AutopartProps> = ({ product, onAddToCart }) => {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const formatPrice = useCallback((price: number): string => {

      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);

   const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
       e.preventDefault();
       e.stopPropagation();
       onAddToCart(product);

   };



  if (!isMounted) {

     return (
        <Card className="w-full product-card opacity-50">
            <CardHeader className="p-4">
              <CardTitle className="h-5 w-3/4 bg-muted rounded animate-pulse text-sm"></CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-4">
               <div className="bg-muted rounded-md mb-3 h-28 w-full animate-pulse"></div>
              <p className="text-xs text-muted-foreground h-3 w-1/3 bg-muted rounded animate-pulse mb-1"></p>
              <p className="text-base font-semibold h-5 w-1/2 bg-muted rounded animate-pulse"></p>
               <Button disabled className="mt-3 w-full h-9">В корзину</Button>
            </CardContent>
        </Card>
     );
  }


  return (
    <Card className="w-full product-card flex flex-col h-full overflow-hidden group">
        <CardHeader className="p-4">

            <Link href={`/part/${product.id}`} passHref legacyBehavior={false} aria-label={`Посмотреть детали для ${product.name}`}>
                  <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2 text-sm font-medium h-10">
                    {product.name}
                   </CardTitle>
             </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-grow p-4 pt-0">
             <Link href={`/part/${product.id}`} passHref legacyBehavior={false} className="block w-full mb-3" aria-label={`Посмотреть изображение ${product.name}`}>
                    <img
                        src={product.imageUrl || 'https://picsum.photos/300/200'}
                        alt={product.name}
                        className="object-cover rounded-md h-28 w-full group-hover:opacity-90 transition-opacity border"
                        loading="lazy"
                         onError={(e) => (e.currentTarget.src = 'https://picsum.photos/300/200')}
                    />
            </Link>
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
            <p className="text-base font-semibold mb-3">{formatPrice(product.price)}</p>
        </CardContent>

         <div className="p-4 pt-0 mt-auto">

            <Button onClick={handleButtonClick} className="w-full h-9">В корзину</Button>
        </div>
    </Card>
  );
};

export default Autopart;
