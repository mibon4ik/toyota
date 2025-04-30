
'use client';

import React, {useState, useEffect, useCallback} from 'react';
import { getAutoPartById} from "@/services/autoparts";
import type { AutoPart } from '@/types/autopart';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface CartItem extends AutoPart {
  quantity: number;
}

const PartDetailPage = () => {
  const [part, setPart] = useState<AutoPart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams<{ partId: string }>();
  const partId = params?.partId;
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);


   const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
       try {
         return storedCart ? JSON.parse(storedCart) : [];
       } catch (e) {
         console.error("Error parsing cart from localStorage on init:", e);
         localStorage.removeItem('cartItems');
         return [];
       }
    }
    return [];
  });



  useEffect(() => {
    setIsMounted(true);
    const fetchPart = async () => {
      if (partId) {
        setIsLoading(true);
        try {
             const partData = await getAutoPartById(partId);
            setPart(partData);
         } catch (error) {
            console.error("Failed to fetch part details:", error);
             toast({
                 title: "Ошибка",
                 description: "Не удалось загрузить детали товара.",
                 variant: "destructive",
             });
         } finally {
            setIsLoading(false);
         }
      } else {
         setIsLoading(false);

      }
    };

    fetchPart();
  }, [partId, toast]);


   useEffect(() => {
     if (isMounted) {
       localStorage.setItem('cartItems', JSON.stringify(cartItems));

       window.dispatchEvent(new CustomEvent('cartUpdated'));
     }
   }, [cartItems, isMounted]);



   const handleAddToCart = useCallback(() => {
     if (!part) return;

     setCartItems(currentItems => {
       const existingItemIndex = currentItems.findIndex(item => item.id === part.id);
       let updatedCart;

       if (existingItemIndex > -1) {
         updatedCart = currentItems.map((item, index) =>
           index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
         );
         toast({
             title: "Количество обновлено!",
             description: `Количество ${part.name} в корзине увеличено.`,
         });
       } else {
         updatedCart = [...currentItems, { ...part, quantity: 1 }];
          toast({
              title: "Добавлено в корзину!",
              description: `${part.name} был добавлен в вашу корзину.`,
          });
       }
        return updatedCart;
     });


   }, [part, toast, setCartItems]);


    const formatPrice = useCallback((price: number): string => {

      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);


   if (isLoading) {
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


    if (!part) {
        return <div className="container mx-auto py-8 text-center text-muted-foreground">Товар не найден.</div>;
    }


  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{part.name}</CardTitle>
          <CardDescription>{part.brand} {part.sku ? `(Арт: ${part.sku})` : ''}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <img
            src={part.imageUrl || 'https://picsum.photos/600/400'}
            alt={part.name}
            className="object-cover rounded-md mb-4 h-64 w-full"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/600/400')}
          />
           <p className="text-lg font-semibold mb-2">{formatPrice(part.price)}</p>
            {part.stock !== undefined && (
                <p className={`text-sm mb-2 ${part.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {part.stock > 0 ? `В наличии: ${part.stock} шт.` : 'Нет в наличии'}
                </p>
            )}
          <p className="text-md text-muted-foreground text-center mb-4">{part.description}</p>
           {part.compatibleVehicles && part.compatibleVehicles.length > 0 && (
                <div className="mt-4 w-full text-left">
                <h4 className="text-md font-semibold mb-1">Совместимость:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {part.compatibleVehicles.map((vehicle, index) => (
                    <li key={index}>{vehicle}</li>
                    ))}
                </ul>
                </div>
            )}
          <div className="mt-6 w-full">
            <Button onClick={handleAddToCart} className="w-full" disabled={part.stock !== undefined && part.stock <= 0}>
             {part.stock !== undefined && part.stock <= 0 ? 'Нет в наличии' : 'В корзину'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartDetailPage;
