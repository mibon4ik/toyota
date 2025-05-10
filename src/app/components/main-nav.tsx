"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
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
          console.error("MainNav: Error parsing cart items from localStorage for count:", e);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    console.log("MainNav: handleLogout called.");
    const deleteOptions = { path: '/' };

    deleteCookie('authToken', deleteOptions);
    deleteCookie('isLoggedIn', deleteOptions);
    deleteCookie('loggedInUser', deleteOptions);

    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');

        setIsLoggedIn(false);
        setLoggedInUser(null);

        console.log("MainNav: Dispatching authStateChanged event after logout.");
        window.dispatchEvent(new Event('authStateChanged'));
        router.replace('/auth/login');
    }
  }, [router]);


  const updateAuthState = useCallback(() => {
     if (typeof window === 'undefined') {
         console.log("MainNav: updateAuthState called on server, returning.");
         return;
     }
    console.log("MainNav: updateAuthState called on client.");

    const authTokenCookie = getCookie('authToken');
    const isLoggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    console.log(`MainNav: Cookies read - authToken: ${!!authTokenCookie}, isLoggedIn: ${isLoggedInCookie}, userCookie: ${!!userCookie}`);

    let derivedIsLoggedIn = false;
    let derivedUser: User | null = null;

    if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
        try {
            derivedUser = JSON.parse(userCookie as string);
            if (derivedUser && derivedUser.id && derivedUser.username) {
                derivedIsLoggedIn = true;
                console.log("MainNav: Derived user as logged in:", derivedUser.username);
            } else {
                 derivedUser = null; 
                 console.warn("MainNav: Parsed user cookie but user object is invalid.");
            }
        } catch (e) {
            console.error("MainNav: Error parsing loggedInUser cookie:", e);
            derivedUser = null;
            
            console.warn("MainNav: Clearing potentially corrupted auth cookies and localStorage.");
            deleteCookie('authToken', { path: '/' });
            deleteCookie('isLoggedIn', { path: '/' });
            deleteCookie('loggedInUser', { path: '/' });
            if (typeof window !== 'undefined') { 
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUser');
            }
        }
    } else {
         console.log("MainNav: Essential auth cookies missing or isLoggedInCookie not 'true'. User derived as logged out.");
    }


    if (!derivedIsLoggedIn && (localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('loggedInUser'))) {
        console.warn("MainNav: Cookies indicate logged out, but localStorage has auth items. Clearing localStorage.");
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
    }
    
    console.log(`MainNav: Setting isLoggedIn to ${derivedIsLoggedIn}`);
    setIsLoggedIn(current => {
      if (current !== derivedIsLoggedIn) {
        console.log(`MainNav: isLoggedIn state changed from ${current} to ${derivedIsLoggedIn}`);
        return derivedIsLoggedIn;
      }
      return current;
    });

    setLoggedInUser(current => {
      const currentString = JSON.stringify(current);
      const derivedString = JSON.stringify(derivedUser);
      if (currentString !== derivedString) {
        console.log(`MainNav: loggedInUser state changed.`);
        return derivedUser;
      }
      return current;
    });

  }, []);


   useEffect(() => {
        if (!isMounted) {
            console.log("MainNav: Component mounting. Setting isMounted to true and performing initial updates.");
            setIsMounted(true);
            updateAuthState();
            updateCartCount();
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cartItems') {
                console.log("MainNav: cartItems changed in localStorage (storage event). Updating cart count.");
                updateCartCount();
            }
             if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') {
                 console.log(`MainNav: ${event.key} changed in localStorage (storage event). Updating auth state.`);
                 updateAuthState();
            }
        };

        const handleAuthStateChanged = () => {
             console.log("MainNav: authStateChanged event received. Updating auth state.");
             updateAuthState();
        };
        const handleCartUpdated = () => {
             console.log("MainNav: cartUpdated event received. Updating cart count.");
             updateCartCount();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authStateChanged', handleAuthStateChanged);
        window.addEventListener('cartUpdated', handleCartUpdated);
        console.log("MainNav: Event listeners added.");

        return () => {
            console.log("MainNav: Component unmounting. Removing event listeners.");
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