"use client";

import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

const CheckoutPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input type="text" placeholder="Name" />
          <Input type="tel" placeholder="Phone Number" />
          <Input type="email" placeholder="Email" />
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input type="text" placeholder="City" />
          <Input type="text" placeholder="Street" />
          <div className="flex gap-4">
            <Input type="text" placeholder="House Number" />
            <Input type="text" placeholder="Apartment Number" />
          </div>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <select className="border rounded p-2">
            <option>Online Payment</option>
            <option>Cash on Delivery</option>
          </select>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total: $XX.XX</p>
        </CardContent>
      </Card>
      <div className="text-center mt-8">
        <Button>Place Order</Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
