
'use client';
import React, { useCallback } from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart';
// import {useToast} from "@/hooks/use-toast"; // Toast is handled in the parent now
import Link from "next/link";
import Image from 'next/image'; // Import next/image
import { formatPrice } from '@/lib/utils'; // Import formatPrice

interface AutopartProps {
  product: AutoPart;
  onAddToCart: (product: AutoPart) => void; // Receive callback from parent
}

const Autopart: React.FC<AutopartProps> = ({ product, onAddToCart }) => {
  // const { toast } = useToast(); // Toast logic moved to parent

  const handleButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
       e.preventDefault(); // Prevent link navigation if button inside link
       e.stopPropagation(); // Stop event bubbling up if needed
       // Call the parent's addToCart function, passing the full product object
       onAddToCart(product);
       // Toast is now triggered in the parent component (ShopPage or HomePage)
   }, [onAddToCart, product]);

  return (
    <Card className="w-full product-card flex flex-col h-full overflow-hidden group">
        <CardHeader className="p-4">
            {/* Ensure Link wraps the interactive element (CardTitle) */}
            <Link href={`/part/${product.id}`} passHref legacyBehavior={false} aria-label={`Посмотреть детали для ${product.name}`}>
                  <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2 text-sm font-medium h-10">
                    {product.name}
                   </CardTitle>
             </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-grow p-4 pt-0">
             {/* Link wrapping the image */}
             <Link href={`/part/${product.id}`} passHref legacyBehavior={false} className="block w-full mb-3 relative aspect-video" aria-label={`Посмотреть изображение ${product.name}`}>
                    {/* Use next/image component */}
                    <Image
                        key={product.imageUrl} // Add key to help React detect changes
                        src={product.imageUrl || 'https://picsum.photos/300/200'} // Provide a default placeholder
                        alt={product.name}
                        fill // Use fill layout
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Provide sizes attribute
                        className="object-cover rounded-md group-hover:opacity-90 transition-opacity border"
                        loading="lazy" // Keep lazy loading for non-critical images
                         onError={(e) => {
                            // Fallback to picsum on error
                             console.error(`Error loading image for ${product.name}: ${product.imageUrl}`);
                            const target = e.target as HTMLImageElement;
                            target.srcset = 'https://picsum.photos/300/200'; // Provide a base src for srcset calculation
                            target.src = 'https://picsum.photos/300/200';
                         }}
                         data-ai-hint={product.dataAiHint || `${product.category} ${product.brand}`} // Add hint
                    />
            </Link>
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
            <p className="text-base font-semibold mb-3">{formatPrice(product.price)}</p>
        </CardContent>

         <div className="p-4 pt-0 mt-auto">
            {/* Add to Cart Button */}
            <Button onClick={handleButtonClick} className="w-full h-9 bg-[#535353ff] hover:bg-[#535353ff]/90">В корзину</Button>
        </div>
    </Card>
  );
};

export default Autopart;
