
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/ui/mobile-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user';


interface CartItem {
  id: string;
  quantity: number;
}

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const updateCartCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        try {
          const cartItems: CartItem[] = JSON.parse(storedCart);
          if (Array.isArray(cartItems)) {
            const totalCount = cartItems.reduce((total: number, item: CartItem) => total + (item.quantity || 0), 0);
            setCartItemCount(totalCount);
          } else {
             setCartItemCount(0);
          }
        } catch (e) {
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    const deleteOptions = { path: '/' }; 

    deleteCookie('authToken', deleteOptions);
    deleteCookie('isLoggedIn', deleteOptions);
    deleteCookie('loggedInUser', deleteOptions);

    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');

        setIsLoggedIn(false);
        setLoggedInUser(null);

        window.dispatchEvent(new Event('authStateChanged'));
        // Force a full page navigation for clean state reset.
        window.location.assign('/auth/login');
    }
  }, []);


  const updateAuthState = useCallback(() => {
     if (typeof window === 'undefined') {
         return;
     }

    const authTokenCookie = getCookie('authToken');
    const isLoggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');

    let derivedIsLoggedIn = false;
    let derivedUser: User | null = null;

    if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
        try {
            derivedUser = JSON.parse(userCookie as string);
            if (derivedUser && derivedUser.id && derivedUser.username) {
                derivedIsLoggedIn = true;
            } else {
                 derivedUser = null; 
            }
        } catch (e) {
            console.error("MainNav: Error parsing loggedInUser cookie:", e);
            derivedUser = null; 
            // Clear potentially corrupted cookies
            deleteCookie('authToken', { path: '/' });
            deleteCookie('isLoggedIn', { path: '/' });
            deleteCookie('loggedInUser', { path: '/' });
        }
    }

    // Fallback to localStorage for UI consistency, but cookies are source of truth
    if (!derivedIsLoggedIn) {
        const loggedInLocalStorage = localStorage.getItem('isLoggedIn');
        const userLocalStorage = localStorage.getItem('loggedInUser');
        if (loggedInLocalStorage === 'true' && userLocalStorage) {
            try {
                const localUserParsed: User = JSON.parse(userLocalStorage);
                 if (localUserParsed && localUserParsed.id && localUserParsed.username) {
                     derivedUser = localUserParsed;
                     derivedIsLoggedIn = true; 
                 }
            } catch (e) {
                 localStorage.removeItem('isLoggedIn');
                 localStorage.removeItem('loggedInUser');
                 derivedUser = null;
                 derivedIsLoggedIn = false;
            }
        }
    }

    if (!derivedIsLoggedIn && (localStorage.getItem('isLoggedIn') || localStorage.getItem('loggedInUser'))) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
    }
    
    setIsLoggedIn(current => current !== derivedIsLoggedIn ? derivedIsLoggedIn : current);
    setLoggedInUser(current => JSON.stringify(current) !== JSON.stringify(derivedUser) ? derivedUser : current);

  }, []);


   useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
            // Initial auth and cart state update
            updateAuthState();
            updateCartCount();
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cartItems') {
                updateCartCount();
            }
             if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') {
                 updateAuthState();
            }
        };

        const handleAuthStateChanged = () => {
             console.log("MainNav: authStateChanged event received");
             updateAuthState();
        };
        const handleCartUpdated = () => {
             updateCartCount();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authStateChanged', handleAuthStateChanged);
        window.addEventListener('cartUpdated', handleCartUpdated);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authStateChanged', handleAuthStateChanged);
            window.removeEventListener('cartUpdated', handleCartUpdated);
        };
    }, [isMounted, updateAuthState, updateCartCount]);


   const navigateToCart = () => {
        router.push('/cart');
   };

    if (!isMounted) {
        return (
            <div className={cn("flex h-16 w-full shrink-0 items-center px-6 border-b shadow-sm", className)} {...props}>
                <MobileNav className="mr-4"/>
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
       <MobileNav className="mr-4"/>
       <Link href="/" className="mr-6 flex items-center space-x-2">
         <Icons.truck className="h-6 w-6" />
         <span className="hidden font-bold sm:inline-block">Toyota</span>
       </Link>
       <nav className="hidden md:flex items-center space-x-4 flex-grow">
         <Link href="/shop" className={cn(
           "text-sm font-medium transition-colors hover:text-foreground",
           pathname === "/shop" ? "text-foreground" : "text-muted-foreground"
         )}>
           Магазин
         </Link>
          <Link href="/cart" className={cn(
             "text-sm font-medium transition-colors hover:text-foreground",
             pathname === "/cart" ? "text-foreground" : "text-muted-foreground"
           )}>
             Корзина
           </Link>
           <Link href="/checkout" className={cn(
             "text-sm font-medium transition-colors hover:text-foreground",
             pathname === "/checkout" ? "text-foreground" : "text-muted-foreground"
           )}>
             Оформление
           </Link>
           <Link href="/contacts" className={cn(
               "text-sm font-medium transition-colors hover:text-foreground",
               pathname === "/contacts" ? "text-foreground" : "text-muted-foreground"
           )}>
             Контакты
           </Link>
       </nav>
       <div className="ml-auto flex items-center space-x-4">
           <Button size="sm" variant="ghost" className="relative" onClick={navigateToCart}>
               <Icons.shoppingCart className="h-4 w-4" />
               <span className="sr-only">Корзина</span>
               {cartItemCount > 0 && (
                 <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs" style={{ backgroundColor: '#8dc572' }}>
                   {cartItemCount}
                 </Badge>
               )}
             </Button>

           {isLoggedIn && loggedInUser ? (
             <>
                 <Avatar className="h-8 w-8">
                    <AvatarFallback>{loggedInUser.firstName?.[0]?.toUpperCase()}{loggedInUser.lastName?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
               <span className="text-sm font-medium hidden sm:inline-block">{loggedInUser.firstName} {loggedInUser.lastName}</span>
               {loggedInUser.isAdmin && (
                 <Link href="/admin" passHref legacyBehavior={false}>
                   <Button size="sm" variant="outline">
                     Админ панель
                   </Button>
                 </Link>
               )}
               <Button size="sm" variant="ghost" onClick={handleLogout}>
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
