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
  /** The price of the auto part in a base currency (e.g., USD, to be formatted later). */
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


// --- Placeholder Data ---
// Simulates a database or API response
const allParts: AutoPart[] = [
  {
    id: 'bps-001',
    name: 'Передние тормозные колодки',
    brand: 'Toyota Genuine',
    price: 75.50, // Base price (e.g., USD)
    imageUrl: 'https://picsum.photos/seed/bps001/300/200',
    description: 'Оригинальные передние тормозные колодки для превосходного торможения.',
    category: 'Тормоза',
    compatibleVehicles: ['Toyota Camry 2018+', 'Toyota RAV4 2019+'],
    sku: 'TG-8901-F',
    stock: 50,
    rating: 4.8,
    reviewCount: 120,
  },
  {
    id: 'afl-002',
    name: 'Воздушный фильтр двигателя',
    brand: 'Denso',
    price: 18.00,
    imageUrl: 'https://picsum.photos/seed/afl002/300/200',
    description: 'Высококачественный воздушный фильтр для оптимальной работы двигателя.',
    category: 'Фильтры',
    compatibleVehicles: ['Toyota Corolla 2015+', 'Toyota Highlander 2017+'],
    sku: 'DN-17801',
    stock: 150,
    rating: 4.5,
    reviewCount: 85,
  },
   {
    id: 'oil-003',
    name: 'Синтетическое моторное масло 0W-20',
    brand: 'Mobil 1',
    price: 35.00, // Price for a standard container, e.g., 5 quarts
    imageUrl: 'https://picsum.photos/seed/oil003/300/200',
    description: 'Полностью синтетическое масло для улучшенной защиты и производительности.',
    category: 'Двигатель',
    compatibleVehicles: ['Большинство моделей Toyota'], // General compatibility
    sku: 'M1-0W20-5Q',
    stock: 80,
    rating: 4.9,
    reviewCount: 210,
  },
    {
    id: 'shk-004',
    name: 'Задние амортизаторы',
    brand: 'KYB',
    price: 120.00, // Price per pair or single? Assume single for now
    imageUrl: 'https://picsum.photos/seed/shk004/300/200',
    description: 'Газонаполненные амортизаторы для комфортной и стабильной езды.',
    category: 'Подвеска',
    compatibleVehicles: ['Toyota Sienna 2015+', 'Lexus RX350 2016+'],
    sku: 'KYB-349041',
    stock: 30,
    rating: 4.6,
    reviewCount: 55,
  },
   {
    id: 'lhd-005',
    name: 'Светодиодная лампа для фары (H11)',
    brand: 'Philips',
    price: 49.99, // Price per bulb or pair? Assume pair
    imageUrl: 'https://picsum.photos/seed/lhd005/300/200',
    description: 'Яркие и долговечные светодиодные лампы для лучшей видимости.',
    category: 'Электрика',
    compatibleVehicles: ['Различные модели Toyota/Lexus'], // Broad compatibility
    sku: 'PH-H11LED-X2',
    stock: 75,
     rating: 4.7,
    reviewCount: 92,
  },
   {
    id: 'acc-006',
    name: 'Всесезонные коврики (комплект)',
    brand: 'WeatherTech',
    price: 150.00,
    imageUrl: 'https://picsum.photos/seed/acc006/300/200',
    description: 'Прочные коврики для защиты салона от грязи и влаги.',
    category: 'Аксессуары',
    compatibleVehicles: ['Toyota RAV4 2019+', 'Toyota Highlander 2020+'], // Often model-specific
    sku: 'WT-441301-441302', // Example front/rear SKU
    stock: 40,
     rating: 4.9,
     reviewCount: 150,
  },
  // Add more placeholder parts...
   {
    id: 'bdy-007',
    name: 'Крышка зеркала (левая, окрашенная)',
    brand: 'Toyota Genuine',
    price: 65.00,
    imageUrl: 'https://picsum.photos/seed/bdy007/300/200',
    description: 'Оригинальная крышка зеркала, окрашенная в цвет кузова (требуется указание цвета).',
    category: 'Кузов',
    compatibleVehicles: ['Toyota Camry 2018-2021'],
    sku: 'TG-87945-VAR', // VAR indicates color variation needed
    stock: 25,
    rating: 4.5,
    reviewCount: 15,
   },
    {
    id: 'flt-008',
    name: 'Салонный фильтр (угольный)',
    brand: 'Bosch',
    price: 22.50,
    imageUrl: 'https://picsum.photos/seed/flt008/300/200',
    description: 'Угольный салонный фильтр для очистки воздуха от пыли и запахов.',
    category: 'Фильтры',
    compatibleVehicles: ['Toyota Corolla 2015+', 'Toyota C-HR 2018+'],
    sku: 'BSH-6055C',
    stock: 120,
    rating: 4.6,
    reviewCount: 70,
  },
];

// --- Service Functions ---

/**
 * Simulates an API call with a delay.
 * @param data The data to return after the delay.
 * @param delay The delay in milliseconds.
 */
function simulateApiCall<T>(data: T, delay = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
}


