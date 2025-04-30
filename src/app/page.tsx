'use client';

import React, {useState, useEffect, useCallback, Suspense} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icons } from "@/components/icons";
import {cn} from "@/lib/utils";
import Autopart from "@/app/components/autopart";
import Link from "next/link";
import {useToast} from "@/hooks/use-toast";
import type { AutoPart } from '@/types/autopart';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Dynamically import sections that are further down the page
const PopularCategories = dynamic(() => import('./page/components/PopularCategories').then(mod => mod.PopularCategories), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />, // Added skeleton loader
});
const HitsOfSales = dynamic(() => import('./page/components/HitsOfSales').then(mod => mod.HitsOfSales), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />, // Added skeleton loader
 });
const NewArrivals = dynamic(() => import('./page/components/NewArrivals').then(mod => mod.NewArrivals), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />, // Added skeleton loader
});
const StoreBenefits = dynamic(() => import('./page/components/StoreBenefits').then(mod => mod.StoreBenefits), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />, // Added skeleton loader
});
const MiniBlog = dynamic(() => import('./page/components/MiniBlog').then(mod => mod.MiniBlog), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />, // Added skeleton loader
});
const CompatibilityChecker = dynamic(() => import('./page/components/CompatibilityChecker').then(mod => mod.CompatibilityChecker), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />, // Added skeleton loader
});


const banners = [
  {
    id: 'banner-1',
    title: 'Летняя распродажа - скидки до 50%',
    imageUrl: 'https://picsum.photos/seed/summersale/1200/400', // Keep placeholder
    buttonText: 'Купить сейчас',
    href: '/shop?sale=true',
  },
  {
    id: 'banner-2',
    title: 'Новые поступления - ознакомьтесь с последними деталями',
     imageUrl: 'https://picsum.photos/seed/newarrivals/1200/400', // Keep placeholder
    buttonText: 'Посмотреть новинки',
    href: '/shop?sort=newest',
  },
];

interface CartItem extends AutoPart {
  quantity: number;
}

const HomePage = () => {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from local storage only on the client side
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

  // Update local storage when cart changes
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

      // Defer toast call slightly to ensure state update completes
       setTimeout(() => {
            toast({ title: toastTitle, description: toastDescription });
       }, 0);

      return updatedCart;
    });

  }, [toast, isMounted]); // Removed setCartItems from dependencies


  return (
    <div className="fade-in space-y-12">
      {/* Banner Carousel */}
        <div className="space-y-4">
            {banners.map((banner, index) => (
                <Card key={banner.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-xl">{banner.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start p-4 pt-0">
                      <div className="relative w-full aspect-[3/1] mb-4"> {/* Set aspect ratio */}
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill // Use fill layout
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Provide sizes attribute
                          className="rounded-md object-cover"
                          priority={index === 0} // Add priority to the first banner image
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/1200/400')} // Fallback
                        />
                      </div>
                      <Button asChild className="bg-[#535353ff] hover:bg-[#535353ff]/90 mt-4">
                        <Link href={banner.href ?? '#'}>{banner.buttonText}</Link>
                      </Button>
                    </CardContent>
                  </Card>
            ))}
        </div>

      {/* Compatibility Checker */}
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <CompatibilityChecker onAddToCart={handleAddToCart} />
      </Suspense>

      {/* Popular Categories */}
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <PopularCategories />
      </Suspense>

      {/* Hits of Sales */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
         <HitsOfSales onAddToCart={handleAddToCart} />
      </Suspense>

      {/* New Arrivals */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <NewArrivals onAddToCart={handleAddToCart} />
      </Suspense>

      {/* Store Benefits */}
       <Suspense fallback={<Skeleton className="h-48 w-full" />}>
         <StoreBenefits />
       </Suspense>

      {/* Mini Blog */}
       <Suspense fallback={<Skeleton className="h-64 w-full" />}>
         <MiniBlog />
       </Suspense>
     </div>
    );
  };

  export default HomePage;
