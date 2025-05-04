
"use client";

import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from '@/types/order';
import { formatPrice } from '@/lib/utils';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, isLoading, error }) => {

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default'; // Consider a success variant if added
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: Order['status']) => {
      switch (status) {
        case 'pending': return 'В ожидании';
        case 'processing': return 'В обработке';
        case 'shipped': return 'Отправлен';
        case 'delivered': return 'Доставлен';
        case 'cancelled': return 'Отменен';
        default: return status;
      }
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Заказы:</h2>
        <div className="space-y-3">
            <Skeleton className="h-8 w-full rounded-md" />
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
        </div>
         <p className="text-center text-muted-foreground mt-4">Загрузка заказов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Заказы:</h2>
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
       <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Заказы:</h2>
            <p className="text-center text-muted-foreground">Заказы не найдены.</p>
       </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Заказы:</h2>
      <Accordion type="multiple" className="w-full space-y-4">
        {orders.map((order) => (
          <AccordionItem key={order.id} value={order.id} className="border rounded-md px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-col sm:flex-row justify-between w-full pr-4 text-sm">
                 <div className="flex items-center gap-2 mb-2 sm:mb-0">
                   <span className="font-medium">Заказ #{order.id.substring(0, 8)}...</span>
                   <span className="text-muted-foreground">от {format(new Date(order.orderDate), 'PPP', { locale: ru })}</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                   <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusText(order.status)}</Badge>
                 </div>
               </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2">Покупатель:</h4>
                  <p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                  <p>{order.customerInfo.email}</p>
                  <p>{order.customerInfo.phone}</p>
                </div>
                 {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-2">Адрес доставки:</h4>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.street}, д. {order.shippingAddress.house}</p>
                  {order.shippingAddress.apartment && <p>кв./офис {order.shippingAddress.apartment}</p>}
                </div>
                {/* Items */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-2">Товары:</h4>
                   <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Бренд</TableHead>
                            <TableHead className="text-right">Кол-во</TableHead>
                            <TableHead className="text-right">Цена</TableHead>
                            <TableHead className="text-right">Сумма</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.brand}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                              <TableCell className="text-right font-medium">{formatPrice(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                </div>
                {/* Payment Method */}
                <div>
                  <h4 className="font-semibold mb-1">Способ оплаты:</h4>
                  <p>{order.paymentMethod === 'cash_on_delivery' ? 'Оплата при получении' : 'Онлайн оплата'}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
