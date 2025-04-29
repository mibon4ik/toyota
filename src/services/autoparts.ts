
'use server'; // Indicate this module can run on the server

import fs from 'fs/promises';
import path from 'path';
import type { AutoPart } from '@/types/autopart'; // Assuming type is moved

const partsFilePath = path.join(process.cwd(), 'src', 'data', 'autoparts.json');
const dataDir = path.dirname(partsFilePath);

// --- File System Operations ---

/** Ensures the data directory exists. */
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

/** Reads auto part data from the JSON file. */
async function readPartsFile(): Promise<AutoPart[]> {
  await ensureDataDirExists();
  try {
    const data = await fs.readFile(partsFilePath, 'utf-8');
    return JSON.parse(data || '[]'); // Return empty array if file is empty or malformed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log("autoparts.json not found, initializing with empty array.");
      await writePartsFile([]); // Create the file if it doesn't exist
      return []; // File doesn't exist, return empty array
    }
     if (error instanceof SyntaxError) {
        console.error("Error parsing autoparts.json:", error);
        // Handle corrupted file (e.g., backup, log, return empty, or throw)
        console.warn("Autoparts data file appears corrupted. Returning empty array.");
        // Consider backing up the corrupted file here
        // await fs.copyFile(partsFilePath, `${partsFilePath}.corrupted.${Date.now()}`);
        // await writePartsFile([]); // Recreate with empty array
        return []; // Or throw new Error("Autoparts data file is corrupted.");
    }
    console.error("Error reading autoparts file:", error);
    throw new Error("Could not read autoparts data.");
  }
}

/** Writes auto part data to the JSON file. */
async function writePartsFile(parts: AutoPart[]): Promise<void> {
  await ensureDataDirExists();
  try {
     if (!Array.isArray(parts)) {
        console.error("Invalid parts data provided to writePartsFile:", parts);
        throw new Error("Attempted to write invalid parts data.");
      }
    await fs.writeFile(partsFilePath, JSON.stringify(parts, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing autoparts file:", error);
    throw new Error("Could not save autoparts data.");
  }
}


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
  const allParts = await readPartsFile(); // Read current parts
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
   const allParts = await readPartsFile(); // Read current parts
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
   const allParts = await readPartsFile(); // Read current parts
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
    const allParts = await readPartsFile(); // Read current parts
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
   const allParts = await readPartsFile(); // Read current parts
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


/**
 * Adds a new auto part to the database (JSON file).
 *
 * @param newPartData The data for the new part (without an ID).
 * @returns A promise that resolves to the newly created AutoPart object (with ID).
 */
export async function addAutoPart(newPartData: Omit<AutoPart, 'id'>): Promise<AutoPart> {
  if (!newPartData || typeof newPartData !== 'object' || !newPartData.name) {
    throw new Error("Некорректные данные для добавления товара.");
  }

  const allParts = await readPartsFile();

  // Basic validation (e.g., check for duplicate SKU if provided)
  if (newPartData.sku && allParts.some(part => part.sku === newPartData.sku)) {
    throw new Error(`Товар с артикулом (SKU) "${newPartData.sku}" уже существует.`);
  }

  // Generate a simple unique ID (replace with a more robust method in production)
  const newId = `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newPart: AutoPart = {
    ...newPartData,
    id: newId,
     // Ensure optional fields have defaults if needed (might be handled by form)
    rating: newPartData.rating ?? undefined,
    reviewCount: newPartData.reviewCount ?? undefined,
    stock: newPartData.stock ?? 0,
    // Make sure compatibleVehicles is an array
    compatibleVehicles: Array.isArray(newPartData.compatibleVehicles) ? newPartData.compatibleVehicles : [],
  };

  allParts.push(newPart);
  await writePartsFile(allParts);

  console.log(`Added new part: ${newPart.name} (ID: ${newId})`);
  return newPart; // Return the full part object with the generated ID
}


// --- Initialization ---
// Ensure the parts data file exists and is initialized if needed.
// (async () => {
//     try {
//         console.log("Ensuring autoparts data is initialized...");
//         // await initializePartsDataIfNeeded(); // Removed this call
//         console.log("Autoparts data initialization check complete.");
//     } catch (error) {
//         console.error("FATAL: Failed to initialize autoparts data:", error);
//         // Decide if the application can continue without parts data
//         // process.exit(1);
//     }
// })();
