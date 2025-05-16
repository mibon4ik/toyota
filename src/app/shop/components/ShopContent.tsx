
'use client';

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { getAutoPartsByCategory, getAllAutoParts} from '@/services/autoparts';
import type { AutoPart } from '@/types/autopart';
import Autopart from "@/app/components/autopart";
import {useToast} from "@/hooks/use-toast";
import {useSearchParams} from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";


interface ItemInCart extends AutoPart {
  quantity: number;
}

const productCategories = [
  { value: 'all', label: 'Все категории' },
  { value: 'Тормоза', label: 'Тормоза' },
  { value: 'Фильтры', label: 'Фильтры' },
  { value: 'Двигатель', label: 'Двигатель' },
  { value: 'Подвеска', label: 'Подвеска' },
  { value: 'Электрика', label: 'Электрика' },
  { value: 'Аксессуары', label: 'Аксессуары' },
  { value: 'Кузов', label: 'Кузов' },
  { value: 'Освещение', label: 'Освещение' },
  { value: 'Охлаждение', label: 'Охлаждение' },
  { value: 'Трансмиссия', label: 'Трансмиссия' },
  { value: 'Выхлопная система', label: 'Выхлопная система' },
  { value: 'Интерьер', label: 'Интерьер' },
];


export const ShopContent = () => {
  const [availableProducts, setAvailableProducts] = useState<AutoPart[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);
  const {toast: showAppToast} = useToast();
  const queryParams = useSearchParams();
  const initialCategoryFilter = queryParams.get('category') || 'all';
  const [currentCategory, setCurrentCategory] = useState(initialCategoryFilter);
   const [searchText, setSearchText] = useState('');
   const [componentHasMounted, setComponentHasMounted] = useState(false);

  const [cart, setCart] = useState<ItemInCart[]>([]);

   useEffect(() => {
     setComponentHasMounted(true);
     const cartFromStorage = localStorage.getItem('cartItems');
     if (cartFromStorage) {
       try {
         const parsedItems: ItemInCart[] = JSON.parse(cartFromStorage);
         if (Array.isArray(parsedItems) && parsedItems.every(item =>
             item && 
             typeof item.id === 'string' &&
             typeof item.name === 'string' &&
             typeof item.price === 'number' &&
             typeof item.quantity === 'number' &&
             typeof item.imageUrl === 'string'
         )) {
           setCart(parsedItems);
         } else {
           console.warn("Invalid cart data found in localStorage (ShopContent). Clearing cart.");
           localStorage.removeItem('cartItems');
           setCart([]);
         }
       } catch (e) {
         console.error("Error parsing cart items from localStorage (ShopContent):", e);
         localStorage.removeItem('cartItems');
          setCart([]);
       }
     } else {
         setCart([]);
     }
   }, []);

   useEffect(() => {
     if (componentHasMounted) {
       localStorage.setItem('cartItems', JSON.stringify(cart));
       window.dispatchEvent(new CustomEvent('cartUpdated'));
     }
   }, [cart, componentHasMounted]);

   const loadProducts = useCallback(async () => {
    setIsFetching(true);
    setFetchErrorMessage(null);
    try {
      const categoryParam = currentCategory === 'all' ? null : currentCategory;
      const baseProductList = categoryParam
                            ? await getAutoPartsByCategory(categoryParam)
                            : await getAllAutoParts();

      let productsToDisplay = baseProductList;
      if (searchText) {
        const lowerCaseSearch = searchText.toLowerCase();
        productsToDisplay = baseProductList.filter(product =>
          product.name.toLowerCase().includes(lowerCaseSearch) ||
          product.brand.toLowerCase().includes(lowerCaseSearch) ||
          (product.sku && product.sku.toLowerCase().includes(lowerCaseSearch)) ||
          product.category.toLowerCase().includes(lowerCaseSearch) ||
          (product.description && product.description.toLowerCase().includes(lowerCaseSearch))
        );
      }

      setAvailableProducts(productsToDisplay);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setFetchErrorMessage("Не удалось загрузить товары.");
       setTimeout(() => {
           showAppToast({ title: "Ошибка", description: err.message || "Не удалось загрузить товары.", variant: "destructive" });
       }, 0);
    } finally {
      setIsFetching(false);
    }
  }, [currentCategory, searchText, showAppToast]);

   useEffect(() => {
     if(componentHasMounted) {
        loadProducts();
     }
   }, [loadProducts, componentHasMounted]);

   useEffect(() => {
       const urlCategory = queryParams.get('category') || 'all';
       if (urlCategory !== currentCategory) {
           setCurrentCategory(urlCategory);
       }
   }, [queryParams, currentCategory]);

   const addItemToCart = useCallback((productToAdd: AutoPart) => {
     if (!componentHasMounted) return;
     
     setCart(prevCart => {
       const itemExistsIndex = prevCart.findIndex(item => item.id === productToAdd.id);
       let updatedCartItems;
       let toastTitle = "";
       let toastDescription = "";

       if (itemExistsIndex > -1) {
         updatedCartItems = prevCart.map((item, index) =>
           index === itemExistsIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
         );
         toastTitle = "Количество обновлено!";
         toastDescription = `Количество ${productToAdd.name} в корзине увеличено.`;
       } else {
         updatedCartItems = [...prevCart, { ...productToAdd, quantity: 1 }];
         toastTitle = "Товар добавлен в корзину!";
         toastDescription = `${productToAdd.name} был добавлен в вашу корзину.`;
       }
       
       setTimeout(() => {
            showAppToast({
                title: toastTitle,
                description: toastDescription,
            });
       }, 0);

       return updatedCartItems;
     });
   }, [showAppToast, componentHasMounted]);


  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     setSearchText(event.target.value);
   };

    const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        loadProducts();
    };

   const handleCategoryFilterChange = (newCategory: string) => {
     setCurrentCategory(newCategory);
   };

    const productDisplayGrid = useMemo(() => {
        if (!componentHasMounted) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, index) => (
                        <Card key={index} className="w-full overflow-hidden">
                             <CardHeader className="p-4"><Skeleton className="h-5 w-3/4" /></CardHeader>
                             <CardContent className="flex flex-col items-center p-4 pt-0">
                                <Skeleton className="h-28 w-full mb-3 rounded-md" />
                                <Skeleton className="h-4 w-1/3 mb-1" />
                                <Skeleton className="h-5 w-1/2 mb-3" />
                                <Skeleton className="h-9 w-full" />
                             </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (isFetching) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, index) => (
                        <Card key={index} className="w-full overflow-hidden">
                             <CardHeader className="p-4"><Skeleton className="h-5 w-3/4" /></CardHeader>
                             <CardContent className="flex flex-col items-center p-4 pt-0">
                                <Skeleton className="h-28 w-full mb-3 rounded-md" />
                                <Skeleton className="h-4 w-1/3 mb-1" />
                                <Skeleton className="h-5 w-1/2 mb-3" />
                                <Skeleton className="h-9 w-full" />
                             </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (fetchErrorMessage) {
            return <p className="text-center text-destructive col-span-full">{fetchErrorMessage}</p>;
        }

        if (availableProducts.length === 0) {
            return (
                <p className="text-center text-muted-foreground col-span-full">
                    Товары не найдены{searchText ? ` по запросу "${searchText}"` : ''}{currentCategory !== 'all' ? ` в категории "${productCategories.find(c => c.value === currentCategory)?.label}"` : ''}.
                </p>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {availableProducts.map((productItem) => (
                    <Autopart key={productItem.id} productInfo={productItem} onAddToCart={addItemToCart} />
                ))}
            </div>
        );
    }, [isFetching, fetchErrorMessage, availableProducts, searchText, currentCategory, addItemToCart, componentHasMounted]);


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Каталог автозапчастей</h1>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select value={currentCategory} onValueChange={handleCategoryFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((catOption) => (
                <SelectItem key={catOption.value} value={catOption.value}>
                  {catOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSearchFormSubmit} className="flex-grow flex gap-2 w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Поиск по названию, бренду, артикулу..."
            value={searchText}
            onChange={handleSearchInputChange}
            className="flex-grow"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Поиск</span>
          </Button>
        </form>
      </div>

       {productDisplayGrid}
    </div>
  );
};
