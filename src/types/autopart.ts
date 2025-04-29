
/**
 * Represents an auto part with its details.
 */
export interface AutoPart {
  /** The unique identifier for the auto part. */
  id: string;
  /** The name of the auto part. */
  name: string;
  /** The brand of the auto part. */
  brand: string;
  /** The price of the auto part in Tenge (KZT). */
  price: number;
  /** The URL of the image of the auto part. */
  imageUrl: string;
  /** A description of the auto part. */
  description: string;
  /** The category of the auto part. */
  category: string;
  /** A list of compatible vehicle makes and models or VIN prefixes. */
  compatibleVehicles: string[];
  /** Optional: Stock keeping unit */
  sku?: string;
   /** Optional: Current stock level */
  stock?: number;
  /** Optional: Rating out of 5 */
  rating?: number;
   /** Optional: Number of reviews */
  reviewCount?: number;
   /** Optional: Quantity for cart items */
  quantity?: number;
}
