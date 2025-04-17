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
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your shopping cart.`,
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
      <Button onClick={handleAddToCart}>Add to Cart</Button>
    </Card>
  );
};

export default Autopart;
