"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoPart } from "@/services/autoparts";
import { useToast } from "@/hooks/use-toast";

interface CartItem extends AutoPart {
  quantity: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const incrementQuantity = (id: string) => {
    setCartItems(currentItems => {
      const updatedItems = currentItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      localStorage.setItem('cartItems', JSON.stringify(updatedItems)); // Update local storage
      return updatedItems;
    });
  };

  const decrementQuantity = (id: string) => {
    setCartItems(currentItems => {
      const updatedItems = currentItems.map(item => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      localStorage.setItem('cartItems', JSON.stringify(updatedItems)); // Update local storage
      return updatedItems;
    });
  };

  const removeItem = (id: string) => {
    setCartItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== id);
      localStorage.setItem('cartItems', JSON.stringify(newItems)); // Update local storage
      toast({
        title: "Товар удален!",
        description: "Товар удален из корзины"
      });
      return newItems;
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Корзина</h1>
      {cartItems.length === 0 ? (
        <p className="text-center">Ваша корзина пуста.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <Card key={item.id} className="mb-4">
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded" />
                <div>
                  <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                  <div className="flex items-center">
                    <Button size="sm" onClick={() => decrementQuantity(item.id)}>-</Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button size="sm" onClick={() => incrementQuantity(item.id)}>+</Button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>Удалить</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="text-right">
            <h2 className="text-2xl font-bold">Итого: ${calculateTotal()}</h2>
            <Button className="mt-4">Перейти к оформлению</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
