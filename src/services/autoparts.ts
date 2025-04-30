
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { AutoPart } from '@/types/autopart';
import type { Vehicle } from '@/types/vehicle';

const partsFilePath = path.join(process.cwd(), 'src', 'data', 'autoparts.json');
const vehiclesFilePath = path.join(process.cwd(), 'src', 'data', 'vehicles.json');
const dataDir = path.dirname(partsFilePath);


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


async function readPartsFile(): Promise<AutoPart[]> {
  await ensureDataDirExists();
  try {
    const data = await fs.readFile(partsFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log("autoparts.json not found, initializing with empty array.");
      await writePartsFile([]);
      return [];
    }
     if (error instanceof SyntaxError) {
        console.error("Error parsing autoparts.json:", error);
        console.warn("Autoparts data file appears corrupted. Returning empty array.");
        return [];
    }
    console.error("Error reading autoparts file:", error);
    throw new Error("Could not read autoparts data.");
  }
}


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


async function readVehiclesFile(): Promise<Vehicle[]> {
    await ensureDataDirExists();
    try {
      const data = await fs.readFile(vehiclesFilePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log("vehicles.json not found, returning empty array.");
        return [];
      }
      if (error instanceof SyntaxError) {
          console.error("Error parsing vehicles.json:", error);
          console.warn("Vehicles data file appears corrupted. Returning empty array.");
          return [];
      }
      console.error("Error reading vehicles file:", error);
      throw new Error("Could not read vehicle data.");
    }
  }




function simulateApiCall<T>(data: T, delay = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
}



export async function searchAutoParts(query: string): Promise<AutoPart[]> {
  const allParts = await readPartsFile();
  const lowerCaseQuery = query.toLowerCase();
  if (!query) {
    return simulateApiCall([]);
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


export async function getAutoPartsByCategory(category: string | null | undefined): Promise<AutoPart[]> {
   const allParts = await readPartsFile();
  const lowerCaseCategory = category?.toLowerCase();

  if (!lowerCaseCategory || lowerCaseCategory === 'all') {
    return simulateApiCall(allParts);
  }

  const results = allParts.filter(part => part.category.toLowerCase() === lowerCaseCategory);
  return simulateApiCall(results);
}


export async function getAutoPartById(partId: string): Promise<AutoPart | null> {
   const allParts = await readPartsFile();
  const part = allParts.find(p => p.id === partId);
  return simulateApiCall(part || null);
}



export async function getPartsByVin(vinCode: string): Promise<AutoPart[]> {
  const vehicle = await getVehicleByVin(vinCode);
  if (!vehicle) {
    console.log(`getPartsByVin: No vehicle found for VIN ${vinCode}.`);
    return simulateApiCall([]);
  }
   console.log(`getPartsByVin: Found vehicle ${vehicle.make} ${vehicle.model} for VIN ${vinCode}. Fetching parts...`);

   return getPartsByMakeModel(vehicle.make, vehicle.model);
}


export async function getPartsByMakeModel(make: string, model: string): Promise<AutoPart[]> {
   const allParts = await readPartsFile();
  if (!make || !model) {
    return simulateApiCall([]);
  }
  const lowerMake = make.toLowerCase();
  const lowerModel = model.toLowerCase();

  const results = allParts.filter(part =>
    part.compatibleVehicles.some(v => {
      const lowerV = v.toLowerCase();
      return lowerV.includes(lowerMake) && lowerV.includes(lowerModel);
    }) || part.compatibleVehicles.some(v => v.toLowerCase().includes('большинство моделей') || v.toLowerCase().includes('различные модели'))
  );

  console.log(`getPartsByMakeModel: Found ${results.length} potentially compatible parts for ${make} ${model}`);
  return simulateApiCall(results);
}



export async function addAutoPart(newPartData: Omit<AutoPart, 'id'>): Promise<AutoPart> {
  if (!newPartData || typeof newPartData !== 'object' || !newPartData.name) {
    throw new Error("Некорректные данные для добавления товара.");
  }

  const allParts = await readPartsFile();

  if (newPartData.sku && allParts.some(part => part.sku === newPartData.sku)) {
    throw new Error(`Товар с артикулом (SKU) "${newPartData.sku}" уже существует.`);
  }

  const newId = `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newPart: AutoPart = {
    ...newPartData,
    id: newId,
    rating: newPartData.rating ?? undefined,
    reviewCount: newPartData.reviewCount ?? undefined,
    stock: newPartData.stock ?? 0,
    compatibleVehicles: Array.isArray(newPartData.compatibleVehicles) ? newPartData.compatibleVehicles : [],
  };

  allParts.push(newPart);
  await writePartsFile(allParts);

  console.log(`Added new part: ${newPart.name} (ID: ${newId})`);
  return newPart;
}




export async function getVehicleByVin(vinCode: string): Promise<Vehicle | null> {
  if (!vinCode) return simulateApiCall(null);
  const vehicles = await readVehiclesFile();
  const upperVin = vinCode.toUpperCase();
  const vehicle = vehicles.find(v => v.vin.toUpperCase() === upperVin);
  return simulateApiCall(vehicle || null);
}


export async function getVehicleByMakeModel(make: string, model: string): Promise<Vehicle | null> {
  if (!make || !model) return simulateApiCall(null);
  const vehicles = await readVehiclesFile();
  const lowerMake = make.toLowerCase();
  const lowerModel = model.toLowerCase();
  const vehicle = vehicles.find(v =>
    v.make.toLowerCase() === lowerMake && v.model.toLowerCase() === lowerModel
  );
  return simulateApiCall(vehicle || null);
}


// --- Initialization (Optional, if needed) ---
// (async () => {
//     try {
//         console.log("Ensuring data files exist on startup...");
//         await readPartsFile(); // Ensures file exists or is created
//         await readVehiclesFile(); // Ensures file exists or is created
//         console.log("Data file checks complete.");
//     } catch (error) {
//         console.error("FATAL: Failed to initialize data files:", error);
//     }
// })();
