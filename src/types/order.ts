
import type { AutoPart } from './autopart';

export interface OrderItemDetail extends AutoPart {
  quantity: number;
}

export interface CustomerContactInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface DeliveryAddressInfo {
  city: string;
  street: string;
  house: string;
  apartment?: string;
}

export interface OrderRecord {
  id: string;
  orderDate: string;
  customerInfo: CustomerContactInfo;
  shippingAddress: DeliveryAddressInfo;
  items: OrderItemDetail[];
  totalAmount: number;
  paymentMethod: 'online' | 'cash_on_delivery';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}
