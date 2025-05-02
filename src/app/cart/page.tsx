
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils'; // Import formatPrice

interface CartItem extends AutoPart {
  quantity: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load cart from localStorage only on the client-side after mount
  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        // Enhanced validation
        if (Array.isArray(parsedCart) && parsedCart.every(item =>
            item && // Check if item is not null/undefined
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            typeof item.imageUrl === 'string' // Ensure imageUrl exists and is a string
        )) {
          setCartItems(parsedCart);
        } else {
          console.warn("Invalid cart data found in localStorage (missing properties or wrong types). Clearing cart.");
          localStorage.removeItem('cartItems');
          setCartItems([]); // Clear state too
        }
      } catch (e) {
        console.error("Error parsing cart items from localStorage:", e);
        localStorage.removeItem('cartItems'); // Clear corrupted data
        setCartItems([]); // Clear state too
      }
    } else {
         setCartItems([]); // Ensure cart is empty if nothing in storage
    }
  }, []);

  // Update localStorage whenever cartItems change, only on client
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify nav bar or other components
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
        // Decrease quantity if it's more than 1
        return currentItems.map((item, index) =>
          index === itemIndex ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // Optionally remove item if quantity becomes 0, or keep it at 1
      // If removing: return currentItems.filter((_, index) => index !== itemIndex);
      return currentItems; // Keep at 1 for now
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    const itemToRemove = cartItems.find(item => item.id === id);
    setCartItems(currentItems => currentItems.filter(item => item.id !== id));
    // Defer toast to avoid calling during render
    setTimeout(() => {
        toast({
          title: "Товар удален!",
          description: `${itemToRemove?.name || 'Товар'} удален из корзины`,
          variant: "destructive" // Or another appropriate variant
        });
    }, 0);
  }, [cartItems, toast]);


  // Show loading state until mounted
  if (!isMounted) {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Корзина</h1>
            <p className="text-center text-muted-foreground">Загрузка корзины...</p>
            {/* Optional: Add skeleton loader here */}
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
                <Button className="bg-[#535353ff] hover:bg-[#535353ff]/90">Перейти в магазин</Button>
            </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Item Details */}
                  <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                       <Image
                         // Using item.imageUrl as the key might help React detect changes
                         key={item.imageUrl}
                         src={item.imageUrl || 'https://picsum.photos/100/100'} // Use the imageUrl from the cart item
                         alt={item.name}
                         fill // Use fill layout
                         sizes="80px" // Specify size for optimization
                         className="object-cover rounded-md border"
                         onError={(e) => {
                           // Fallback on error
                           console.error(`Error loading image for ${item.name}: ${item.imageUrl}`);
                           const target = e.target as HTMLImageElement;
                           target.srcset = 'https://picsum.photos/100/100';
                           target.src = 'https://picsum.photos/100/100';
                         }}
                         data-ai-hint={item.dataAiHint || `${item.category} ${item.brand} cart item`} // Add hint
                       />
                    </div>
                    {/* Text Info */}
                    <div className="flex-grow">
                      <CardTitle className="text-lg mb-1 line-clamp-2">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price)} / шт.</p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-shrink-0">
                     {/* Quantity Controls */}
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

                     {/* Item Total Price */}
                     <p className="text-lg font-semibold w-28 text-right">
                       {formatPrice(item.price * item.quantity)}
                     </p>

                     {/* Remove Button */}
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

          {/* Cart Summary & Checkout Button */}
          <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold">
              Итого: {formatPrice(calculateTotal())}
            </h2>
            <Link href="/checkout" passHref legacyBehavior={false}>
              <Button size="lg" className="w-full sm:w-auto bg-[#535353ff] hover:bg-[#535353ff]/90">Перейти к оформлению</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
