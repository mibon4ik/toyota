'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user';
import { UserList } from './components/UserList';
import { AddProductForm } from './components/AddProductForm';
import { ProductList } from './components/ProductList'; // Import ProductList
import { EditProductForm } from './components/EditProductForm'; // Import EditProductForm
import { getAllUsers, verifyPassword } from '@/lib/auth'; // Added verifyPassword for potential future checks
import { getAllAutoParts } from '@/services/autoparts'; // Import service to fetch products
import type { AutoPart } from '@/types/autopart'; // Import AutoPart type

const AdminPage = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [products, setProducts] = useState<AutoPart[]>([]); // State for products
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true); // Loading state for products
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null); // Error state for products
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AutoPart | null>(null);

  useEffect(() => {
    setIsMounted(true);
    console.log("AdminPage: Mounted.");
  }, []);

  const fetchProducts = useCallback(async () => {
     console.log("AdminPage: Fetching products...");
     setIsLoadingProducts(true);
     setErrorProducts(null);
      try {
        const fetchedProducts = await getAllAutoParts();
        console.log("AdminPage: Fetched products count:", fetchedProducts.length);
        setProducts(fetchedProducts);
      } catch (fetchError) {
        console.error("AdminPage: Failed to fetch products:", fetchError);
        setErrorProducts("Не удалось загрузить список товаров.");
        toast({
          title: "Ошибка загрузки товаров",
          description: "Не удалось загрузить список товаров. Попробуйте позже.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
        console.log("AdminPage: Finished fetching products.");
      }
  }, [toast]); // Added toast dependency

  const checkAdminAndFetchData = useCallback(async () => {
    if (!isMounted) {
      console.log("AdminPage: Skipping fetch on server.");
      return;
    }
     console.log("AdminPage: Running auth check and data fetch (client-side).");
     setIsLoadingUsers(true);
     setErrorUsers(null);

     const authTokenCookie = getCookie('authToken');
     const isLoggedInCookie = getCookie('isLoggedIn');
     const userCookie = getCookie('loggedInUser');
     let isAdmin = false;
     let loggedInUser: User | null = null;

     if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
         console.log("AdminPage: Found auth cookies.");
         try {
             loggedInUser = JSON.parse(userCookie);
             isAdmin = !!loggedInUser?.isAdmin;
             if (!isAdmin) console.log("AdminPage: User from cookie is not admin.");
         } catch (e) {
             console.error("AdminPage: Error parsing loggedInUser cookie:", e);
             isAdmin = false;
             // Clean up inconsistent state
             deleteCookie('authToken', { path: '/' });
             deleteCookie('isLoggedIn', { path: '/' });
             deleteCookie('loggedInUser', { path: '/' });
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUser');
                window.dispatchEvent(new Event('authStateChanged'));
             }
         }
     } else {
         console.log("AdminPage: Auth cookies not found or incomplete.");
          // Try restoring from localStorage
         const localIsLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
         const localUser = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
         if (localIsLoggedIn === 'true' && localUser) {
             console.log("AdminPage: Attempting login state restoration from localStorage.");
              try {
                 loggedInUser = JSON.parse(localUser);
                 isAdmin = !!loggedInUser?.isAdmin;
                  if (!isAdmin) {
                      console.log("AdminPage: User from localStorage is not admin.");
                  } else {
                      // Restore cookies if missing but localStorage is present (e.g., browser restart)
                      const token = btoa(JSON.stringify({ id: loggedInUser.id, username: loggedInUser.username, isAdmin: loggedInUser.isAdmin })); // Simplified token
                      const cookieOptions = { maxAge: 60 * 60 * 24 * 7, path: '/' };
                      setCookie('authToken', token, cookieOptions);
                      setCookie('isLoggedIn', 'true', cookieOptions);
                      setCookie('loggedInUser', JSON.stringify(loggedInUser), cookieOptions);
                       console.log("AdminPage: Restored cookies from localStorage.");
                  }
              } catch (e) {
                  console.error("AdminPage: Error parsing localStorage user data:", e);
                  isAdmin = false;
                   if (typeof window !== 'undefined') {
                     localStorage.removeItem('isLoggedIn');
                     localStorage.removeItem('loggedInUser');
                     window.dispatchEvent(new Event('authStateChanged'));
                   }
              }
         }
     }

     if (!isAdmin) {
         console.log("AdminPage: User is not admin or not logged in. Redirecting to login.");
          toast({
             title: "Доступ запрещен",
             description: "У вас нет прав для доступа к этой странице.",
             variant: "destructive",
         });
          // Clear cookies and localStorage just in case
          deleteCookie('authToken', { path: '/' });
          deleteCookie('isLoggedIn', { path: '/' });
          deleteCookie('loggedInUser', { path: '/' });
           if (typeof window !== 'undefined') {
             localStorage.removeItem('isLoggedIn');
             localStorage.removeItem('loggedInUser');
             window.dispatchEvent(new Event('authStateChanged'));
          }
          router.push('/auth/login');
          setIsLoadingUsers(false);
          return;
     }

     console.log("AdminPage: Admin access confirmed. Fetching data...");

     // Fetch Users
     try {
         const fetchedUsers = await getAllUsers();
         console.log("AdminPage: Fetched users count:", fetchedUsers.length);
         setUsers(fetchedUsers);
     } catch (fetchError) {
         console.error("AdminPage: Failed to fetch users:", fetchError);
         setErrorUsers("Не удалось загрузить список пользователей.");
         toast({
            title: "Ошибка загрузки пользователей",
            description: "Не удалось загрузить список пользователей. Попробуйте позже.",
            variant: "destructive",
        });
     } finally {
         setIsLoadingUsers(false);
     }

     // Fetch Products initially
     await fetchProducts(); // Ensure products are fetched after admin check


  }, [isMounted, router, toast, fetchProducts]);

  useEffect(() => {
    if (isMounted) { // Ensure checkAdminAndFetchData runs only after mount
        checkAdminAndFetchData();
    }
  }, [checkAdminAndFetchData, isMounted]); // Add isMounted dependency

  const handleLogout = useCallback(() => {
      console.log("AdminPage: Logout initiated.");
      deleteCookie('authToken', { path: '/' });
      deleteCookie('isLoggedIn', { path: '/' });
      deleteCookie('loggedInUser', { path: '/' });
      console.log("AdminPage: Cookies cleared.");

      if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('loggedInUser');
          console.log("AdminPage: localStorage cleared.");
          window.dispatchEvent(new Event('authStateChanged'));
          console.log("AdminPage: authStateChanged event dispatched.");
      } else {
           console.warn("AdminPage: window object not available during logout.");
      }
      console.log("AdminPage: Redirecting to login after logout.");
      router.push('/auth/login');
  }, [router]);

  const handleEditProduct = (product: AutoPart) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };


  const handleProductUpdated = useCallback((updatedProduct: AutoPart) => {
      console.log("AdminPage: Product updated, refetching product list...");
      // Refetch all products to ensure the list is up-to-date
      fetchProducts();
  }, [fetchProducts]);

   // Show loading indicator until mount and initial data fetch attempts are complete
   if (!isMounted || isLoadingUsers || isLoadingProducts) {
        return (
            <div className="container mx-auto py-8">
                <Card className="w-full p-4">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center mb-4">Панель администратора</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">Загрузка данных...</p>
                        {/* Optional: Add skeletons here */}
                    </CardContent>
                </Card>
            </div>
        );
    }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center mb-6">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent className="space-y-12">
           <UserList users={users} isLoading={isLoadingUsers} error={errorUsers} />

           <ProductList
             products={products}
             isLoading={isLoadingProducts}
             error={errorProducts}
             onEdit={handleEditProduct}
            />

           <AddProductForm />

            <EditProductForm
              product={selectedProduct}
              isOpen={isEditModalOpen}
              onClose={handleCloseEditModal}
              onProductUpdated={handleProductUpdated}
            />

        </CardContent>
          <div className="mt-8 flex justify-center">
            <Button onClick={handleLogout} variant="outline">Выйти</Button>
          </div>
      </Card>
    </div>
  );
};

export default AdminPage;
