import type { AutoPart } from './autopart';

export interface OrderItem extends AutoPart {
  quantity: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface ShippingAddress {
  city: string;
  street: string;
  house: string;
  apartment?: string;
}

export interface Order {
  id: string;
  orderDate: string; // ISO date string
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'online' | 'cash_on_delivery';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}
