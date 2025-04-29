
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AutoPart } from '@/services/autoparts'; // Assuming AutoPart type includes price

// Define CartItem extending AutoPart with quantity
interface CartItem extends AutoPart {
  quantity: number;
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on component mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        if (Array.isArray(parsedCart) && parsedCart.every(item => item.id && item.name && typeof item.price === 'number' && typeof item.quantity === 'number')) {
          setCartItems(parsedCart);
        } else {
          console.warn("Invalid cart data found in localStorage. Clearing cart.");
          localStorage.removeItem('cartItems');
        }
      } catch (e) {
        console.error("Error parsing cart items from localStorage:", e);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const formatPrice = (price: number): string => {
    const exchangeRate = 500; // Example: 1 USD = 500 KZT
    const priceInTenge = price * exchangeRate;
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInTenge);
  };

  // Render loading state or nothing on the server/initial render
  if (!isMounted) {
     // You can return a loading skeleton here if needed
    return (
         <div className="container mx-auto py-8 max-w-3xl">
             <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
              <p className="text-center text-muted-foreground">Загрузка корзины...</p>
         </div>
    );
  }

  // TODO: Implement form handling, state management, and submission logic

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
      <form className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Информация о покупателе</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" type="text" placeholder="Имя" required />
            </div>
             <div className="space-y-1">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" type="text" placeholder="Фамилия" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input id="phone" type="tel" placeholder="Номер телефона" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Email" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Адрес доставки</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label htmlFor="city">Город</Label>
              <Input id="city" type="text" placeholder="Город" required />
            </div>
             <div className="space-y-1">
              <Label htmlFor="street">Улица</Label>
              <Input id="street" type="text" placeholder="Улица" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="house">Номер дома</Label>
                <Input id="house" type="text" placeholder="Номер дома" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apartment">Номер квартиры</Label>
                <Input id="apartment" type="text" placeholder="Номер квартиры" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Способ оплаты</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-1">
              <Label htmlFor="paymentMethod">Выберите способ оплаты</Label>
               <Select required>
                 <SelectTrigger id="paymentMethod">
                   <SelectValue placeholder="Выберите способ оплаты" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="online">Онлайн оплата</SelectItem>
                   <SelectItem value="cash_on_delivery">Оплата при получении</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Итоговый заказ</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Display cart items summary here */}
             {cartItems.length > 0 ? (
                 <div className="space-y-2 mb-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} (x{item.quantity})</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                    ))}
                 </div>
             ) : (
                <p className="text-muted-foreground text-center mb-4">Ваша корзина пуста.</p>
             )}
            {/* Display dynamic total */}
            <p className="text-xl font-semibold border-t pt-4">
                Итого: {formatPrice(calculateTotal())}
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          {/* TODO: Add onSubmit handler */}
          <Button type="submit" size="lg" disabled={cartItems.length === 0}>Оформить заказ</Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
