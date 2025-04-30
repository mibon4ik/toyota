'use client';
import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AutoPart} from "@/types/autopart";
import {useToast} from "@/hooks/use-toast";
import {useState, useEffect} from "react";
import Link from "next/link";

interface AutopartProps {
  product: AutoPart;
}

const Autopart: React.FC<AutopartProps> = ({ product }) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<AutoPart[]>(() => {

    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  useEffect(() => {

    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleAddToCart = () => {
    const existingItemIndex = cartItems.findIndex((item: AutoPart) => item.id === product.id);

    let updatedCart;

    if (existingItemIndex > -1) {

      updatedCart = cartItems.map((item: AutoPart, index: number) =>
        index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      );
    } else {

      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    setCartItems(updatedCart);

    toast({
      title: "Товар добавлен в корзину!",
      description: `${product.name} был добавлен в вашу корзину.`,
    });
  };

  const formatPrice = (price: number): string => {

    const priceInTenge = price;
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
       maximumFractionDigits: 0,
    }).format(priceInTenge);
  };

  return (
    <Card className="w-full product-card flex flex-col h-full overflow-hidden group">
        <CardHeader className="p-4">

            <Link href={`/part/${product.id}`} passHref legacyBehavior={false} aria-label={`Посмотреть детали для ${product.name}`}>
                  <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2 text-sm font-medium h-10">
                    {product.name}
                   </CardTitle>
             </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-grow p-4 pt-0">
             <Link href={`/part/${product.id}`} passHref legacyBehavior={false} className="block w-full mb-3" aria-label={`Посмотреть изображение ${product.name}`}>
                    <img
                        src={product.imageUrl || 'https://picsum.photos/300/200'}
                        alt={product.name}
                        className="object-cover rounded-md h-28 w-full group-hover:opacity-90 transition-opacity border"
                        loading="lazy"
                         onError={(e) => (e.currentTarget.src = 'https://picsum.photos/300/200')}
                    />
            </Link>
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
            <p className="text-base font-semibold mb-3">{formatPrice(product.price)}</p>
        </CardContent>

         <div className="p-4 pt-0 mt-auto">

            <Button onClick={handleAddToCart} className="w-full h-9">В корзину</Button>
        </div>
    </Card>
  );
};

export default Autopart;
