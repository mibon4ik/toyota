"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoPart } from "@/services/autoparts"; // Assuming AutoPart type includes price
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// Define CartItem extending AutoPart with quantity
interface CartItem extends AutoPart {
  quantity: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false); // For handling client-side only logic
  const { toast } = useToast();

  // Load cart from localStorage on component mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        // Basic validation of parsed cart items
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

  // Persist cart changes to localStorage whenever cartItems state updates
  useEffect(() => {
    if (isMounted) { // Only run on client after initial mount
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      // Optional: Dispatch a custom event to notify other components (like navbar badge)
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [cartItems, isMounted]);

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]); // Recalculate only when cartItems change

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
      const itemToUpdate = currentItems.find(item => item.id === id);
      if (itemToUpdate && itemToUpdate.quantity > 1) {
        return currentItems.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // If quantity is 1, don't decrement further (or optionally remove)
      return currentItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== id));
    toast({
      title: "Товар удален!",
      description: "Товар удален из корзины",
      variant: "destructive" // Optional: Use destructive variant for removal
    });
  }, [toast]); // Add toast as dependency

  const formatPrice = (price: number): string => {
    // Use a fixed exchange rate for demonstration
    // In a real app, fetch this dynamically or use a library
    const exchangeRate = 500; // Example: 1 USD = 500 KZT
    const priceInTenge = price * exchangeRate;
    return new Intl.NumberFormat('ru-KZ', { // Use Kazakh locale for KZT formatting
      style: 'currency',
      currency: 'KZT', // ISO 4217 code for Kazakhstani Tenge
      minimumFractionDigits: 0, // Typically Tenge doesn't use fractional units in display
      maximumFractionDigits: 0,
    }).format(priceInTenge);
  };

  // Render nothing on the server to avoid hydration issues with localStorage
  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Корзина</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-muted-foreground">Ваша корзина пуста.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.imageUrl || 'https://picsum.photos/100/100'} // Fallback image
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      onError={(e) => (e.currentTarget.src = 'https://picsum.photos/100/100')} // Handle image load errors
                    />
                    <div className="flex-grow">
                      <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price)} / шт.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
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
                         className="h-8 w-12 text-center border-l border-r rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                         value={item.quantity}
                         onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                         min="1"
                         aria-label={`Количество ${item.name}`}
                       />
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 rounded-l-none"
                         onClick={() => incrementQuantity(item.id)}
                         aria-label={`Увеличить количество ${item.name}`}
                       >
                         +
                       </Button>
                     </div>

                     <p className="text-lg font-semibold w-24 text-right">
                       {formatPrice(item.price * item.quantity)}
                     </p>

                    <Button
                      size="sm"
                      variant="ghost" // More subtle removal button
                      className="text-red-500 hover:bg-red-100 hover:text-red-600 px-2"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Удалить ${item.name} из корзины`}
                    >
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold mb-4 sm:mb-0">
              Итого: {formatPrice(calculateTotal())}
            </h2>
            <Link href="/checkout" passHref>
              <Button size="lg" className="w-full sm:w-auto">Перейти к оформлению</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;