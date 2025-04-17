'use client';

import React, { useState, useEffect } from 'react';
import { AutoPart, getAutoPartsByCategory } from "@/services/autoparts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Autopart from "@/components/autopart";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";

const ShopPage = () => {
  const [products, setProducts] = useState<AutoPart[]>([]);
  const { toast } = useToast();
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            const products = await getAutoPartsByCategory(category || 'all');
            setProducts(products);
        };

        fetchProducts();
    }, [category]);

  const handleAddToCart = (product: AutoPart) => {
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
                    <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                </CardContent>
                <Button onClick={() => handleAddToCart(product)}>В корзину</Button>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
