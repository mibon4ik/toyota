
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AutoPart } from "@/types/autopart"; // Corrected import path
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// Define CartItem extending AutoPart with quantity
interface CartItem extends AutoPart {
  quantity: number;
}

interface AutopartProps {
  product: AutoPart;
}

const Autopart: React.FC<AutopartProps> = ({ product }) => {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize cart state lazily from localStorage on mount
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // This function runs only once on initial render
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        try {
          const parsedCart: CartItem[] = JSON.parse(storedCart);
           // Basic validation
           if (Array.isArray(parsedCart) && parsedCart.every(item => item.id && typeof item.quantity === 'number')) {
             return parsedCart;
           }
        } catch (e) {
          console.error("Error parsing cart items from localStorage:", e);
          localStorage.removeItem('cartItems'); // Clear corrupted data
        }
      }
    }
    return []; // Default to empty cart if localStorage is unavailable or invalid
  });

  useEffect(() => {
    setIsMounted(true); // Component has mounted
  }, []);

  // Update local storage whenever cartItems state changes (client-side only)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
       // Notify other components (like navbar badge) about the cart update
       window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [cartItems, isMounted]);

  const handleAddToCart = useCallback(() => {
    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      let updatedCart;

      if (existingItemIndex > -1) {
        // If item exists, increment quantity
        updatedCart = currentItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
         toast({
             title: "Количество обновлено!",
             description: `Количество ${product.name} в корзине увеличено.`,
         });
      } else {
        // If item doesn't exist, add it with quantity 1
        updatedCart = [...currentItems, { ...product, quantity: 1 }];
         toast({
             title: "Товар добавлен в корзину!",
             description: `${product.name} был добавлен в вашу корзину.`,
         });
      }
      return updatedCart;
    });


  }, [product, toast, cartItems]); // Add cartItems to dependencies

  const formatPrice = (price: number): string => {
      // Assuming price is already in Tenge (KZT) as per services/autoparts.ts
      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0, // Tenge usually doesn't show fractions
        maximumFractionDigits: 0,
      }).format(price);
    };

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
            <Button onClick={handleAddToCart} className="w-full">В корзину</Button>
        </div>
    </Card>
  );
};

export default Autopart;
