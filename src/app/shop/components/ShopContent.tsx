'use client';

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { getAutoPartsByCategory} from "@/services/autoparts";
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


interface CartItem extends AutoPart {
  quantity: number;
}

const categories = [
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
  const [products, setProducts] = useState<AutoPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
   const [searchTerm, setSearchTerm] = useState('');
   const [isMounted, setIsMounted] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

   useEffect(() => {
     setIsMounted(true);
     const storedCart = localStorage.getItem('cartItems');
     if (storedCart) {
       try {
         const parsedCart: CartItem[] = JSON.parse(storedCart);
         if (Array.isArray(parsedCart) && parsedCart.every(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.price === 'number' && typeof item.quantity === 'number')) {
           setCartItems(parsedCart);
         } else {
           console.warn("Invalid cart data found in localStorage. Clearing cart.");
           localStorage.removeItem('cartItems');
         }
       } catch (e) {
         console.error("Error parsing cart items from localStorage:", e);
         localStorage.removeItem('cartItems');
       }
     }
   }, []);

   useEffect(() => {
     if (isMounted) {
       localStorage.setItem('cartItems', JSON.stringify(cartItems));
       window.dispatchEvent(new CustomEvent('cartUpdated'));
     }
   }, [cartItems, isMounted]);

   const fetchProducts = useCallback(async () => {
    console.log(`Fetching products for category: ${selectedCategory}, search: ${searchTerm}`);
    setIsLoading(true);
    setError(null);
    try {
      const categoryToFetch = selectedCategory === 'all' ? null : selectedCategory;
      const allCategoryParts = await getAutoPartsByCategory(categoryToFetch);
      console.log(`Fetched ${allCategoryParts.length} parts for category ${selectedCategory}`);

      let filteredProducts = allCategoryParts;
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredProducts = allCategoryParts.filter(product =>
          product.name.toLowerCase().includes(lowerSearchTerm) ||
          product.brand.toLowerCase().includes(lowerSearchTerm) ||
          (product.sku && product.sku.toLowerCase().includes(lowerSearchTerm)) ||
          product.category.toLowerCase().includes(lowerSearchTerm) ||
          (product.description && product.description.toLowerCase().includes(lowerSearchTerm))
        );
         console.log(`Filtered to ${filteredProducts.length} parts based on search term "${searchTerm}"}`);
      } else {
           console.log(`No search term, showing all ${filteredProducts.length} parts for the category.`);
      }

      setProducts(filteredProducts);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError("Не удалось загрузить товары.");
       // Defer toast to prevent state update during render
       setTimeout(() => {
           toast({ title: "Ошибка", description: err.message || "Не удалось загрузить товары.", variant: "destructive" });
       }, 0);
    } finally {
      setIsLoading(false);
      console.log("Finished fetching products.");
    }
  }, [selectedCategory, searchTerm, toast]);

   useEffect(() => {
     if(isMounted) {
        fetchProducts();
     }
   }, [fetchProducts, isMounted]);

   useEffect(() => {
       const categoryFromUrl = searchParams.get('category') || 'all';
       if (categoryFromUrl !== selectedCategory) {
           setSelectedCategory(categoryFromUrl);
       }
   }, [searchParams, selectedCategory]);

   const handleAddToCart = useCallback((product: AutoPart) => {
     if (!isMounted) return;
     console.log("Adding to cart:", product.name);

     setCartItems(currentItems => {
       const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
       let updatedCart;
       let toastTitle = "";
       let toastDescription = "";

       if (existingItemIndex > -1) {
         updatedCart = currentItems.map((item, index) =>
           index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
         );
         toastTitle = "Количество обновлено!";
         toastDescription = `Количество ${product.name} в корзине увеличено.`;
       } else {
         updatedCart = [...currentItems, { ...product, quantity: 1 }];
         toastTitle = "Товар добавлен в корзину!";
         toastDescription = `${product.name} был добавлен в вашу корзину.`;
       }
        console.log("Updated cart state (pending):", updatedCart);

       setTimeout(() => {
            toast({
                title: toastTitle,
                description: toastDescription,
            });
            console.log("Toast displayed for:", product.name);
       }, 0);

       return updatedCart;
     });
   }, [toast, isMounted]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     setSearchTerm(event.target.value);
   };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Search submitted with term:", searchTerm);
        fetchProducts();
    };

   const handleCategoryChange = (value: string) => {
     console.log("Category changed to:", value);
     setSelectedCategory(value);
   };

    const displayedProducts = useMemo(() => {
        if (isLoading) {
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

        if (error) {
            return <p className="text-center text-destructive col-span-full">{error}</p>;
        }

        if (products.length === 0) {
            return (
                <p className="text-center text-muted-foreground col-span-full">
                    Товары не найдены{searchTerm ? ` по запросу "${searchTerm}"` : ''}{selectedCategory !== 'all' ? ` в категории "${categories.find(c => c.value === selectedCategory)?.label}"` : ''}.
                </p>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                    <Autopart key={product.id} product={product} onAddToCart={handleAddToCart} data-ai-hint={`${product.category} ${product.brand}`} />
                ))}
            </div>
        );
    }, [isLoading, error, products, searchTerm, selectedCategory, handleAddToCart]);


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Каталог автозапчастей</h1>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-grow flex gap-2 w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Поиск по названию, бренду, артикулу..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Поиск</span>
          </Button>
        </form>
      </div>

       {displayedProducts}
    </div>
  );
};

    