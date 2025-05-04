
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Order, OrderItem, CustomerInfo, ShippingAddress } from '@/types/order';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
const dataDir = path.dirname(ordersFilePath);

// Function to ensure the data directory exists
const ensureDataDirExists = async (): Promise<void> => {
  try {
    await fs.access(dataDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}`);
    } else {
      console.error("Error accessing data directory:", error);
      throw new Error("Could not access data directory.");
    }
  }
};

// Function to read the orders file
async function readOrdersFile(): Promise<Order[]> {
  await ensureDataDirExists();
  try {
    const data = await fs.readFile(ordersFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log("orders.json not found, initializing with empty array.");
      await writeOrdersFile([]);
      return [];
    }
     if (error instanceof SyntaxError) {
        console.error("Error parsing orders.json:", error);
        console.warn("Orders data file appears corrupted. Returning empty array.");
        return [];
    }
    console.error("Error reading orders file:", error);
    throw new Error("Could not read orders data.");
  }
}

// Function to write to the orders file
async function writeOrdersFile(orders: Order[]): Promise<void> {
  await ensureDataDirExists();
  try {
     if (!Array.isArray(orders)) {
        console.error("Invalid orders data provided to writeOrdersFile:", orders);
        throw new Error("Attempted to write invalid orders data.");
      }
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing orders file:", error);
    throw new Error("Could not save orders data.");
  }
}

// Simulate API call delay
function simulateApiCall<T>(data: T, delay = 100): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
}

// Get all orders
export async function getAllOrders(): Promise<Order[]> {
    const allOrders = await readOrdersFile();
    // Sort orders by date, newest first
    allOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    return simulateApiCall(allOrders);
}

// Create a new order
export async function createOrder(orderData: Omit<Order, 'id' | 'orderDate' | 'status'>): Promise<Order> {
  if (!orderData || typeof orderData !== 'object' || !orderData.items || orderData.items.length === 0) {
    throw new Error("Некорректные данные для создания заказа.");
  }

  const allOrders = await readOrdersFile();
  const newOrderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newOrder: Order = {
    ...orderData,
    id: newOrderId,
    orderDate: new Date().toISOString(),
    status: 'pending', // Default status
  };

  allOrders.push(newOrder);
  await writeOrdersFile(allOrders);

  console.log(`Created new order: (ID: ${newOrderId})`);
  return simulateApiCall(newOrder);
}

// --- Initialization (Ensure file exists on startup) ---
(async () => {
    try {
        await ensureDataDirExists();
        // Ensure orders file exists
        await readOrdersFile();
        console.log("Orders data file checked/initialized.");
    } catch (error) {
        console.error("FATAL: Failed to initialize orders data file:", error);
    }
})();
