"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Trash2 } from 'lucide-react';
import Image from 'next/image'; // Import next/image

interface CartItem extends AutoPart {
  quantity: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Load cart from local storage only on client-side mount
  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        // Add validation if needed
        if (Array.isArray(parsedCart) && parsedCart.every(item => item.id && item.name && typeof item.price === 'number' && typeof item.quantity === 'number')) {
          setCartItems(parsedCart);
        } else {
          console.warn("Invalid cart data found in localStorage. Clearing cart.");
          localStorage.removeItem('cartItems');
        }
      } catch (e) {
        console.error("Error parsing cart items from localStorage:", e);
        localStorage.removeItem('cartItems'); // Clear corrupted data
      }
    }
  }, []);

  // Save cart to local storage whenever it changes (client-side only)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify header
    }
  }, [cartItems, isMounted]);

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    const quantity = Math.max(1, newQuantity); // Ensure quantity is at least 1

    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, []);

  const incrementQuantity = useCallback((id: string) => {
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const decrementQuantity = useCallback((id: string) => {
    setCartItems(currentItems => {
      const itemIndex = currentItems.findIndex(item => item.id === id);
      if (itemIndex > -1 && currentItems[itemIndex].quantity > 1) {
        return currentItems.map((item, index) =>
          index === itemIndex ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // If quantity is 1, do nothing (or consider removing the item)
      return currentItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== id));
     // Use setTimeout to ensure state update happens before toast
     setTimeout(() => {
         toast({
           title: "Товар удален!",
           description: "Товар удален из корзины",
           variant: "destructive"
         });
     }, 0);
  }, [toast]);

   const formatPrice = useCallback((price: number): string => {
      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);

  // Loading state until component is mounted
  if (!isMounted) {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Корзина</h1>
             <p className="text-center text-muted-foreground">Загрузка корзины...</p>
             {/* Optional: Add Skeleton loaders here */}
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Корзина</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">Ваша корзина пуста.</p>
             <Link href="/shop" passHref legacyBehavior={false}>
                <Button>Перейти в магазин</Button>
            </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
                    <div className="relative w-20 h-20 flex-shrink-0">
                       <Image
                         src={item.imageUrl || 'https://picsum.photos/100/100'}
                         alt={item.name}
                         fill
                         sizes="80px" // Specify size for optimization
                         className="object-cover rounded-md border"
                         onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.srcset = 'https://picsum.photos/100/100';
                           target.src = 'https://picsum.photos/100/100';
                         }}
                       />
                    </div>
                    <div className="flex-grow">
                      <CardTitle className="text-lg mb-1 line-clamp-2">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price)} / шт.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-shrink-0">
                     <div className="flex items-center border rounded-md">
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 rounded-r-none"
                         onClick={() => decrementQuantity(item.id)}
                         disabled={item.quantity <= 1}
                         aria-label={`Уменьшить количество ${item.name}`}
                       >
                         -
                       </Button>
                       <Input
                         type="number"
                         className="h-8 w-12 text-center border-l border-r-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                         value={item.quantity}
                         onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                         min="1"
                         aria-label={`Количество ${item.name}`}
                       />
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 rounded-l-none border-l"
                         onClick={() => incrementQuantity(item.id)}
                         aria-label={`Увеличить количество ${item.name}`}
                       >
                         +
                       </Button>
                     </div>

                     <p className="text-lg font-semibold w-28 text-right">
                       {formatPrice(item.price * item.quantity)}
                     </p>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Удалить ${item.name} из корзины`}
                    >
                     <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">

            <h2 className="text-2xl font-bold">
              Итого: {formatPrice(calculateTotal())}
            </h2>
            <Link href="/checkout" passHref legacyBehavior={false}>
              <Button size="lg" className="w-full sm:w-auto">Перейти к оформлению</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
