
export interface Review {
  id: string;
  userId: string; // Or username, if user IDs are not readily available on the client for this
  username: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AutoPart {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  compatibleVehicles: string[];
  sku?: string;
  stock?: number;
  rating?: number; // Average rating
  reviewCount?: number;
  reviews?: Review[]; // Array of reviews
  quantity?: number; // Used in cart
  dataAiHint?: string;
}
