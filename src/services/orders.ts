
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Order } from '@/types/order';

const ordersDataPath = path.join(process.cwd(), 'src', 'data', 'orders.json');
const dataStorageDir = path.dirname(ordersDataPath);

const ensureStorageDirectoryExists = async (): Promise<void> => {
  try {
    await fs.access(dataStorageDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dataStorageDir, { recursive: true });
    } else {
      throw new Error("Could not access data directory.");
    }
  }
};

async function loadOrdersFromFile(): Promise<Order[]> {
  await ensureStorageDirectoryExists();
  try {
    const fileContents = await fs.readFile(ordersDataPath, 'utf-8');
    if (!fileContents.trim()) {
        await saveOrdersToFile([]);
        return [];
    }
    const orders = JSON.parse(fileContents);
     if (!Array.isArray(orders)) {
        await saveOrdersToFile([]);
        return [];
    }
    return orders;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await saveOrdersToFile([]);
      return [];
    }
     if (error instanceof SyntaxError) {
        console.error("Error parsing orders.json:", error);
        await saveOrdersToFile([]);
        return [];
    }
    console.error("Error reading orders file:", error);
    throw new Error("Could not read orders data.");
  }
}

async function saveOrdersToFile(ordersList: Order[]): Promise<void> {
  await ensureStorageDirectoryExists();
  try {
     if (!Array.isArray(ordersList)) {
        throw new Error("Attempted to write invalid orders data.");
      }
    await fs.writeFile(ordersDataPath, JSON.stringify(ordersList, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing orders file:", error);
    throw new Error("Could not save orders data.");
  }
}

function mockApiLatency<T>(data: T, timeMs = 100): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), timeMs));
}

export async function getAllOrders(): Promise<Order[]> {
    const allOrderRecords = await loadOrdersFromFile();
    allOrderRecords.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    return mockApiLatency(allOrderRecords);
}

export async function getOrdersByCustomerEmail(email: string): Promise<Order[]> {
  if (!email) {
    return mockApiLatency([]);
  }
  const allOrderRecords = await loadOrdersFromFile();
  const userOrders = allOrderRecords.filter(
    (order) => order.customerInfo.email.toLowerCase() === email.toLowerCase()
  );
  userOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  return mockApiLatency(userOrders);
}

export async function createOrder(newOrderData: Omit<Order, 'id' | 'orderDate' | 'status'>): Promise<Order> {
  if (!newOrderData || typeof newOrderData !== 'object' || !newOrderData.items || newOrderData.items.length === 0) {
    throw new Error("Некорректные данные для создания заказа.");
  }

  const allOrderRecords = await loadOrdersFromFile();
  const generatedOrderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const fullOrderRecord: Order = {
    ...newOrderData,
    id: generatedOrderId,
    orderDate: new Date().toISOString(),
    status: 'pending',
  };

  allOrderRecords.push(fullOrderRecord);
  await saveOrdersToFile(allOrderRecords);
  
  return mockApiLatency(fullOrderRecord);
}

(async () => {
    try {
        await ensureStorageDirectoryExists();
        await loadOrdersFromFile();
    } catch (error) {
        // This might log too verbosely on startup if file is simply missing
        // console.error("FATAL: Failed to initialize orders data file:", error);
    }
})();
