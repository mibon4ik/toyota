
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AutoPart } from '@/types/autopart';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from '@/lib/utils';
import { createOrder } from '@/services/orders'; // Import the createOrder service
import type { OrderItem, CustomerInfo, ShippingAddress } from '@/types/order'; // Import Order types

interface CartItem extends AutoPart {
  quantity: number;
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load cart from localStorage
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

  // Redirect if cart is empty after mount
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

  // Calculate total price
  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Handle form submission
    const handleCheckoutSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoadingCheckout(true);

        const formData = new FormData(event.currentTarget);
        const customerInfo: CustomerInfo = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
        };
        const shippingAddress: ShippingAddress = {
            city: formData.get('city') as string,
            street: formData.get('street') as string,
            house: formData.get('house') as string,
            apartment: formData.get('apartment') as string || undefined,
        };
        const paymentMethod = formData.get('paymentMethod') as 'online' | 'cash_on_delivery';

        // Basic validation example (add more robust validation as needed)
        if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone || !customerInfo.email || !shippingAddress.city || !shippingAddress.street || !shippingAddress.house || !paymentMethod) {
            toast({
                title: "Ошибка валидации",
                description: "Пожалуйста, заполните все обязательные поля.",
                variant: "destructive",
            });
            setIsLoadingCheckout(false);
            return;
        }

         const orderItems: OrderItem[] = cartItems.map(item => ({
            ...item, // Spread all properties from CartItem (which extends AutoPart)
            quantity: item.quantity
         }));

        try {
             await createOrder({
                customerInfo,
                shippingAddress,
                items: orderItems,
                totalAmount: calculateTotal(),
                paymentMethod,
             });

             console.log("Оформление заказа успешно завершено.");
             toast({
                title: "Заказ оформлен!",
                description: "Ваш заказ успешно оформлен. Спасибо за покупку!",
             });

             // Clear cart and redirect
             localStorage.removeItem('cartItems');
             setCartItems([]);
             window.dispatchEvent(new CustomEvent('cartUpdated'));
             router.push('/');

        } catch (error: any) {
             console.error("Ошибка при создании заказа:", error);
             toast({
                title: "Ошибка",
                description: `Не удалось оформить заказ: ${error.message || 'Попробуйте позже.'}`,
                variant: "destructive",
             });
        } finally {
             setIsLoadingCheckout(false);
        }
    };


  // Render loading state if not mounted
  if (!isMounted) {
    return (
         <div className="container mx-auto py-8 max-w-3xl">
             <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
              <p className="text-center text-muted-foreground">Загрузка корзины...</p>
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

  // Render message and redirect logic if cart is empty
   if (cartItems.length === 0) {
      return (
           <div className="container mx-auto py-8 max-w-3xl">
             <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
              <p className="text-center text-muted-foreground">Ваша корзина пуста. Перенаправление в магазин...</p>
           </div>
      );
  }

  // Render checkout form
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
      <form onSubmit={handleCheckoutSubmit} className="space-y-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о покупателе</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="Имя" required autoComplete="given-name" disabled={isLoadingCheckout}/>
            </div>
             <div className="space-y-1">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Фамилия" required autoComplete="family-name" disabled={isLoadingCheckout}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required autoComplete="tel" disabled={isLoadingCheckout}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="my@email.com" required autoComplete="email" disabled={isLoadingCheckout}/>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Адрес доставки</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label htmlFor="city">Город</Label>
              <Input id="city" name="city" type="text" placeholder="Город" required autoComplete="address-level2" disabled={isLoadingCheckout}/>
            </div>
             <div className="space-y-1">
              <Label htmlFor="street">Улица</Label>
              <Input id="street" name="street" type="text" placeholder="Улица" required autoComplete="address-line1" disabled={isLoadingCheckout}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="house">Номер дома</Label>
                <Input id="house" name="house" type="text" placeholder="Номер дома" required autoComplete="address-line2" disabled={isLoadingCheckout}/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="apartment">Номер квартиры/офиса</Label>
                <Input id="apartment" name="apartment" type="text" placeholder="Номер квартиры" autoComplete="address-line3" disabled={isLoadingCheckout}/>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Способ оплаты</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-1">
              <Label htmlFor="paymentMethod">Выберите способ оплаты</Label>
               <Select required name="paymentMethod" defaultValue="cash_on_delivery" disabled={isLoadingCheckout}>
                 <SelectTrigger id="paymentMethod">
                   <SelectValue placeholder="Выберите способ оплаты" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="online" disabled>Онлайн оплата картой (недоступно)</SelectItem>
                   <SelectItem value="cash_on_delivery">Оплата при получении</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Итоговый заказ</CardTitle>
          </CardHeader>
          <CardContent>
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
                <p className="text-muted-foreground text-center mb-4">Ваша корзина пуста.</p>
             )}
            <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold">Итого:</span>
                <span className="text-xl font-bold">{formatPrice(calculateTotal())}</span>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center mt-8">
          <Button type="submit" size="lg" disabled={cartItems.length === 0 || isLoadingCheckout}>
             {isLoadingCheckout ? 'Оформление...' : `Оформить заказ (${formatPrice(calculateTotal())})`}
             </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
