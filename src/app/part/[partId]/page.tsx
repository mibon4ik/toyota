
'use client';

import React, {useState, useEffect, useCallback} from 'react';
import { getAutoPartById} from "@/services/autoparts";
import type { AutoPart } from '@/types/autopart';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image'; // Import next/image
import { formatPrice } from '@/lib/utils'; // Import formatPrice

interface CartItem extends AutoPart {
  quantity: number;
}

const PartDetailPage = () => {
  const [part, setPart] = useState<AutoPart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const partId = typeof params?.partId === 'string' ? params.partId : undefined;
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

   useEffect(() => {
     setIsMounted(true);
     const storedCart = localStorage.getItem('cartItems');
     if (storedCart) {
       try {
         const parsedCart: CartItem[] = JSON.parse(storedCart);
         // Enhanced validation
          if (Array.isArray(parsedCart) && parsedCart.every(item =>
              item && // Check if item is not null/undefined
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.price === 'number' &&
              typeof item.quantity === 'number' &&
              typeof item.imageUrl === 'string' // Ensure imageUrl exists and is a string
          )) {
            setCartItems(parsedCart);
          } else {
            console.warn("Invalid cart data found in localStorage (PartDetail). Clearing cart.");
            localStorage.removeItem('cartItems');
             setCartItems([]); // Clear state too
          }
       } catch (e) {
         console.error("Error parsing cart from localStorage on init (PartDetail):", e);
         localStorage.removeItem('cartItems');
         setCartItems([]); // Clear state too
       }
     } else {
          setCartItems([]);
     }
   }, []);


  useEffect(() => {
    const fetchPart = async () => {
      if (partId && isMounted) { // Check isMounted before fetching
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
      } else if (!partId && isMounted) { // Handle case where partId is missing
         setIsLoading(false);
         console.warn("Part ID not found in URL parameters.");
          toast({
               title: "Ошибка",
               description: "ID товара не найден.",
               variant: "destructive",
           });
      }
    };

    if(isMounted) {
         fetchPart(); // Fetch data when partId or isMounted changes
    }

  }, [partId, toast, isMounted]);

   useEffect(() => {
     if (isMounted) {
       localStorage.setItem('cartItems', JSON.stringify(cartItems));
       window.dispatchEvent(new CustomEvent('cartUpdated'));
     }
   }, [cartItems, isMounted]);


   const handleAddToCart = useCallback(() => {
     if (!part || !isMounted) return;
     console.log("Adding to cart (PartDetail):", part.name, "with ImageUrl:", part.imageUrl);

     setCartItems(currentItems => {
       const existingItemIndex = currentItems.findIndex(item => item.id === part.id);
       let updatedCart;
       let toastTitle = "";
       let toastDescription = "";

       if (existingItemIndex > -1) {
         updatedCart = currentItems.map((item, index) =>
           index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
         );
         toastTitle = "Количество обновлено!";
         toastDescription = `Количество ${part.name} в корзине увеличено.`;
       } else {
         // Ensure the full 'part' object (including imageUrl) is added
         updatedCart = [...currentItems, { ...part, quantity: 1 }];
         toastTitle = "Добавлено в корзину!";
         toastDescription = `${part.name} был добавлен в вашу корзину.`;
       }
        console.log("Updated cart state (PartDetail, pending):", updatedCart);

        // Defer toast to avoid calling during render
        setTimeout(() => {
             toast({ title: toastTitle, description: toastDescription });
             console.log("Toast displayed for:", part.name);
        }, 0);

        return updatedCart;
     });
   }, [part, toast, isMounted]);


   if (isLoading || !isMounted) { // Show loading state until mounted and data is loaded
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
          <div className="relative w-full h-64 mb-4">
             {/* Use next/image */}
            <Image
              key={part.imageUrl} // Add key
              src={part.imageUrl || 'https://picsum.photos/600/400'} // Provide placeholder
              alt={part.name}
              fill // Use fill layout
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Provide sizes
              className="object-contain rounded-md" // Use object-contain for potentially different aspect ratios
              priority // Prioritize image on detail page
              onError={(e) => {
                 console.error(`Error loading image for ${part.name}: ${part.imageUrl}`);
                const target = e.target as HTMLImageElement;
                target.srcset = 'https://picsum.photos/600/400';
                target.src = 'https://picsum.photos/600/400';
              }}
              data-ai-hint={part.dataAiHint || `${part.category} ${part.brand} part detail`} // Add hint
            />
          </div>
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
             {/* Add to Cart Button */}
            <Button onClick={handleAddToCart} className="w-full bg-[#535353ff] hover:bg-[#535353ff]/90" disabled={part.stock !== undefined && part.stock <= 0}>
             {part.stock !== undefined && part.stock <= 0 ? 'Нет в наличии' : 'В корзину'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartDetailPage;
