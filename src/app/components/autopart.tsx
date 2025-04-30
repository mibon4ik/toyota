'use client';
import React, { useCallback } from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart';
import {useToast} from "@/hooks/use-toast";
import Link from "next/link";
import Image from 'next/image';

interface AutopartProps {
  product: AutoPart;
  onAddToCart: (product: AutoPart) => void;
}

const Autopart: React.FC<AutopartProps> = ({ product, onAddToCart }) => {
  const { toast } = useToast();

  const handleButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
       e.preventDefault();
       e.stopPropagation();
       onAddToCart(product);
   }, [onAddToCart, product]);


  const formatPrice = useCallback((price: number): string => {
      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);

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
             <Link href={`/part/${product.id}`} passHref legacyBehavior={false} className="block w-full mb-3 relative aspect-video" aria-label={`Посмотреть изображение ${product.name}`}>
                    <Image
                        src={product.imageUrl || 'https://picsum.photos/300/200'}
                        alt={product.name}
                        fill // Use fill layout
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Adjust sizes based on your grid layout
                        className="object-cover rounded-md group-hover:opacity-90 transition-opacity border"
                        loading="lazy" // Keep lazy loading for product cards
                         onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = 'https://picsum.photos/300/200';
                            target.src = 'https://picsum.photos/300/200';
                         }}
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
