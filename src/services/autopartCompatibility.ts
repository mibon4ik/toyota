
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { AutoPart } from '@/types/autopart';
import type { Vehicle } from '@/types/vehicle';

const partsDataFile = path.join(process.cwd(), 'src', 'data', 'autoparts.json');
const vehiclesDataFile = path.join(process.cwd(), 'src', 'data', 'vehicles.json');
const dataFilesDir = path.dirname(partsDataFile);

const ensureDataDirectory = async (): Promise<void> => {
  try {
    await fs.access(dataFilesDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dataFilesDir, { recursive: true });
    } else {
      console.error("Error accessing data directory:", error);
      throw new Error("Could not access data directory.");
    }
  }
};

async function loadPartsData(): Promise<AutoPart[]> {
  await ensureDataDirectory();
  try {
    const fileContent = await fs.readFile(partsDataFile, 'utf-8');
    return JSON.parse(fileContent || '[]');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await savePartsData([]);
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

async function savePartsData(partsList: AutoPart[]): Promise<void> {
  await ensureDataDirectory();
  try {
     if (!Array.isArray(partsList)) {
        console.error("Invalid parts data provided to savePartsData:", partsList);
        throw new Error("Attempted to write invalid parts data.");
      }
    await fs.writeFile(partsDataFile, JSON.stringify(partsList, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing autoparts file:", error);
    throw new Error("Could not save autoparts data.");
  }
}

async function loadVehiclesData(): Promise<Vehicle[]> {
    await ensureDataDirectory();
    try {
      const fileContent = await fs.readFile(vehiclesDataFile, 'utf-8');
      return JSON.parse(fileContent || '[]');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      if (error instanceof SyntaxError) {
          console.error("Error parsing vehicles.json:", error);
          return [];
      }
      console.error("Error reading vehicles file:", error);
      throw new Error("Could not read vehicle data.");
    }
  }

function delayResponse<T>(data: T, duration = 100): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), duration));
}


export async function getPartsByVin(vin: string): Promise<AutoPart[]> {
  const vehicleInfo = await getVehicleByVin(vin);
  if (!vehicleInfo) {
    return delayResponse([]);
  }
   return getPartsByMakeModel(vehicleInfo.make, vehicleInfo.model);
}

export async function getPartsByMakeModel(makeName: string, modelName: string): Promise<AutoPart[]> {
   const allAutoParts = await loadPartsData();
  if (!makeName || !modelName) {
    return delayResponse([]);
  }
  const lowerCaseMake = makeName.toLowerCase();
  const lowerCaseModel = modelName.toLowerCase();

  const matchingParts = allAutoParts.filter(part =>
    part.compatibleVehicles.some(v => {
      const lowerV = v.toLowerCase();
      return lowerV.includes(lowerCaseMake) && lowerV.includes(lowerCaseModel);
    }) || part.compatibleVehicles.some(v => v.toLowerCase().includes('большинство моделей') || v.toLowerCase().includes('различные модели'))
  );

  return delayResponse(matchingParts);
}


export async function getVehicleByVin(vinToFind: string): Promise<Vehicle | null> {
  if (!vinToFind) return delayResponse(null);
  const allVehicles = await loadVehiclesData();
  const upperCaseVin = vinToFind.toUpperCase();
  const foundVehicle = allVehicles.find(v => v.vin.toUpperCase() === upperCaseVin);
  return delayResponse(foundVehicle || null);
}


(async () => {
    try {
        await ensureDataDirectory();
        await loadPartsData();
        await loadVehiclesData();
    } catch (error) {
        console.error("FATAL: Failed to initialize data files for compatibility service:", error);
    }
})();
