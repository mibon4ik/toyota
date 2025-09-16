
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
import { Search, XCircle } from 'lucide-react'; // Added XCircle
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from '@/components/icons'; // Added Icons


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
   const [searchText, setSearchText] = useState(queryParams.get('search') || '');
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
           localStorage.removeItem('cartItems');
           setCart([]);
         }
       } catch (e) {
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
      setFetchErrorMessage("Не удалось загрузить товары.");
      showAppToast({ title: "Ошибка", description: err.message || "Не удалось загрузить товары.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }, [currentCategory, searchText, showAppToast]);

   useEffect(() => {
     if(componentHasMounted) {
        loadProducts();
        // Update URL to reflect current filters
        const params = new URLSearchParams();
        if (currentCategory !== 'all') params.set('category', currentCategory);
        if (searchText) params.set('search', searchText);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
     }
   }, [loadProducts, componentHasMounted, currentCategory, searchText]);

   useEffect(() => {
       const urlCategory = queryParams.get('category') || 'all';
       if (urlCategory !== currentCategory) {
           setCurrentCategory(urlCategory);
       }
       const urlSearch = queryParams.get('search') || '';
       if (urlSearch !== searchText) {
           setSearchText(urlSearch);
       }
   }, [queryParams, currentCategory, searchText]);

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
       
       showAppToast({
           title: toastTitle,
           description: toastDescription,
       });

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

   const clearSearch = () => {
       setSearchText('');
   }

    const productDisplayGrid = useMemo(() => {
        if (!componentHasMounted || isFetching) { // Combine loading states
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
                <div className="text-center text-muted-foreground col-span-full py-10">
                    <Icons.search className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                    <p className="text-lg">
                        Товары не найдены
                        {searchText ? <> по запросу "<strong>{searchText}</strong>"</> : ''}
                        {currentCategory !== 'all' ? <> в категории "<strong>{productCategories.find(c => c.value === currentCategory)?.label}</strong>"</> : ''}.
                    </p>
                    <p className="text-sm mt-2">Попробуйте изменить фильтры или поисковый запрос.</p>
                </div>
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

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center sticky top-16 bg-background py-4 z-30 border-b">
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

        <form onSubmit={handleSearchFormSubmit} className="flex-grow flex gap-2 w-full sm:w-auto relative">
          <Input
            type="search"
            placeholder="Поиск по названию, бренду, артикулу..."
            value={searchText}
            onChange={handleSearchInputChange}
            className="flex-grow pr-10" 
          />
          {searchText && (
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive" 
                onClick={clearSearch}
                aria-label="Очистить поиск"
            >
                <XCircle className="h-4 w-4"/>
            </Button>
          )}
          <Button type="submit" variant="outline" size="icon" aria-label="Поиск">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

       {productDisplayGrid}
    </div>
  );
};
