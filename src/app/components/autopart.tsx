'use client';
import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AutoPart} from "@/services/autoparts";
import {useToast} from "@/hooks/use-toast";
import {useState, useEffect} from "react";
import Link from "next/link";

interface AutopartProps {
  product: AutoPart;
}

const Autopart: React.FC<AutopartProps> = ({ product }) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<AutoPart[]>(() => {
    // Initialize cartItems from local storage
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    // Update local storage when cartItems change
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleAddToCart = () => {
    const existingItemIndex = cartItems.findIndex((item: AutoPart) => item.id === product.id);

    let updatedCart;

    if (existingItemIndex > -1) {
      // If item already exists in cart, increase the quantity (if you implement quantity)
      updatedCart = cartItems.map((item: AutoPart, index: number) =>
        index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      );
    } else {
      // If item is not in cart, add it with quantity 1
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    setCartItems(updatedCart);

    toast({
      title: "Товар добавлен в корзину!",
      description: `${product.name} был добавлен в вашу корзину.`,
    });
  };

  const formatPrice = (price: number): string => {
    const exchangeRate = 500; // Курс доллара к тенге (пример)
    const priceInTenge = price * exchangeRate;
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 2,
    }).format(priceInTenge);
  };

  return (
    <Card className="w-80 product-card">
      
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Link href={`/part/${product.id}`}>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover rounded-md mb-4 h-32 w-full"
            />
          </Link>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
           <Button onClick={handleAddToCart}>В корзину</Button>
        </CardContent>
    </Card>
  );
};

export default Autopart;
