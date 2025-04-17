"use client";

import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const cartItems: CartItem[] = [
  {
    id: '1',
    name: 'Brake Pads',
    price: 45.99,
    quantity: 2,
    imageUrl: 'https://picsum.photos/200/150',
  },
  {
    id: '2',
    name: 'Air Filter',
    price: 12.50,
    quantity: 1,
    imageUrl: 'https://picsum.photos/200/150',
  },
];

const CartPage = () => {
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Shopping Cart</h1>
      {cartItems.map((item) => (
        <Card key={item.id} className="mb-4">
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded" />
            <div>
              <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
              <div className="flex items-center">
                <Button size="sm">-</Button>
                <span className="mx-2">{item.quantity}</span>
                <Button size="sm">+</Button>
              </div>
            </div>
            <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
          </CardContent>
        </Card>
      ))}
      <div className="text-right">
        <h2 className="text-2xl font-bold">Total: ${calculateTotal()}</h2>
        <Button className="mt-4">Proceed to Checkout</Button>
      </div>
    </div>
  );
};

export default CartPage;
