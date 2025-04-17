"use client";

import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

const CheckoutPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>
      <Card>
        <CardHeader>
          <CardTitle>Информация о покупателе</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input type="text" placeholder="Имя" />
          <Input type="tel" placeholder="Номер телефона" />
          <Input type="email" placeholder="Email" />
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Адрес доставки</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input type="text" placeholder="Город" />
          <Input type="text" placeholder="Улица" />
          <div className="flex gap-4">
            <Input type="text" placeholder="Номер дома" />
            <Input type="text" placeholder="Номер квартиры" />
          </div>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Способ оплаты</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <select className="border rounded p-2">
            <option>Онлайн оплата</option>
            <option>Оплата при получении</option>
          </select>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Итоговый заказ</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Итого: $XX.XX</p>
        </CardContent>
      </Card>
      <div className="text-center mt-8">
        <Button>Оформить заказ</Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
