'use client';
import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AutoPart} from "@/services/autoparts";
import Link from "next/link";
import {useToast} from "@/hooks/use-toast";

interface AutopartProps {
  product: AutoPart;
}

const Autopart: React.FC<AutopartProps> = ({ product }) => {
  const { toast } = useToast();

  const handleAddToCart = () => {
    // Get existing cart items from local storage
    const storedCart = localStorage.getItem('cartItems');
    let cartItems: any[] = storedCart ? JSON.parse(storedCart) : [];

    // Check if the item already exists in the cart
    const existingItemIndex = cartItems.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      // If item exists, update the quantity
      cartItems[existingItemIndex].quantity = (cartItems[existingItemIndex].quantity || 0) + 1;
    } else {
      // If item doesn't exist, add it to the cart with quantity 1
      cartItems.push({ ...product, quantity: 1 });
    }

    // Save the updated cart items back to local storage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    toast({
      title: "Добавлено в корзину!",
      description: `${product.name} был добавлен в вашу корзину.`,
    });
  };

  return (
    <Card className="w-80 product-card">
      <Link href={`/part/${product.id}`}>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover rounded-md mb-4 h-32 w-full"
          />
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
        </CardContent>
      </Link>
      <Button onClick={handleAddToCart}>В корзину</Button>
    </Card>
  );
};

export default Autopart;


