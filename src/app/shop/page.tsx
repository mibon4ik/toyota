'use client';

import React, {useState, useEffect} from 'react';
import {AutoPart, getAutoPartsByCategory} from "@/services/autoparts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Autopart from "@/components/autopart";
import {useToast} from "@/hooks/use-toast";
import {useSearchParams} from "next/navigation";

interface CartItem extends AutoPart {
  quantity: number;
}

const ShopPage = () => {
  const [products, setProducts] = useState<AutoPart[]>([]);
  const {toast} = useToast();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
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

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getAutoPartsByCategory(category || 'all');
      setProducts(products);
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = (product: AutoPart) => {
    const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);

    let updatedCart: CartItem[];

    if (existingItemIndex > -1) {
      // If item already exists in cart, increase the quantity
      updatedCart = cartItems.map((item, index) =>
        index === existingItemIndex ? {...item, quantity: item.quantity + 1} : item
      );
    } else {
      // If item is not in cart, add it with quantity 1
      const newItem: CartItem = {...product, quantity: 1};
      updatedCart = [...cartItems, newItem];
    }

    setCartItems(updatedCart);

    toast({
      title: "Добавлено в корзину!",
      description: `${product.name} был добавлен в вашу корзину.`,
    });
  };


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Каталог автозапчастей</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {products.map((product) => (
          <Card key={product.id} className="w-80 product-card">
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
              <p className="text-lg font-semibold">{(product.price * 90).toFixed(2)} ₽</p>
            </CardContent>
            <Button onClick={() => handleAddToCart(product)}>В корзину</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
