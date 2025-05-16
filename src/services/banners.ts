
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Banner } from '@/types/banner';

const bannersStoragePath = path.join(process.cwd(), 'src', 'data', 'banners.json');
const storageDirectory = path.dirname(bannersStoragePath);

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

async function readBannersFromStorage(): Promise<Banner[]> {
  await verifyDataDirectory();
  try {
    const fileData = await fs.readFile(bannersStoragePath, 'utf-8');
    return JSON.parse(fileData || '[]');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const defaultBanners: Banner[] = [
        {
          id: "default-banner-1",
          title: "Летняя распродажа - скидки до 50%",
          imageUrl: "https://placehold.co/1200x400.png",
          buttonText: "Купить сейчас",
          link: "/shop?sale=true",
          imageHint: "car parts summer sale",
          isActive: true,
          dataAiHint: "summer sale car"
        },
        {
          id: "default-banner-2",
          title: "Новые поступления - ознакомьтесь с последними деталями",
          imageUrl: "https://placehold.co/1200x400.png",
          buttonText: "Посмотреть новинки",
          link: "/shop?sort=newest",
          imageHint: "new car parts arrivals",
          isActive: true,
          dataAiHint: "new arrivals auto"
        }
      ];
      await writeBannersToStorage(defaultBanners);
      return defaultBanners;
    }
    if (error instanceof SyntaxError) {
      console.error("Error parsing banners.json:", error);
      return []; 
    }
    console.error("Error reading banners file:", error);
    throw new Error("Could not read banners data.");
  }
}

async function writeBannersToStorage(bannersArray: Banner[]): Promise<void> {
  await verifyDataDirectory();
  try {
    if (!Array.isArray(bannersArray)) {
      console.error("Invalid banners data provided to writeBannersToStorage:", bannersArray);
      throw new Error("Attempted to write invalid banners data.");
    }
    await fs.writeFile(bannersStoragePath, JSON.stringify(bannersArray, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing banners file:", error);
    throw new Error("Could not save banners data.");
  }
}

function simulateNetworkDelay<T>(data: T, delayMs = 50): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delayMs));
}

export async function getAllBanners(): Promise<Banner[]> {
  const allBannersList = await readBannersFromStorage();
  return simulateNetworkDelay(allBannersList);
}

export async function getActiveBanners(): Promise<Banner[]> {
  const allBannersList = await readBannersFromStorage();
  const activeBanners = allBannersList.filter(banner => banner.isActive);
  return simulateNetworkDelay(activeBanners);
}

export async function getBannerById(idValue: string): Promise<Banner | null> {
  const allBannersList = await readBannersFromStorage();
  const foundBanner = allBannersList.find(b => b.id === idValue);
  return simulateNetworkDelay(foundBanner || null);
}

export async function addBanner(bannerDetails: Omit<Banner, 'id'>): Promise<Banner> {
  if (!bannerDetails || typeof bannerDetails !== 'object' || !bannerDetails.title) {
    throw new Error("Некорректные данные для добавления баннера.");
  }

  const allBannersList = await readBannersFromStorage();
  const uniqueId = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newBannerRecord: Banner = {
    ...bannerDetails,
    id: uniqueId,
    isActive: bannerDetails.isActive !== undefined ? bannerDetails.isActive : true,
  };

  allBannersList.push(newBannerRecord);
  await writeBannersToStorage(allBannersList);
  
  return newBannerRecord;
}

export async function updateBanner(bannerIdToUpdate: string, dataToUpdate: Partial<Omit<Banner, 'id'>>): Promise<Banner> {
  if (!bannerIdToUpdate || !dataToUpdate || typeof dataToUpdate !== 'object') {
    throw new Error("Некорректные данные для обновления баннера.");
  }

  const allBannersList = await readBannersFromStorage();
  const bannerIdx = allBannersList.findIndex(b => b.id === bannerIdToUpdate);

  if (bannerIdx === -1) {
    throw new Error(`Баннер с ID "${bannerIdToUpdate}" не найден.`);
  }

  const { id, ...updateFields } = dataToUpdate;

  const modifiedBanner: Banner = {
    ...allBannersList[bannerIdx],
    ...updateFields,
    isActive: updateFields.isActive !== undefined ? updateFields.isActive : allBannersList[bannerIdx].isActive,
  };

  allBannersList[bannerIdx] = modifiedBanner;
  await writeBannersToStorage(allBannersList);

  return simulateNetworkDelay(modifiedBanner);
}

export async function deleteBanner(bannerIdToDelete: string): Promise<void> {
  if (!bannerIdToDelete) {
    throw new Error("ID баннера для удаления не указан.");
  }
  let allBannersList = await readBannersFromStorage();
  const initialLength = allBannersList.length;
  allBannersList = allBannersList.filter(b => b.id !== bannerIdToDelete);

  if (allBannersList.length === initialLength) {
    throw new Error(`Баннер с ID "${bannerIdToDelete}" не найден для удаления.`);
  }
  await writeBannersToStorage(allBannersList);
}

(async () => {
  try {
    await verifyDataDirectory();
    await readBannersFromStorage(); 
  } catch (error) {
    console.error("FATAL: Failed to initialize banners data file:", error);
  }
})();
