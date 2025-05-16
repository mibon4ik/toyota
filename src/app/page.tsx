
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { AutoPart as ProductInfo } from '@/types/autopart';
import type { Banner as BannerType } from '@/types/banner'; 
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { getActiveBanners } from '@/services/banners'; 

const PopularCategoriesComponent = dynamic(() => import('./page/components/PopularCategories').then(mod => mod.PopularCategories), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
});
const FeaturedProductsComponent = dynamic(() => import('./page/components/HitsOfSales').then(mod => mod.HitsOfSales), {
  ssr: false,
   loading: () => <Skeleton className="h-96 w-full" />,
});
const LatestArrivalsComponent = dynamic(() => import('./page/components/NewArrivals').then(mod => mod.NewArrivals), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});
const StoreAdvantagesComponent = dynamic(() => import('./page/components/StoreBenefits').then(mod => mod.StoreBenefits), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});
const BlogPreviewComponent = dynamic(() => import('./page/components/MiniBlog').then(mod => mod.MiniBlog), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});
const PartFinderComponent = dynamic(() => import('./page/components/CompatibilityChecker').then(mod => mod.CompatibilityChecker), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});

interface CartItem extends ProductInfo {
  quantity: number;
}

const MainPage = () => {
  const { toast: showToast } = useToast();
  const [clientReady, setClientReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentBanners, setCurrentBanners] = useState<BannerType[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  useEffect(() => {
    setClientReady(true);
    const cartData = localStorage.getItem('cartItems');
    if (cartData) {
      try {
        const items: CartItem[] = JSON.parse(cartData);
        if (Array.isArray(items) && items.every(item =>
            item && typeof item.id === 'string' && typeof item.name === 'string' &&
            typeof item.price === 'number' && typeof item.quantity === 'number' && typeof item.imageUrl === 'string'
        )) {
          setCart(items);
        } else {
           localStorage.removeItem('cartItems');
           setCart([]);
        }
      } catch (e) {
        localStorage.removeItem('cartItems');
         setCart([]);
      }
    } else {
        setCart([]);
    }

    const loadBanners = async () => {
      setBannersLoading(true);
      try {
        const activeBanners = await getActiveBanners();
        setCurrentBanners(activeBanners);
      } catch (error) {
        showToast({
          title: "Ошибка загрузки баннеров",
          description: "Не удалось загрузить баннеры. Попробуйте обновить страницу.",
          variant: "destructive"
        });
      } finally {
        setBannersLoading(false);
      }
    };
    loadBanners();

  }, [showToast]);

  useEffect(() => {
    if (clientReady) {
      localStorage.setItem('cartItems', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [cart, clientReady]);

  const addProductToCart = useCallback((product: ProductInfo) => {
    if (!clientReady) return;
    
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      let newCart;
      let toastTitle = "";
      let toastMessage = "";

      if (existingItem) {
        newCart = currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
        toastTitle = "Количество обновлено!";
        toastMessage = `Количество ${product.name} в корзине увеличено.`;
      } else {
        newCart = [...currentCart, { ...product, quantity: 1 }];
        toastTitle = "Товар добавлен в корзину!";
        toastMessage = `${product.name} был добавлен в вашу корзину.`;
      }
      
      showToast({ title: toastTitle, description: toastMessage });
      return newCart;
    });

  }, [showToast, clientReady]);


  if (!clientReady) {
     return (
        <div className="space-y-12 container mx-auto">
             <div className="space-y-4">
                {[...Array(2)].map((_, idx) => (
                    <Card key={idx} className="overflow-hidden">
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
            {bannersLoading ? (
              [...Array(2)].map((_, idx) => (
                <Card key={`banner-skeleton-${idx}`} className="overflow-hidden">
                    <CardHeader className="p-4"><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent className="flex flex-col items-start p-4 pt-0">
                       <Skeleton className="w-full aspect-[3/1] mb-4 rounded-md" />
                       <Skeleton className="h-10 w-32 mt-4 rounded-md" />
                    </CardContent>
                </Card>
              ))
            ) : currentBanners.length > 0 ? (
                currentBanners.map((banner, idx) => (
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
                              priority={idx === 0} 
                              onError={(e) => (e.currentTarget.src = 'https://placehold.co/1200x400.png')}
                              data-ai-hint={banner.dataAiHint || banner.imageHint}
                            />
                          </div>
                          <Button asChild className="bg-[#535353ff] hover:bg-[#535353ff]/90 mt-4">
                            <Link href={banner.link ?? '#'}>{banner.buttonText}</Link>
                          </Button>
                        </CardContent>
                      </Card>
                ))
            ) : (
              <Card className="overflow-hidden">
                <CardHeader className="p-4"><CardTitle className="text-xl">Добро пожаловать!</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                  <p>Посмотрите наши предложения в магазине.</p>
                  <Button asChild className="bg-[#535353ff] hover:bg-[#535353ff]/90 mt-4">
                    <Link href="/shop">В магазин</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>

       <Suspense fallback={<Skeleton className="h-80 w-full" />}>
         <PartFinderComponent onAddToCart={addProductToCart} />
       </Suspense>

       <Suspense fallback={<Skeleton className="h-40 w-full" />}>
         <PopularCategoriesComponent />
       </Suspense>

       <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <FeaturedProductsComponent onAddToCart={addProductToCart} />
       </Suspense>

       <Suspense fallback={<Skeleton className="h-96 w-full" />}>
         <LatestArrivalsComponent onAddToCart={addProductToCart} />
       </Suspense>

        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <StoreAdvantagesComponent />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <BlogPreviewComponent />
        </Suspense>
     </div>
    );
  };

  export default MainPage;
