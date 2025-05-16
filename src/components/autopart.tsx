
'use client';
import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AutoPart} from "@/types/autopart";
import {useToast} from "@/hooks/use-toast";
import {useState, useEffect} from "react";
import Link from "next/link";

interface PartCardProps {
  productInfo: AutoPart;
}

const AutopartComponent: React.FC<PartCardProps> = ({ productInfo }) => {
  const { toast: showToast } = useToast();
  const [basketItems, setBasketItems] = useState<AutoPart[]>(() => {

    if (typeof window !== 'undefined') {
      const savedBasket = localStorage.getItem('cartItems');
      return savedBasket ? JSON.parse(savedBasket) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(basketItems));
    }
  }, [basketItems]);

  const addItemToBasket = () => {
    const itemInBasketIndex = basketItems.findIndex((item: AutoPart) => item.id === productInfo.id);

    let newBasketState;

    if (itemInBasketIndex > -1) {
      newBasketState = basketItems.map((item: AutoPart, index: number) =>
        index === itemInBasketIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      );
    } else {
      newBasketState = [...basketItems, { ...productInfo, quantity: 1 }];
    }

    setBasketItems(newBasketState);

    showToast({
      title: "Товар добавлен в корзину!",
      description: `${productInfo.name} был добавлен в вашу корзину.`,
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
       maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full product-card flex flex-col h-full overflow-hidden group">
        <CardHeader className="p-4">
            <Link href={`/part/${productInfo.id}`} passHref legacyBehavior={false} aria-label={`Посмотреть детали для ${productInfo.name}`}>
                  <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2 text-sm font-medium h-10">
                    {productInfo.name}
                   </CardTitle>
             </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-grow p-4 pt-0">
             <Link href={`/part/${productInfo.id}`} passHref legacyBehavior={false} className="block w-full mb-3" aria-label={`Посмотреть изображение ${productInfo.name}`}>
                    <img
                        src={productInfo.imageUrl || 'https://placehold.co/300x200.png'}
                        alt={productInfo.name}
                        className="object-cover rounded-md h-28 w-full group-hover:opacity-90 transition-opacity border"
                        loading="lazy"
                         onError={(e) => (e.currentTarget.src = 'https://placehold.co/300x200.png')}
                         data-ai-hint={productInfo.dataAiHint || "autopart image"}
                    />
            </Link>
            <p className="text-xs text-muted-foreground mb-1">{productInfo.brand}</p>
            <p className="text-base font-semibold mb-3">{formatCurrency(productInfo.price)}</p>
        </CardContent>

         <div className="p-4 pt-0 mt-auto">
            <Button onClick={addItemToBasket} className="w-full h-9">В корзину</Button>
        </div>
    </Card>
  );
};

export default AutopartComponent;
