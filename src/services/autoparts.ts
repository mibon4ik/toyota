
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { AutoPart } from '@/types/autopart';

const partsStoragePath = path.join(process.cwd(), 'src', 'data', 'autoparts.json');
const storageDirectory = path.dirname(partsStoragePath);

const verifyDataDirectory = async (): Promise<void> => {
  try {
    await fs.access(storageDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(storageDirectory, { recursive: true });
    } else {
      console.error("Error accessing data directory:", error);
      throw new Error("Could not access data directory.");
    }
  }
};

async function readPartsFromStorage(): Promise<AutoPart[]> {
  await verifyDataDirectory();
  try {
    const fileData = await fs.readFile(partsStoragePath, 'utf-8');
    return JSON.parse(fileData || '[]');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await writePartsToStorage([]);
      return [];
    }
     if (error instanceof SyntaxError) {
        console.error("Error parsing autoparts.json:", error);
        return [];
    }
    console.error("Error reading autoparts file:", error);
    throw new Error("Could not read autoparts data.");
  }
}

async function writePartsToStorage(partsArray: AutoPart[]): Promise<void> {
  await verifyDataDirectory();
  try {
     if (!Array.isArray(partsArray)) {
        console.error("Invalid parts data provided to writePartsToStorage:", partsArray);
        throw new Error("Attempted to write invalid parts data.");
      }
    await fs.writeFile(partsStoragePath, JSON.stringify(partsArray, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing autoparts file:", error);
    throw new Error("Could not save autoparts data.");
  }
}


function simulateNetworkDelay<T>(data: T, delayMs = 100): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delayMs));
}

export async function getAllAutoParts(): Promise<AutoPart[]> {
    const allPartsList = await readPartsFromStorage();
    return simulateNetworkDelay(allPartsList);
}

export async function searchAutoParts(searchTerm: string): Promise<AutoPart[]> {
  const allPartsList = await readPartsFromStorage();
  const queryLower = searchTerm.toLowerCase();
  if (!searchTerm) {
    return simulateNetworkDelay([]);
  }

  const filteredResults = allPartsList.filter(partItem =>
    partItem.name.toLowerCase().includes(queryLower) ||
    partItem.brand.toLowerCase().includes(queryLower) ||
    (partItem.description && partItem.description.toLowerCase().includes(queryLower)) ||
    partItem.category.toLowerCase().includes(queryLower) ||
    (partItem.sku && partItem.sku.toLowerCase().includes(queryLower))
  );

  return simulateNetworkDelay(filteredResults);
}

export async function getAutoPartsByCategory(categoryName: string | null | undefined): Promise<AutoPart[]> {
   const allPartsList = await readPartsFromStorage();
  const categoryLower = categoryName?.toLowerCase();

  if (!categoryLower || categoryLower === 'all') {
    return simulateNetworkDelay(allPartsList);
  }

  const categoryResults = allPartsList.filter(partItem => partItem.category.toLowerCase() === categoryLower);
  return simulateNetworkDelay(categoryResults);
}

export async function getAutoPartById(idValue: string): Promise<AutoPart | null> {
   const allPartsList = await readPartsFromStorage();
  const foundPart = allPartsList.find(p => p.id === idValue);
  return simulateNetworkDelay(foundPart || null);
}


export async function addAutoPart(partDetails: Omit<AutoPart, 'id'>): Promise<AutoPart> {
  if (!partDetails || typeof partDetails !== 'object' || !partDetails.name) {
    throw new Error("Некорректные данные для добавления товара.");
  }

  const allPartsList = await readPartsFromStorage();

  if (partDetails.sku && allPartsList.some(part => part.sku === partDetails.sku)) {
    throw new Error(`Товар с артикулом (SKU) "${partDetails.sku}" уже существует.`);
  }

  const uniqueId = `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newPartRecord: AutoPart = {
    ...partDetails,
    id: uniqueId,
    rating: partDetails.rating ?? undefined,
    reviewCount: partDetails.reviewCount ?? undefined,
    stock: partDetails.stock ?? 0,
    compatibleVehicles: Array.isArray(partDetails.compatibleVehicles) ? partDetails.compatibleVehicles : [],
  };

  allPartsList.push(newPartRecord);
  await writePartsToStorage(allPartsList);
  
  return newPartRecord;
}


export async function updateAutoPart(partIdToUpdate: string, dataToUpdate: Partial<Omit<AutoPart, 'id'>>): Promise<AutoPart> {
  if (!partIdToUpdate || !dataToUpdate || typeof dataToUpdate !== 'object') {
    throw new Error("Некорректные данные для обновления товара.");
  }

  const allPartsList = await readPartsFromStorage();
  const partIdx = allPartsList.findIndex(p => p.id === partIdToUpdate);

  if (partIdx === -1) {
    throw new Error(`Товар с ID "${partIdToUpdate}" не найден.`);
  }

  const { id, ...updateFields } = dataToUpdate;

  const modifiedPart = {
    ...allPartsList[partIdx],
    ...updateFields,
    price: typeof updateFields.price === 'number' ? updateFields.price : allPartsList[partIdx].price,
    stock: typeof updateFields.stock === 'number' ? updateFields.stock : allPartsList[partIdx].stock,
    compatibleVehicles: Array.isArray(updateFields.compatibleVehicles) ? updateFields.compatibleVehicles : allPartsList[partIdx].compatibleVehicles,
  };

  allPartsList[partIdx] = modifiedPart;
  await writePartsToStorage(allPartsList);

  return simulateNetworkDelay(modifiedPart);
}


(async () => {
    try {
        await verifyDataDirectory();
        await readPartsFromStorage();
    } catch (error) {
        console.error("FATAL: Failed to initialize parts data file:", error);
    }
})();
