
'use client';

import React, {useState, useEffect, useCallback} from 'react';
import { getAutoPartsByCategory} from "@/services/autoparts";
import type { AutoPart } from '@/types/autopart'; // Corrected import path
import Autopart from "@/app/components/autopart"; // Ensure correct path to Autopart component
import {useToast} from "@/hooks/use-toast";
import {useSearchParams} from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Import Card components

// Define CartItem extending AutoPart with quantity
interface CartItem extends AutoPart {
  quantity: number;
}

// Example categories (fetch dynamically in a real app)
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


const ShopPage = () => {
  const [products, setProducts] = useState<AutoPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
   const [searchTerm, setSearchTerm] = useState(''); // State for search input
   const [isMounted, setIsMounted] = useState(false); // Track client mount


  // Cart state and persistence (could be moved to a global context/store)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

   // Load cart from localStorage on mount (client-side only)
   useEffect(() => {
     setIsMounted(true);
     const storedCart = localStorage.getItem('cartItems');
     if (storedCart) {
       try {
         const parsedCart: CartItem[] = JSON.parse(storedCart);
         // Basic validation of parsed cart items
         if (Array.isArray(parsedCart) && parsedCart.every(item => item.id && item.name && typeof item.price === 'number' && typeof item.quantity === 'number')) {
           setCartItems(parsedCart);
         } else {
           console.warn("Invalid cart data found in localStorage. Clearing cart.");
           localStorage.removeItem('cartItems');
         }
       } catch (e) {
         console.error("Error parsing cart items from localStorage:", e);
         localStorage.removeItem('cartItems'); // Clear corrupted data
       }
     }
   }, []);


   // Update local storage whenever cartItems state changes (client-side only)
   useEffect(() => {
     if (isMounted) { // Only run on client after initial mount
       localStorage.setItem('cartItems', JSON.stringify(cartItems));
       // Optional: Dispatch a custom event to notify other components (like navbar badge)
       window.dispatchEvent(new CustomEvent('cartUpdated'));
     }
   }, [cartItems, isMounted]);


  // Fetch products based on category and search term
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        // In a real app, the API/service should handle combined filtering
        // Here, we simulate: Fetch by category first, then filter by search term client-side
      const categoryProducts = await getAutoPartsByCategory(selectedCategory);

       let filteredProducts = categoryProducts;
        if (searchTerm) {
             const lowerSearchTerm = searchTerm.toLowerCase();
             filteredProducts = categoryProducts.filter(product =>
                 product.name.toLowerCase().includes(lowerSearchTerm) ||
                 product.brand.toLowerCase().includes(lowerSearchTerm) ||
                 (product.sku && product.sku.toLowerCase().includes(lowerSearchTerm))
             );
        }

      setProducts(filteredProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Не удалось загрузить товары.");
      // Defer toast call slightly to avoid state update during render
      setTimeout(() => toast({ title: "Ошибка", description: "Не удалось загрузить товары.", variant: "destructive" }), 0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchTerm, toast]); // Add searchTerm dependency

   useEffect(() => {
     fetchProducts();
   }, [fetchProducts]); // Fetch when category or search term changes


  const handleAddToCart = useCallback((product: AutoPart) => {
     if (!isMounted) return; // Don't run if not mounted

    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      let updatedCart;
      let toastTitle = "";
      let toastDescription = "";


      if (existingItemIndex > -1) {
        // If item exists, increment quantity
        updatedCart = currentItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item // Ensure quantity exists
        );
         toastTitle = "Количество обновлено!";
         toastDescription = `Количество ${product.name} в корзине увеличено.`;
      } else {
        // If item doesn't exist, add it with quantity 1
        updatedCart = [...currentItems, { ...product, quantity: 1 }];
         toastTitle = "Товар добавлен в корзину!";
         toastDescription = `${product.name} был добавлен в вашу корзину.`;
      }

       // Schedule the toast to appear after the current state update cycle
       setTimeout(() => {
            toast({
                title: toastTitle,
                description: toastDescription,
            });
       }, 0);

      return updatedCart;
    });
  }, [toast, isMounted, setCartItems]); // Add isMounted and setCartItems


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     setSearchTerm(event.target.value);
   };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        fetchProducts(); // Re-fetch based on current search term and category
    };

   const handleCategoryChange = (value: string) => {
     setSelectedCategory(value);
     // Optional: Update URL search params if desired for shareable links
     // const params = new URLSearchParams(window.location.search);
     // params.set('category', value);
     // window.history.pushState({}, '', `${window.location.pathname}?${params}`);
   };


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Каталог автозапчастей</h1>

        {/* Filters and Search Section */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
             {/* Category Select */}
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

            {/* Search Input */}
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

       {/* Product Grid */}
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"> {/* Adjusted grid columns and gap */}
                {/* Skeleton Loaders - Adjusted number to 8 */}
                {[...Array(8)].map((_, index) => (
                    <Card key={index} className="w-full">
                        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                        <CardContent className="flex flex-col items-center p-4"> {/* Adjusted padding */}
                            <Skeleton className="h-32 w-full mb-4 rounded-md" />
                            <Skeleton className="h-4 w-1/4 mb-2" />
                            <Skeleton className="h-6 w-1/2 mb-4" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : error ? (
            <p className="text-center text-destructive">{error}</p>
        ) : products.length === 0 ? (
             <p className="text-center text-muted-foreground">Товары не найдены{searchTerm ? ` по запросу "${searchTerm}"` : ''}{selectedCategory !== 'all' ? ` в категории "${categories.find(c => c.value === selectedCategory)?.label}"` : ''}.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"> {/* Adjusted grid columns and gap */}
                {products.map((product) => (
                     // Pass handleAddToCart to Autopart component
                    <Autopart key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
            </div>
        )}
    </div>
  );
};

export default ShopPage;

