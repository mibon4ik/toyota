'use client';

import React, {useState, useEffect, useCallback} from 'react';
import { getAutoPartById} from "@/services/autoparts";
import type { AutoPart } from '@/types/autopart';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface CartItemType extends AutoPart {
  quantity: number;
}

const PartDetailsPage = () => {
  const [partDetails, setPartDetails] = useState<AutoPart | null>(null);
  const [isLoadingPart, setIsLoadingPart] = useState(true);
  const routeParams = useParams();
  const currentPartId = typeof routeParams?.partId === 'string' ? routeParams.partId : undefined;
  const { toast: showToastMsg } = useToast();
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentCart, setCurrentCart] = useState<CartItemType[]>([]);

   useEffect(() => {
     setPageLoaded(true);
     const cartData = localStorage.getItem('cartItems');
     if (cartData) {
       try {
         const parsedCartData: CartItemType[] = JSON.parse(cartData);
          if (Array.isArray(parsedCartData) && parsedCartData.every(item =>
              item &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.price === 'number' &&
              typeof item.quantity === 'number' &&
              typeof item.imageUrl === 'string'
          )) {
            setCurrentCart(parsedCartData);
          } else {
            localStorage.removeItem('cartItems');
             setCurrentCart([]);
          }
       } catch (e) {
         localStorage.removeItem('cartItems');
         setCurrentCart([]);
       }
     } else {
          setCurrentCart([]);
     }
   }, []);


  useEffect(() => {
    const loadPartInfo = async () => {
      if (currentPartId && pageLoaded) {
        setIsLoadingPart(true);
        try {
             const fetchedPart = await getAutoPartById(currentPartId);
            setPartDetails(fetchedPart);
         } catch (error) {
             showToastMsg({
                 title: "Ошибка",
                 description: "Не удалось загрузить детали товара.",
                 variant: "destructive",
             });
         } finally {
            setIsLoadingPart(false);
         }
      } else if (!currentPartId && pageLoaded) {
         setIsLoadingPart(false);
          showToastMsg({
               title: "Ошибка",
               description: "ID товара не найден.",
               variant: "destructive",
           });
      }
    };

    if(pageLoaded) {
         loadPartInfo();
    }

  }, [currentPartId, showToastMsg, pageLoaded]);

   useEffect(() => {
     if (pageLoaded) {
       localStorage.setItem('cartItems', JSON.stringify(currentCart));
       window.dispatchEvent(new CustomEvent('cartUpdated'));
     }
   }, [currentCart, pageLoaded]);


   const addProductToCart = useCallback(() => {
     if (!partDetails || !pageLoaded) return;
     
     setCurrentCart(prevCart => {
       const existingItemIdx = prevCart.findIndex(item => item.id === partDetails.id);
       let newCartState;
       let toastTitle = "";
       let toastDesc = "";

       if (existingItemIdx > -1) {
         newCartState = prevCart.map((item, index) =>
           index === existingItemIdx ? { ...item, quantity: (item.quantity || 1) + 1 } : item
         );
         toastTitle = "Количество обновлено!";
         toastDesc = `Количество ${partDetails.name} в корзине увеличено.`;
       } else {
         newCartState = [...prevCart, { ...partDetails, quantity: 1 }];
         toastTitle = "Добавлено в корзину!";
         toastDesc = `${partDetails.name} был добавлен в вашу корзину.`;
       }
        
       showToastMsg({ title: toastTitle, description: toastDesc });
       return newCartState;
     });
   }, [partDetails, showToastMsg, pageLoaded]);


   if (isLoadingPart || !pageLoaded) {
     return (
         <div className="container mx-auto py-8">
            <Card className="w-full max-w-lg mx-auto">
                 <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                 <CardContent className="flex flex-col items-center">
                    <Skeleton className="rounded-md mb-4 h-64 w-full" />
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                     <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-1/2 mt-4" />
                 </CardContent>
             </Card>
        </div>
    );
   }


    if (!partDetails) {
        return <div className="container mx-auto py-8 text-center text-muted-foreground">Товар не найден.</div>;
    }


  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{partDetails.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{partDetails.brand} {partDetails.sku ? `(Арт: ${partDetails.sku})` : ''}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-full h-64 mb-4">
            <Image
              key={partDetails.imageUrl}
              src={partDetails.imageUrl || 'https://placehold.co/600x400.png'}
              alt={partDetails.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain rounded-md"
              priority
              onError={(e) => {
                const targetImageElement = e.target as HTMLImageElement;
                targetImageElement.srcset = 'https://placehold.co/600x400.png';
                targetImageElement.src = 'https://placehold.co/600x400.png';
              }}
              data-ai-hint={partDetails.dataAiHint || `${partDetails.category} ${partDetails.brand} part detail`}
            />
          </div>
           <p className="text-lg font-semibold mb-2">{formatPrice(partDetails.price)}</p>
            {partDetails.stock !== undefined && (
                <p className={`text-sm mb-2 ${partDetails.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {partDetails.stock > 0 ? `В наличии: ${partDetails.stock} шт.` : 'Нет в наличии'}
                </p>
            )}
          <p className="text-md text-muted-foreground text-center mb-4">{partDetails.description}</p>
           {partDetails.compatibleVehicles && partDetails.compatibleVehicles.length > 0 && (
                <div className="mt-4 w-full text-left">
                <h4 className="text-md font-semibold mb-1">Совместимость:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {partDetails.compatibleVehicles.map((vehicle, index) => (
                    <li key={index}>{vehicle}</li>
                    ))}
                </ul>
                </div>
            )}
          <div className="mt-6 w-full">
            <Button onClick={addProductToCart} className="w-full bg-[#535353ff] hover:bg-[#535353ff]/90" disabled={partDetails.stock !== undefined && partDetails.stock <= 0}>
             {partDetails.stock !== undefined && partDetails.stock <= 0 ? 'Нет в наличии' : 'В корзину'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartDetailsPage;
