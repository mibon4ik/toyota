
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { AutoPart } from '@/types/autopart';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PopularCategories = dynamic(() => import('./page/components/PopularCategories').then(mod => mod.PopularCategories), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
});
const HitsOfSales = dynamic(() => import('./page/components/HitsOfSales').then(mod => mod.HitsOfSales), {
  ssr: false,
   loading: () => <Skeleton className="h-96 w-full" />,
});
const NewArrivals = dynamic(() => import('./page/components/NewArrivals').then(mod => mod.NewArrivals), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});
const StoreBenefits = dynamic(() => import('./page/components/StoreBenefits').then(mod => mod.StoreBenefits), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});
const MiniBlog = dynamic(() => import('./page/components/MiniBlog').then(mod => mod.MiniBlog), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});
const CompatibilityChecker = dynamic(() => import('./page/components/CompatibilityChecker').then(mod => mod.CompatibilityChecker), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});


const mainBanners = [
  {
    id: 'banner-1',
    title: 'Летняя распродажа - скидки до 50%',
    imageUrl: 'https://placehold.co/1200x400.png',
    buttonText: 'Купить сейчас',
    link: '/shop?sale=true',
    imageHint: "car parts summer sale"
  },
  {
    id: 'banner-2',
    title: 'Новые поступления - ознакомьтесь с последними деталями',
     imageUrl: 'https://placehold.co/1200x400.png',
    buttonText: 'Посмотреть новинки',
    link: '/shop?sort=newest',
    imageHint: "new car parts arrivals"
  },
];

interface CartProduct extends AutoPart {
  quantity: number;
}

const HomePage = () => {
  const { toast: displayToast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [shoppingCart, setShoppingCart] = useState<CartProduct[]>([]);

  useEffect(() => {
    setIsClient(true);
    const storedCartData = localStorage.getItem('cartItems');
    if (storedCartData) {
      try {
        const parsedCartData: CartProduct[] = JSON.parse(storedCartData);
        if (Array.isArray(parsedCartData) && parsedCartData.every(item =>
            item &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            typeof item.imageUrl === 'string'
        )) {
          setShoppingCart(parsedCartData);
        } else {
           console.warn("Invalid cart data found in localStorage (HomePage). Clearing cart.");
           localStorage.removeItem('cartItems');
           setShoppingCart([]);
        }
      } catch (e) {
        console.error("Error parsing cart from localStorage (HomePage):", e);
        localStorage.removeItem('cartItems');
         setShoppingCart([]);
      }
    } else {
        setShoppingCart([]);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cartItems', JSON.stringify(shoppingCart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [shoppingCart, isClient]);

  const addItemToCart = useCallback((productToAdd: AutoPart) => {
    if (!isClient) return;
    
    setShoppingCart(currentCart => {
      const existingItemIndex = currentCart.findIndex(item => item.id === productToAdd.id);
      let updatedCartItems;
      let toastTitleText = "";
      let toastDescriptionText = "";

      if (existingItemIndex > -1) {
        updatedCartItems = currentCart.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
        toastTitleText = "Количество обновлено!";
        toastDescriptionText = `Количество ${productToAdd.name} в корзине увеличено.`;
      } else {
        updatedCartItems = [...currentCart, { ...productToAdd, quantity: 1 }];
        toastTitleText = "Товар добавлен в корзину!";
        toastDescriptionText = `${productToAdd.name} был добавлен в вашу корзину.`;
      }
      
      // This timeout is a common student trick to ensure toast is called after state update is processed
       setTimeout(() => {
           displayToast({ title: toastTitleText, description: toastDescriptionText });
       }, 0);

      return updatedCartItems;
    });

  }, [displayToast, isClient]);


  if (!isClient) {
     return (
        <div className="space-y-12 container mx-auto">
             <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-4"><Skeleton className="h-6 w-3/4" /></CardHeader>
                        <CardContent className="flex flex-col items-start p-4 pt-0">
                           <Skeleton className="w-full aspect-[3/1] mb-4 rounded-md" />
                           <Skeleton className="h-10 w-32 mt-4 rounded-md" />
                        </CardContent>
                    </Card>
                ))}
             </div>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
     );
  }

  return (
    <div className="fade-in space-y-12">
        <div className="space-y-4">
            {mainBanners.map((bannerItem, idx) => (
                <Card key={bannerItem.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-xl">{bannerItem.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start p-4 pt-0">
                      <div className="relative w-full aspect-[3/1] mb-4">
                        <Image
                          src={bannerItem.imageUrl}
                          alt={bannerItem.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="rounded-md object-cover"
                          priority={idx === 0}
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/1200x400.png')}
                          data-ai-hint={bannerItem.imageHint}
                        />
                      </div>
                      <Button asChild className="bg-[#535353ff] hover:bg-[#535353ff]/90 mt-4">
                        <Link href={bannerItem.link ?? '#'}>{bannerItem.buttonText}</Link>
                      </Button>
                    </CardContent>
                  </Card>
            ))}
        </div>

       <Suspense fallback={<Skeleton className="h-80 w-full" />}>
         <CompatibilityChecker onAddToCart={addItemToCart} />
       </Suspense>

       <Suspense fallback={<Skeleton className="h-40 w-full" />}>
         <PopularCategories />
       </Suspense>

       <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <HitsOfSales onAddToCart={addItemToCart} />
       </Suspense>

       <Suspense fallback={<Skeleton className="h-96 w-full" />}>
         <NewArrivals onAddToCart={addItemToCart} />
       </Suspense>

        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <StoreBenefits />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <MiniBlog />
        </Suspense>
     </div>
    );
  };

  export default HomePage;
