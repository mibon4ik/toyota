

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

  rating?: number;

  reviewCount?: number;

  quantity?: number;
}
