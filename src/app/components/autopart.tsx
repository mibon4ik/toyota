'use client';
import React, { useCallback } from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart';
import Link from "next/link";
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface AutopartDisplayProps {
  productInfo: AutoPart;
  onAddToCart: (product: AutoPart) => void;
}

const Autopart: React.FC<AutopartDisplayProps> = ({ productInfo, onAddToCart }) => {

  const handleAddClick = useCallback(() => {
       onAddToCart(productInfo);
   }, [onAddToCart, productInfo]);

  return (
    <Card className="w-full product-card flex flex-col h-full overflow-hidden group">
        <CardHeader className="p-4">
            <Link href={`/part/${productInfo.id}`} passHref legacyBehavior={false} aria-label={`Посмотреть детали для ${productInfo.name}`}>
                  <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2 text-sm font-medium h-10">
                    {productInfo.name}
                   </CardTitle>
             </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-grow p-4 pt-0">
             <Link href={`/part/${productInfo.id}`} passHref legacyBehavior={false} className="block w-full mb-3 relative aspect-video" aria-label={`Посмотреть изображение ${productInfo.name}`}>
                    <Image
                        key={productInfo.imageUrl}
                        src={productInfo.imageUrl || 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg'}
                        alt={productInfo.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover rounded-md group-hover:opacity-90 transition-opacity border"
                        loading="lazy"
                         onError={(e) => {
                            const targetImg = e.target as HTMLImageElement;
                            targetImg.srcset = 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg';
                            targetImg.src = 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg';
                         }}
                         data-ai-hint={productInfo.dataAiHint || `${productInfo.category} ${productInfo.brand}`}
                    />
            </Link>
            <p className="text-xs text-muted-foreground mb-1">{productInfo.brand}</p>
            <p className="text-base font-semibold mb-3">{formatPrice(productInfo.price)}</p>
        </CardContent>

         <div className="p-4 pt-0 mt-auto">
            <Button onClick={handleAddClick} className="w-full h-9 bg-[#535353ff] hover:bg-[#535353ff]/90">В корзину</Button>
        </div>
    </Card>
  );
};

export default Autopart;
