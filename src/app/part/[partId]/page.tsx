'use client';

import React, {useState, useEffect} from 'react';
import {AutoPart, getAutoPartById} from "@/services/autoparts";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useToast} from "@/hooks/use-toast";

const PartDetailPage = () => {
  const [part, setPart] = useState<AutoPart | null>(null);
  const {partId} = useParams();
    const { toast } = useToast();

  useEffect(() => {
    const fetchPart = async () => {
      if (partId) {
        const partData = await getAutoPartById(partId as string);
        setPart(partData);
      }
    };

    fetchPart();
  }, [partId]);

    const handleAddToCart = () => {
        if (part) {
            toast({
                title: "Added to cart!",
                description: `${part.name} has been added to your shopping cart.`,
            });
        }
    };

  if (!part) {
    return <div>Loading...</div>;
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
