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
import { createOrder } from '@/services/orders';
import type { OrderItem, CustomerInfo, ShippingAddress } from '@/types/order';

interface ItemInCart extends AutoPart {
  quantity: number;
}

const OrderCheckoutPage = () => {
  const [cartContents, setCartContents] = useState<ItemInCart[]>([]);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const { toast: displayNotification } = useToast();
  const routerInstance = useRouter();

  useEffect(() => {
    setIsPageLoaded(true);
    const storedItems = localStorage.getItem('cartItems');
    if (storedItems) {
      try {
        const parsedItems: ItemInCart[] = JSON.parse(storedItems);
        if (Array.isArray(parsedItems) && parsedItems.every(item => item.id && item.name && typeof item.price === 'number' && typeof item.quantity === 'number')) {
          setCartContents(parsedItems);
        } else {
          localStorage.removeItem('cartItems');
        }
      } catch (e) {
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  useEffect(() => {
    if (isPageLoaded && cartContents.length === 0) {
      displayNotification({
        title: "Корзина пуста",
        description: "Вы будете перенаправлены в магазин.",
        variant: "destructive",
      });
      routerInstance.push('/shop');
    }
  }, [isPageLoaded, cartContents, routerInstance, displayNotification]);

  const getCartTotal = useCallback(() => {
    return cartContents.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartContents]);

    const submitOrderForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmittingOrder(true);

        const formElements = new FormData(event.currentTarget);
        const customerDetails: CustomerInfo = {
            firstName: formElements.get('firstName') as string,
            lastName: formElements.get('lastName') as string,
            phone: formElements.get('phone') as string,
            email: formElements.get('email') as string,
        };
        const deliveryAddress: ShippingAddress = {
            city: formElements.get('city') as string,
            street: formElements.get('street') as string,
            house: formElements.get('house') as string,
            apartment: formElements.get('apartment') as string || undefined,
        };
        const selectedPaymentMethod = formElements.get('paymentMethod') as 'online' | 'cash_on_delivery';

        if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.phone || !customerDetails.email || !deliveryAddress.city || !deliveryAddress.street || !deliveryAddress.house || !selectedPaymentMethod) {
            displayNotification({
                title: "Ошибка валидации",
                description: "Пожалуйста, заполните все обязательные поля.",
                variant: "destructive",
            });
            setIsSubmittingOrder(false);
            return;
        }

         const orderItemsList: OrderItem[] = cartContents.map(item => ({
            ...item, 
            quantity: item.quantity
         }));

        try {
             await createOrder({
                customerInfo: customerDetails,
                shippingAddress: deliveryAddress,
                items: orderItemsList,
                totalAmount: getCartTotal(),
                paymentMethod: selectedPaymentMethod,
             });

             displayNotification({
                title: "Заказ оформлен!",
                description: "Ваш заказ успешно оформлен. Спасибо за покупку!",
             });

             localStorage.removeItem('cartItems');
             setCartContents([]);
             window.dispatchEvent(new CustomEvent('cartUpdated'));
             routerInstance.push('/');

        } catch (error: any) {
             displayNotification({
                title: "Ошибка",
                description: `Не удалось оформить заказ: ${error.message || 'Попробуйте позже.'}`,
                variant: "destructive",
             });
        } finally {
             setIsSubmittingOrder(false);
        }
    };


  if (!isPageLoaded) {
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

   if (cartContents.length === 0 && isPageLoaded) { // Ensure page is loaded before checking cart
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
      <form onSubmit={submitOrderForm} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Информация о покупателе</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="Имя" required autoComplete="given-name" disabled={isSubmittingOrder}/>
            </div>
             <div className="space-y-1">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Фамилия" required autoComplete="family-name" disabled={isSubmittingOrder}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required autoComplete="tel" disabled={isSubmittingOrder}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="my@email.com" required autoComplete="email" disabled={isSubmittingOrder}/>
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
              <Input id="city" name="city" type="text" placeholder="Город" required autoComplete="address-level2" disabled={isSubmittingOrder}/>
            </div>
             <div className="space-y-1">
              <Label htmlFor="street">Улица</Label>
              <Input id="street" name="street" type="text" placeholder="Улица" required autoComplete="address-line1" disabled={isSubmittingOrder}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="house">Номер дома</Label>
                <Input id="house" name="house" type="text" placeholder="Номер дома" required autoComplete="address-line2" disabled={isSubmittingOrder}/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="apartment">Номер квартиры/офиса</Label>
                <Input id="apartment" name="apartment" type="text" placeholder="Номер квартиры" autoComplete="address-line3" disabled={isSubmittingOrder}/>
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
               <Select required name="paymentMethod" defaultValue="cash_on_delivery" disabled={isSubmittingOrder}>
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

        <Card>
          <CardHeader>
            <CardTitle>Итоговый заказ</CardTitle>
          </CardHeader>
          <CardContent>
             {cartContents.length > 0 ? (
                 <div className="space-y-2 mb-4 border-b pb-4">
                    {cartContents.map(item => (
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
                <span className="text-xl font-bold">{formatPrice(getCartTotal())}</span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button type="submit" size="lg" disabled={cartContents.length === 0 || isSubmittingOrder}>
             {isSubmittingOrder ? 'Оформление...' : `Оформить заказ (${formatPrice(getCartTotal())})`}
             </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderCheckoutPage;
