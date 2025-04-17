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

  return (
    <Card className="w-80 product-card">
      
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
    </Card>
  );
};

export default Autopart;
