'use client';

import React, {useState, useEffect} from 'react';
import {AutoPart, getAutoPartById} from "@/services/autoparts";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useToast} from "@/hooks/use-toast";

const PartDetailPage = () => {
  const [part, setPart] = useState<AutoPart | null>(null);
  const params = useParams<{ partId: string }>(); // Explicitly type params
  const partId = params?.partId; // Safely access partId
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]); // Added cartItems state

  // Load cart items from local storage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    const fetchPart = async () => {
      if (partId) { // Check if partId exists
        const partData = await getAutoPartById(partId); // Use the potentially typed partId
        setPart(partData);
      }
    };

    fetchPart();
  }, [partId]); // Keep partId in dependency array

  // Add item to cart
  const handleAddToCart = () => {
    if (part) {
      const existingItemIndex = cartItems.findIndex((item) => item.id === part.id);
      let updatedCart;

      if (existingItemIndex > -1) {
        // If item exists, increment quantity
        updatedCart = cartItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        updatedCart = [...cartItems, { ...part, quantity: 1 }];
      }

      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart)); // Save to local storage

      toast({
          title: "Добавлено в корзину!",
          description: `${part.name} был добавлен в вашу корзину.`,
      });
    }
  };

  if (!part) {
    return <div>Загрузка...</div>;
  }

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
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{part.name}</CardTitle>
          <CardDescription>{part.brand}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <img
            src={part.imageUrl}
            alt={part.name}
            className="object-cover rounded-md mb-4 h-64 w-full"
          />
          <p className="text-lg font-semibold">{formatPrice(part.price)}</p>
          <p className="text-md text-muted-foreground">{part.description}</p>
          <div className="mt-4">
            <Button onClick={handleAddToCart}>В корзину</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartDetailPage;
