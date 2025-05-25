
'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { getCookie } from 'cookies-next';
import type { StoredUser } from '@/types/user';

interface CartItemType {
  id: string;
  quantity: number;
}

interface NavigationProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: NavigationProps) {
  const currentPath = usePathname();
  const appRouter = useRouter();
  const [cartQuantity, setCartQuantity] = useState(0);
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const refreshCartCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      const cartData = localStorage.getItem('cartItems');
      if (cartData) {
        try {
          const items: CartItemType[] = JSON.parse(cartData);
          if (Array.isArray(items)) {
            const totalItems = items.reduce((total: number, item: CartItemType) => total + (item.quantity || 0), 0);
            setCartQuantity(totalItems);
          } else {
             setCartQuantity(0);
          }
        } catch (e) {
          setCartQuantity(0);
        }
      } else {
        setCartQuantity(0);
      }
    }
  }, []);

  const refreshAuthState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isLoggedInCookie = getCookie('isLoggedIn');
    const userDataCookieString = getCookie('loggedInUser');
    
    let isAuthenticated = false;
    let user: StoredUser | null = null;

    if (isLoggedInCookie === 'true' && userDataCookieString) {
      try {
        const userObj = JSON.parse(userDataCookieString as string) as StoredUser;
        if (userObj && userObj.id) {
          isAuthenticated = true;
          user = userObj;
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('loggedInUser', JSON.stringify(userObj));
        }
      } catch (e) {
         console.warn("MainNav: Error parsing loggedInUser cookie", e);
      }
    } else {
        const lsLoggedIn = localStorage.getItem('isLoggedIn');
        const lsUserData = localStorage.getItem('loggedInUser');
        if (lsLoggedIn === 'true' && lsUserData) {
            try {
                const userObj = JSON.parse(lsUserData) as StoredUser;
                if (userObj && userObj.id) {
                    isAuthenticated = true;
                    user = userObj;
                }
            } catch (e) {
                 console.warn("MainNav: Error parsing loggedInUser from localStorage", e);
            }
        }
    }
    
    if (!isAuthenticated) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
    }

    setUserIsAuthenticated(isAuthenticated);
    setCurrentUser(user);
    console.log("MainNav: Refreshed Auth State - isLoggedIn:", isAuthenticated, "User:", user);

  }, []); 

  const logOutUser = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
    }
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("MainNav: Logout API call failed:", error);
    }
    
    setUserIsAuthenticated(false);
    setCurrentUser(null);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authStateChanged'));
    }
    
    appRouter.replace('/auth/login');
    appRouter.refresh(); 
  }, [appRouter]);

   useEffect(() => {
        setHasMounted(true);
        refreshAuthState(); 
        refreshCartCount(); 
    }, [refreshAuthState, refreshCartCount]); 

   useEffect(() => {
        if (!hasMounted) return;

        const handleStorageEvents = (event: StorageEvent) => {
            if (event.key === 'cartItems') refreshCartCount();
            if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') {
                refreshAuthState();
            }
        };
        const handleAuthChangeEvent = () => refreshAuthState();
        const handleCartChangeEvent = () => refreshCartCount();

        window.addEventListener('storage', handleStorageEvents);
        window.addEventListener('authStateChanged', handleAuthChangeEvent);
        window.addEventListener('cartUpdated', handleCartChangeEvent);

        return () => {
            window.removeEventListener('storage', handleStorageEvents);
            window.removeEventListener('authStateChanged', handleAuthChangeEvent);
            window.removeEventListener('cartUpdated', handleCartChangeEvent);
        };
    }, [hasMounted, refreshAuthState, refreshCartCount]);


   const goToCartPage = () => {
        appRouter.push('/cart');
   };

    if (!hasMounted) {
        return (
            <div className={cn("flex h-16 w-full shrink-0 items-center px-6 border-b shadow-sm", className)} {...props}>
                <Link href="/" className="mr-6 flex items-center space-x-2">
                     <Icons.truck className="h-6 w-6" />
                     <span className="hidden font-bold sm:inline-block">Toyota</span>
                </Link>
                <nav className="hidden md:flex items-center space-x-4 flex-grow">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                </nav>
                 <div className="ml-auto flex items-center space-x-4">
                     <Button size="sm" variant="ghost" className="relative" disabled>
                          <Icons.shoppingCart className="h-4 w-4" />
                          <span className="sr-only">Корзина</span>
                      </Button>
                     <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                 </div>
            </div>
        );
    }

   return (
     <div className={cn("flex h-16 w-full shrink-0 items-center px-6 border-b shadow-sm", className)} {...props}>
       <Link href="/" className="mr-6 flex items-center space-x-2">
         <Icons.truck className="h-6 w-6" />
         <span className="hidden font-bold sm:inline-block">Toyota</span>
       </Link>
       <nav className="hidden md:flex items-center space-x-4 flex-grow">
         <Link href="/shop" className={cn(
           "text-sm font-medium transition-colors hover:text-foreground",
           currentPath === "/shop" ? "text-foreground" : "text-muted-foreground"
         )}>
           Магазин
         </Link>
          <Link href="/cart" className={cn(
             "text-sm font-medium transition-colors hover:text-foreground",
             currentPath === "/cart" ? "text-foreground" : "text-muted-foreground"
           )}>
             Корзина
           </Link>
           <Link href="/checkout" className={cn(
             "text-sm font-medium transition-colors hover:text-foreground",
             currentPath === "/checkout" ? "text-foreground" : "text-muted-foreground"
           )}>
             Оформление
           </Link>
           <Link href="/contacts" className={cn(
               "text-sm font-medium transition-colors hover:text-foreground",
               currentPath === "/contacts" ? "text-foreground" : "text-muted-foreground"
           )}>
             Контакты
           </Link>
           {userIsAuthenticated && (
             <Link href="/dashboard" className={cn(
               "text-sm font-medium transition-colors hover:text-foreground",
               currentPath === "/dashboard" ? "text-foreground" : "text-muted-foreground"
             )}>
               Личный кабинет
             </Link>
           )}
       </nav>
       <div className="ml-auto flex items-center space-x-4">
           <Button size="sm" variant="ghost" className="relative" onClick={goToCartPage}>
               <Icons.shoppingCart className="h-4 w-4" />
               <span className="sr-only">Корзина</span>
               {cartQuantity > 0 && (
                 <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs" style={{ backgroundColor: '#8dc572' }}>
                   {cartQuantity}
                 </Badge>
               )}
             </Button>

           {userIsAuthenticated && currentUser ? (
             <>
                 <Avatar className="h-8 w-8">
                    <AvatarFallback>{currentUser.firstName?.[0]?.toUpperCase()}{currentUser.lastName?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
               <span className="text-sm font-medium hidden sm:inline-block">{currentUser.firstName} {currentUser.lastName}</span>
               {currentUser.isAdmin && (
                 <Link href="/admin" passHref legacyBehavior={false}>
                   <Button size="sm" variant="outline">
                     Админ панель
                   </Button>
                 </Link>
               )}
               <Button size="sm" variant="ghost" onClick={logOutUser}>
                 Выйти
               </Button>
             </>
           ) : (
             <Link href="/auth/login" passHref legacyBehavior={false}>
               <Button size="sm" variant="ghost">
                 Войти
               </Button>
             </Link>
           )}
       </div>
     </div>
   )
}
