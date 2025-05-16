
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { OrderList } from '../components/OrderList';
import type { Order } from '@/types/order';
import { getAllOrders } from '@/services/orders';
import { useToast } from "@/hooks/use-toast";

export const OrderManagementSection: React.FC = () => {
  const [orderListData, setOrderListData] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const { toast: showAppToast } = useToast();

  const loadOrders = useCallback(async () => {
    setFetchingOrders(true);
    setOrdersError(null);
    try {
      const data = await getAllOrders();
      setOrderListData(data);
    } catch (err) {
      console.error("OrderManagementSection: Failed to fetch orders:", err);
      setOrdersError("Не удалось загрузить список заказов.");
      showAppToast({
        title: "Ошибка загрузки заказов",
        description: "Не удалось загрузить список заказов. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setFetchingOrders(false);
    }
  }, [showAppToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-8 mt-6">
      <OrderList
        orderData={orderListData}
        isLoadingStatus={fetchingOrders}
        errorMessage={ordersError}
      />
    </div>
  );
};
