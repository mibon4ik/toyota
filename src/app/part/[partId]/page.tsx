
'use client';

import React, {useState, useEffect, useCallback} from 'react';
import { getAutoPartById } from "@/services/autoparts";
import type { AutoPart, Review } from '@/types/autopart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { RatingStars } from '@/components/ui/rating-stars';
import { ProductReviews } from './components/ProductReviews';
import type { StoredUser } from '@/types/user';
import { getCookie } from 'cookies-next';
import { Icons } from '@/components/icons';

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
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

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

     const userCookie = getCookie('loggedInUser');
     if (userCookie && typeof userCookie === 'string') {
       try {
         setCurrentUser(JSON.parse(userCookie));
       } catch (e) {
         setCurrentUser(null);
       }
     }
   }, []);

  const fetchPartDetails = useCallback(async () => {
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
  }, [currentPartId, showToastMsg, pageLoaded]);


  useEffect(() => {
    if(pageLoaded) {
         fetchPartDetails();
    }
  }, [pageLoaded, fetchPartDetails]); // fetchPartDetails is now stable

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

   const handleReviewAdded = () => {
    fetchPartDetails(); // Re-fetch part details to get updated reviews and rating
  };

   if (isLoadingPart || !pageLoaded) {
     return (
         <div className="container mx-auto py-8">
            <Card className="w-full max-w-2xl mx-auto">
                 <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                 <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                    <div>
                      <Skeleton className="rounded-md mb-4 h-64 w-full aspect-square" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-10 w-full mt-4" />
                       <Skeleton className="h-20 w-full mt-4" />
                    </div>
                 </CardContent>
             </Card>
             <div className="mt-8 max-w-2xl mx-auto">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-32 w-full" />
             </div>
        </div>
    );
   }

    if (!partDetails) {
        return <div className="container mx-auto py-8 text-center text-muted-foreground">Товар не найден.</div>;
    }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl lg:text-3xl font-bold">{partDetails.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {partDetails.brand} {partDetails.sku ? `(Артикул: ${partDetails.sku})` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 items-start">
          <div className="relative w-full aspect-square">
            <Image
              key={partDetails.imageUrl}
              src={partDetails.imageUrl || 'https://placehold.co/600x600.png'}
              alt={partDetails.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain rounded-md border"
              priority
              onError={(e) => {
                const targetImageElement = e.target as HTMLImageElement;
                targetImageElement.srcset = 'https://placehold.co/600x600.png';
                targetImageElement.src = 'https://placehold.co/600x600.png';
              }}
              data-ai-hint={partDetails.dataAiHint || `${partDetails.category} ${partDetails.brand} part detail`}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RatingStars rating={partDetails.rating || 0} size={20} />
              {partDetails.reviewCount && partDetails.reviewCount > 0 ? (
                <span className="text-sm text-muted-foreground">({partDetails.reviewCount} {partDetails.reviewCount === 1 ? "отзыв" : partDetails.reviewCount < 5 ? "отзыва" : "отзывов"})</span>
              ) : (
                <span className="text-sm text-muted-foreground">(Отзывов нет)</span>
              )}
            </div>
            <p className="text-2xl font-semibold text-primary">{formatPrice(partDetails.price)}</p>
            {partDetails.stock !== undefined && (
                <p className={`text-sm font-medium ${partDetails.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {partDetails.stock > 0 ? `В наличии: ${partDetails.stock} шт.` : 'Нет в наличии'}
                </p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">{partDetails.description}</p>
            {partDetails.compatibleVehicles && partDetails.compatibleVehicles.length > 0 && (
                <div className="pt-2">
                <h4 className="text-xs font-semibold mb-1 uppercase text-muted-foreground">Совместимость:</h4>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                    {partDetails.compatibleVehicles.map((vehicle, index) => (
                    <li key={index}>{vehicle}</li>
                    ))}
                </ul>
                </div>
            )}
            <div className="pt-2">
              <Button onClick={addProductToCart} className="w-full bg-[#535353ff] hover:bg-[#535353ff]/90 text-lg py-3" disabled={(partDetails.stock !== undefined && partDetails.stock <= 0) || isLoadingPart}>
                {isLoadingPart ? <Icons.loader className="mr-2 h-5 w-5 animate-spin" /> : null}
                {(partDetails.stock !== undefined && partDetails.stock <= 0) ? 'Нет в наличии' : 'В корзину'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="max-w-2xl mx-auto mt-8">
        <ProductReviews partDetails={partDetails} currentUser={currentUser} onReviewAdded={handleReviewAdded}/>
      </div>
    </div>
  );
};

export default PartDetailsPage;
