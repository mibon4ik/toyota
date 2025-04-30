
'use client';

import React, {useState, useEffect, useCallback, Suspense} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icons } from "@/components/icons";
import {cn} from "@/lib/utils";
import Autopart from "@/app/components/autopart"; // Corrected component path
import Link from "next/link";
// Removed unused imports for getPartsByVin, getPartsByMakeModel
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";
import type { AutoPart } from '@/types/autopart';
import Image from 'next/image'; // Import next/image
import dynamic from 'next/dynamic'; // Import next/dynamic

// Dynamically import sections that are further down the page
const PopularCategories = dynamic(() => import('./page/components/PopularCategories').then(mod => mod.PopularCategories), { ssr: false });
const HitsOfSales = dynamic(() => import('./page/components/HitsOfSales').then(mod => mod.HitsOfSales), { ssr: false });
const NewArrivals = dynamic(() => import('./page/components/NewArrivals').then(mod => mod.NewArrivals), { ssr: false });
const StoreBenefits = dynamic(() => import('./page/components/StoreBenefits').then(mod => mod.StoreBenefits), { ssr: false });
const MiniBlog = dynamic(() => import('./page/components/MiniBlog').then(mod => mod.MiniBlog), { ssr: false });
// Corrected import path for CompatibilityChecker
const CompatibilityChecker = dynamic(() => import('./page/components/CompatibilityChecker').then(mod => mod.CompatibilityChecker), { ssr: false });


const banners = [
  {
    id: 'banner-1',
    title: 'Летняя распродажа - скидки до 50%',
    imageUrl: 'https://picsum.photos/seed/summersale/1200/400',
    buttonText: 'Купить сейчас',
    href: '/shop?sale=true',
  },
  {
    id: 'banner-2',
    title: 'Новые поступления - ознакомьтесь с последними деталями',
     imageUrl: 'https://picsum.photos/seed/newarrivals/1200/400',
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

    let toastTitle = "";
    let toastDescription = "";

    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      let updatedCart;

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

        // Moved toast display outside of setCartItems update to prevent potential infinite loop issues
        // Use setTimeout to ensure state update likely finishes before showing toast
        setTimeout(() => {
          toast({ title: toastTitle, description: toastDescription });
        }, 0);

      return updatedCart;
    });

  }, [toast, isMounted]); // Removed setCartItems from dependencies as it's stable

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
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        width={1200}
                        height={400}
                        className="rounded-md w-full h-auto object-cover mb-4"
                        priority={index === 0}
                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/1200/400')}
                         />
                      <Button asChild className="bg-[#535353ff] hover:bg-[#535353ff]/90 mt-4">
                        <Link href={banner.href ?? '#'}>{banner.buttonText}</Link>
                      </Button>
                    </CardContent>
                  </Card>
            ))}
        </div>

      {/* Compatibility Checker */}
      <Suspense fallback={<div className="text-center p-8">Загрузка проверки совместимости...</div>}>
        <CompatibilityChecker onAddToCart={handleAddToCart} />
      </Suspense>

      {/* Popular Categories */}
      <Suspense fallback={<div className="text-center p-8">Загрузка категорий...</div>}>
        <PopularCategories />
      </Suspense>

      {/* Hits of Sales */}
      <Suspense fallback={<div className="text-center p-8">Загрузка хитов продаж...</div>}>
         <HitsOfSales onAddToCart={handleAddToCart} />
      </Suspense>

      {/* New Arrivals */}
      <Suspense fallback={<div className="text-center p-8">Загрузка новинок...</div>}>
        <NewArrivals onAddToCart={handleAddToCart} />
      </Suspense>

      {/* Store Benefits */}
       <Suspense fallback={<div className="text-center p-8">Загрузка преимуществ...</div>}>
         <StoreBenefits />
       </Suspense>

      {/* Mini Blog */}
       <Suspense fallback={<div className="text-center p-8">Загрузка блога...</div>}>
         <MiniBlog />
       </Suspense>
     </div>
    );
  };

  export default HomePage;
