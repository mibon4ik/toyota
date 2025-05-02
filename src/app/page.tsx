'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import Autopart from "@/app/components/autopart";
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


const banners = [
  {
    id: 'banner-1',
    title: 'Летняя распродажа - скидки до 50%',
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    buttonText: 'Купить сейчас',
    href: '/shop?sale=true',
    dataAiHint: "car parts summer sale"
  },
  {
    id: 'banner-2',
    title: 'Новые поступления - ознакомьтесь с последними деталями',
     imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    buttonText: 'Посмотреть новинки',
    href: '/shop?sort=newest',
    dataAiHint: "new car parts arrivals"
  },
];

interface CartItem extends AutoPart {
  quantity: number;
}

const HomePage = () => {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [cartItems, isMounted]);

  const handleAddToCart = useCallback((product: AutoPart) => {
    if (!isMounted) return;

    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      let updatedCart;
      let toastTitle = "";
      let toastDescription = "";

      if (existingItemIndex > -1) {
        updatedCart = currentItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
        toastTitle = "Количество обновлено!";
        toastDescription = `Количество ${product.name} в корзине увеличено.`;
      } else {
        updatedCart = [...currentItems, { ...product, quantity: 1 }];
        toastTitle = "Товар добавлен в корзину!";
        toastDescription = `${product.name} был добавлен в вашу корзину.`;
      }

      // Use setTimeout to defer the toast call outside of the render cycle
      setTimeout(() => {
        toast({ title: toastTitle, description: toastDescription });
      }, 0);

      return updatedCart;
    });

  }, [toast, isMounted]);


  return (
    <div className="fade-in space-y-12">
        <div className="space-y-4">
            {banners.map((banner, index) => (
                <Card key={banner.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-xl">{banner.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start p-4 pt-0">
                      <div className="relative w-full aspect-[3/1] mb-4">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="rounded-md object-cover"
                          priority={index === 0}
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/1200/400')}
                          data-ai-hint={banner.dataAiHint}
                        />
                      </div>
                      <Button asChild className="bg-[#535353ff] hover:bg-[#535353ff]/90 mt-4">
                        <Link href={banner.href ?? '#'}>{banner.buttonText}</Link>
                      </Button>
                    </CardContent>
                  </Card>
            ))}
        </div>

      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <CompatibilityChecker onAddToCart={handleAddToCart} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <PopularCategories />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
         <HitsOfSales onAddToCart={handleAddToCart} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <NewArrivals onAddToCart={handleAddToCart} />
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