/**
 * Retrieves auto parts based on a search query (case-insensitive).
 * Searches name, brand, description, and category.
 *
 * @param query The search query.
 * @returns A promise that resolves to an array of matching AutoPart objects.
 */
export async function searchAutoParts(query: string): Promise<AutoPart[]> {
  const lowerCaseQuery = query.toLowerCase();
  if (!query) {
    return simulateApiCall([]); // Return empty array if query is empty
  }

  const results = allParts.filter(part =>
    part.name.toLowerCase().includes(lowerCaseQuery) ||
    part.brand.toLowerCase().includes(lowerCaseQuery) ||
    part.description.toLowerCase().includes(lowerCaseQuery) ||
    part.category.toLowerCase().includes(lowerCaseQuery) ||
    (part.sku && part.sku.toLowerCase().includes(lowerCaseQuery))
  );

  return simulateApiCall(results);
}

/**
 * Retrieves auto parts based on category (case-insensitive).
 * If category is 'all' or empty, returns all parts.
 *
 * @param category The category to filter by (e.g., 'Тормоза', 'Фильтры').
 * @returns A promise that resolves to an array of AutoPart objects.
 */
export async function getAutoPartsByCategory(category: string | null | undefined): Promise<AutoPart[]> {
  const lowerCaseCategory = category?.toLowerCase();

  if (!lowerCaseCategory || lowerCaseCategory === 'all') {
    return simulateApiCall(allParts);
  }

  const results = allParts.filter(part => part.category.toLowerCase() === lowerCaseCategory);
  return simulateApiCall(results);
}

/**
 * Retrieves a single auto part by its ID.
 *
 * @param partId The ID of the part to retrieve.
 * @returns A promise that resolves to the AutoPart object or null if not found.
 */
export async function getAutoPartById(partId: string): Promise<AutoPart | null> {
  const part = allParts.find(p => p.id === partId);
  return simulateApiCall(part || null);
}


/**
 * Retrieves auto parts compatible with a specific VIN code (simulated).
 * In a real application, this would involve decoding the VIN and querying a database.
 * This simulation checks if the VIN starts with a known prefix.
 *
 * @param vinCode The VIN code of the vehicle.
 * @returns A promise that resolves to an array of compatible AutoPart objects.
 */
export async function getPartsByVin(vinCode: string): Promise<AutoPart[]> {
   // Basic validation
  if (!vinCode || vinCode.length !== 17) {
    console.warn("getPartsByVin: Invalid VIN code provided.");
    return simulateApiCall([]);
  }

  const upperVin = vinCode.toUpperCase();
  let compatibleParts: AutoPart[] = [];

  // --- Simulation Logic ---
  // Example: VIN starting with 'JT' might be a Toyota car
  if (upperVin.startsWith('JT')) {
    compatibleParts = allParts.filter(part =>
        part.compatibleVehicles.some(v => v.toLowerCase().includes('toyota')) ||
        part.compatibleVehicles.some(v => v.toLowerCase().includes('большинство моделей')) ||
        part.compatibleVehicles.some(v => v.toLowerCase().includes('различные модели'))
    );
  }
  // Example: VIN starting with '2T' might be a Toyota truck/SUV built in North America
  else if (upperVin.startsWith('2T')) {
     compatibleParts = allParts.filter(part =>
       part.compatibleVehicles.some(v => v.toLowerCase().includes('rav4') || v.toLowerCase().includes('highlander') || v.toLowerCase().includes('sienna')) ||
        part.compatibleVehicles.some(v => v.toLowerCase().includes('большинство моделей')) ||
         part.compatibleVehicles.some(v => v.toLowerCase().includes('различные модели'))
     );
  }
  // Add more simulation rules as needed
  // --- End Simulation Logic ---

  console.log(`getPartsByVin: Found ${compatibleParts.length} potentially compatible parts for VIN starting with ${upperVin.substring(0, 3)}...`);
  return simulateApiCall(compatibleParts);
}

/**
 * Retrieves auto parts compatible with a specific make and model (simulated).
 *
 * @param make The make of the vehicle (e.g., 'Toyota').
 * @param model The model of the vehicle (e.g., 'Camry').
 * @returns A promise that resolves to an array of compatible AutoPart objects.
 */
export async function getPartsByMakeModel(make: string, model: string): Promise<AutoPart[]> {
  if (!make || !model) {
    return simulateApiCall([]);
  }
  const lowerMake = make.toLowerCase();
  const lowerModel = model.toLowerCase();

  const results = allParts.filter(part =>
    part.compatibleVehicles.some(v => {
      const lowerV = v.toLowerCase();
      // Simple check, refine as needed (e.g., year ranges)
      return lowerV.includes(lowerMake) && lowerV.includes(lowerModel);
    }) || part.compatibleVehicles.some(v => v.toLowerCase().includes('большинство моделей') || v.toLowerCase().includes('различные модели')) // Include general parts
  );

  console.log(`getPartsByMakeModel: Found ${results.length} potentially compatible parts for ${make} ${model}`);
  return simulateApiCall(results);
}
