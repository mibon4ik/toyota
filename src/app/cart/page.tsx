
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AutoPart } from '@/types/autopart';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from '@/components/icons';

interface ShoppingCartItem extends AutoPart {
  quantity: number;
}

const ShoppingCartPage = () => {
  const [itemsInCart, setItemsInCart] = useState<ShoppingCartItem[]>([]);
  const [pageMounted, setPageMounted] = useState(false);
  const { toast: showNotification } = useToast();
  const pageRouter = useRouter();

  useEffect(() => {
    setPageMounted(true);
    const cartDataFromStorage = localStorage.getItem('cartItems');
    if (cartDataFromStorage) {
      try {
        let parsedItems: ShoppingCartItem[] = JSON.parse(cartDataFromStorage);
        if (Array.isArray(parsedItems)) {
          const validItems = parsedItems.filter(item =>
            item && 
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' && item.quantity > 0 && 
            typeof item.imageUrl === 'string' 
          );

          if (validItems.length !== parsedItems.length) {
             localStorage.setItem('cartItems', JSON.stringify(validItems));
          }
          setItemsInCart(validItems);
        } else {
          localStorage.removeItem('cartItems');
          setItemsInCart([]);
        }
      } catch (e) {
        localStorage.removeItem('cartItems');
        setItemsInCart([]);
      }
    } else {
         setItemsInCart([]);
    }
  }, []);

  useEffect(() => {
    if (pageMounted) {
      const validCartItems = itemsInCart.filter(item => item.quantity > 0);
      localStorage.setItem('cartItems', JSON.stringify(validCartItems));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      if(itemsInCart.length !== validCartItems.length){
        setItemsInCart(validCartItems); 
      }
    }
  }, [itemsInCart, pageMounted]);

  const calculateTotalAmount = useCallback(() => {
    return itemsInCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [itemsInCart]);

  const changeItemQuantity = useCallback((itemId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity); 
    setItemsInCart(current =>
      current.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  const increaseQuantity = useCallback((itemId: string) => {
    setItemsInCart(current =>
      current.map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((itemId: string) => {
    setItemsInCart(current => {
      return current.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    });
  }, []);

  const deleteItemFromCart = useCallback((itemId: string) => {
    const itemToBeRemoved = itemsInCart.find(item => item.id === itemId);
    setItemsInCart(current => current.filter(item => item.id !== itemId));
    if (itemToBeRemoved) {
        showNotification({
            title: "Товар удален!",
            description: `${itemToBeRemoved.name} удален из корзины`,
            variant: "destructive"
        });
    }
  }, [itemsInCart, showNotification]);


  if (!pageMounted) {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Корзина</h1>
            <div className="text-center text-muted-foreground flex items-center justify-center">
                <Icons.loader className="mr-2 h-5 w-5 animate-spin" />
                 Загрузка корзины...
            </div>
            <div className="space-y-4 mt-6">
                {[...Array(2)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
                                <Skeleton className="w-20 h-20 rounded-md"/>
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-6 w-3/4"/>
                                    <Skeleton className="h-4 w-1/2"/>
                                    <Skeleton className="h-4 w-1/4"/>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-shrink-0">
                                <Skeleton className="h-8 w-24"/>
                                <Skeleton className="h-8 w-20"/>
                                <Skeleton className="h-8 w-8"/>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Корзина</h1>
      {itemsInCart.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">Ваша корзина пуста.</p>
            <Link href="/shop" passHref legacyBehavior={false}>
                <Button className="bg-[#535353ff] hover:bg-[#535353ff]/90">Перейти в магазин</Button>
            </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {itemsInCart.map((cartProduct) => (
              <Card key={cartProduct.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
                    <div className="relative w-20 h-20 flex-shrink-0">
                       <Image
                         key={cartProduct.imageUrl} 
                         src={cartProduct.imageUrl || 'https://placehold.co/100x100.png'}
                         alt={cartProduct.name}
                         fill
                         sizes="80px"
                         className="object-cover rounded-md border"
                         onError={(e) => {
                           const targetEl = e.target as HTMLImageElement;
                           targetEl.srcset = 'https://placehold.co/100x100.png';
                           targetEl.src = 'https://placehold.co/100x100.png';
                         }}
                         data-ai-hint={cartProduct.dataAiHint || `${cartProduct.category} ${cartProduct.brand} cart item`}
                       />
                    </div>
                    <div className="flex-grow">
                      <CardTitle className="text-lg mb-1 line-clamp-2">{cartProduct.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{cartProduct.brand}</p>
                      <p className="text-sm font-semibold">{formatPrice(cartProduct.price)} / шт.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto flex-shrink-0">
                     <div className="flex items-center border rounded-md">
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 rounded-r-none"
                         onClick={() => decreaseQuantity(cartProduct.id)}
                         disabled={cartProduct.quantity <= 1}
                         aria-label={`Уменьшить количество ${cartProduct.name}`}
                       >
                         <Minus className="h-4 w-4" />
                       </Button>
                       <Input
                         type="number"
                         className="h-8 w-12 text-center border-l border-r-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                         value={cartProduct.quantity}
                         onChange={(e) => changeItemQuantity(cartProduct.id, parseInt(e.target.value) || 1)}
                         min="1"
                         aria-label={`Количество ${cartProduct.name}`}
                       />
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 rounded-l-none border-l"
                         onClick={() => increaseQuantity(cartProduct.id)}
                         aria-label={`Увеличить количество ${cartProduct.name}`}
                       >
                         <Plus className="h-4 w-4" />
                       </Button>
                     </div>

                     <p className="text-lg font-semibold w-28 text-right">
                       {formatPrice(cartProduct.price * cartProduct.quantity)}
                     </p>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => deleteItemFromCart(cartProduct.id)}
                      aria-label={`Удалить ${cartProduct.name} из корзины`}
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
              Итого: {formatPrice(calculateTotalAmount())}
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

export default ShoppingCartPage;
