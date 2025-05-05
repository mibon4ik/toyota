
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { OrderList } from '../components/OrderList';
import type { Order } from '@/types/order';
import { getAllOrders } from '@/services/orders';
import { useToast } from "@/hooks/use-toast";

export const OrderManagementSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    setErrorOrders(null);
    try {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (fetchError) {
      console.error("OrderManagementSection: Failed to fetch orders:", fetchError);
      setErrorOrders("Не удалось загрузить список заказов.");
      toast({
        title: "Ошибка загрузки заказов",
        description: "Не удалось загрузить список заказов. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrders(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-8 mt-6">
      <OrderList
        orders={orders}
        isLoading={isLoadingOrders}
        error={errorOrders}
      />
    </div>
  );
};
