
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AutoPart } from '@/types/autopart'; // Corrected import path
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation'; // Import useRouter
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define CartItem extending AutoPart with quantity
interface CartItem extends AutoPart {
  quantity: number;
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

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

   // Effect to redirect if cart becomes empty after mount
  useEffect(() => {
    if (isMounted && cartItems.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Вы будете перенаправлены в магазин.",
        variant: "destructive",
      });
      router.push('/shop');
    }
  }, [isMounted, cartItems, router, toast]);

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

   const formatPrice = useCallback((price: number): string => {
      // Assuming price is already in Tenge (KZT)
      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);


    const handleCheckoutSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO: Implement actual order submission logic here
        // - Collect form data
        // - Validate form data
        // - Send order data to backend/API
        // - Handle success/error response

         console.log("Оформление заказа...");
         // Simulate successful order placement
         toast({
            title: "Заказ оформлен!",
            description: "Ваш заказ успешно оформлен. Спасибо за покупку!",
         });

         // Clear the cart after successful checkout
         localStorage.removeItem('cartItems');
         setCartItems([]); // Update local state
          window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify navbar

          // Redirect to a success page or home page
         router.push('/');
    };


  // Render loading state or nothing on the server/initial render
  if (!isMounted) {
     // You can return a loading skeleton here if needed
    return (
         <div className="container mx-auto py-8 max-w-3xl">
             <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
              <p className="text-center text-muted-foreground">Загрузка корзины...</p>
              {/* Add skeleton loaders for form fields */}
              <div className="space-y-8 mt-8">
                 <Skeleton className="h-40 w-full rounded-md" />
                 <Skeleton className="h-48 w-full rounded-md" />
                 <Skeleton className="h-24 w-full rounded-md" />
                  <Skeleton className="h-32 w-full rounded-md" />
                 <Skeleton className="h-12 w-1/3 mx-auto rounded-md" />
               </div>
         </div>
    );
  }

  // If cart is empty after mount, the useEffect above will redirect,
  // but we can add an extra check here to prevent rendering the form briefly
   if (cartItems.length === 0) {
      return (
           <div className="container mx-auto py-8 max-w-3xl">
             <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
              <p className="text-center text-muted-foreground">Ваша корзина пуста. Перенаправление в магазин...</p>
           </div>
      );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
      <form onSubmit={handleCheckoutSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Информация о покупателе</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="Имя" required autoComplete="given-name" />
            </div>
             <div className="space-y-1">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Фамилия" required autoComplete="family-name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required autoComplete="tel" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="my@email.com" required autoComplete="email" />
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
              <Input id="city" name="city" type="text" placeholder="Город" required autoComplete="address-level2"/>
            </div>
             <div className="space-y-1">
              <Label htmlFor="street">Улица</Label>
              <Input id="street" name="street" type="text" placeholder="Улица" required autoComplete="address-line1"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="house">Номер дома</Label>
                <Input id="house" name="house" type="text" placeholder="Номер дома" required autoComplete="address-line2" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apartment">Номер квартиры/офиса</Label>
                <Input id="apartment" name="apartment" type="text" placeholder="Номер квартиры" autoComplete="address-line3" />
              </div>
            </div>
             {/* Optional: Postal Code */}
            {/* <div className="space-y-1">
              <Label htmlFor="postalCode">Почтовый индекс</Label>
              <Input id="postalCode" name="postalCode" type="text" placeholder="Почтовый индекс" autoComplete="postal-code" />
            </div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Способ оплаты</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-1">
              <Label htmlFor="paymentMethod">Выберите способ оплаты</Label>
               <Select required name="paymentMethod">
                 <SelectTrigger id="paymentMethod">
                   <SelectValue placeholder="Выберите способ оплаты" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="online">Онлайн оплата картой (недоступно)</SelectItem>
                   <SelectItem value="cash_on_delivery">Оплата при получении</SelectItem>
                   {/* Add more options like Kaspi Pay if applicable */}
                    {/* <SelectItem value="kaspi">Kaspi Pay (недоступно)</SelectItem> */}
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
                 <div className="space-y-2 mb-4 border-b pb-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="flex-1 mr-2">
                                {item.name} <span className="text-muted-foreground">(x{item.quantity})</span>
                            </span>
                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                    ))}
                 </div>
             ) : (
                 // This case should ideally not be reached due to redirection logic
                <p className="text-muted-foreground text-center mb-4">Ваша корзина пуста.</p>
             )}
             {/* TODO: Add shipping cost calculation if applicable */}
            {/* Display dynamic total */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold">Итого:</span>
                <span className="text-xl font-bold">{formatPrice(calculateTotal())}</span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button type="submit" size="lg" disabled={cartItems.length === 0}>
             Оформить заказ ({formatPrice(calculateTotal())})
             </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;

    