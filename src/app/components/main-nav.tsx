"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
// Correct import path for MobileNav
import { MobileNav } from "@/components/ui/mobile-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user';
import type { CookieSerializeOptions } from 'cookie'; // Import CookieSerializeOptions type


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
          console.error("MainNav: Error parsing cartItems from storage:", e);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    console.log("MainNav: Logout initiated.");
    // Define common cookie options for deletion
    const cookieOptions: CookieSerializeOptions = {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // Domain is omitted
    };

    // Clear cookies with options
    deleteCookie('authToken', cookieOptions);
    deleteCookie('isLoggedIn', cookieOptions);
    deleteCookie('loggedInUser', cookieOptions);
    console.log("MainNav: Cookies cleared.");

    // Clear localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        console.log("MainNav: localStorage cleared.");

        // Update local state *before* dispatching event
        setIsLoggedIn(false);
        setLoggedInUser(null);
        // Optionally clear cart on logout?
        // localStorage.removeItem('cartItems');
        // setCartItemCount(0); // Reset cart count if clearing cart

        // Dispatch event AFTER clearing storage and setting state
        console.log("MainNav: Dispatching authStateChanged event...");
        window.dispatchEvent(new Event('authStateChanged'));
        console.log("MainNav: authStateChanged event dispatched.");

    } else {
         console.warn("MainNav: window object not available during logout.");
         setIsLoggedIn(false);
         setLoggedInUser(null);
    }

    console.log("MainNav: Redirecting to login after logout.");
    router.push('/auth/login'); // Redirect to login
  }, [router]); // Only router dependency

  const updateAuthState = useCallback(() => {
     if (typeof window === 'undefined') {
         return; // Ensure this only runs client-side
     }

    const loggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    const authTokenCookie = getCookie('authToken');

    let derivedIsLoggedIn = false;
    let derivedUser: User | null = null;

    if (authTokenCookie && loggedInCookie === 'true' && userCookie) {
        try {
            derivedUser = JSON.parse(userCookie);
            if (derivedUser && derivedUser.id && derivedUser.username) {
                derivedIsLoggedIn = true;
            } else {
                 console.warn("MainNav: Invalid user data structure in cookie storage.");
                 derivedUser = null;
                 derivedIsLoggedIn = false;
            }
        } catch (e) {
            console.error("MainNav: Error parsing user cookie:", e);
            derivedUser = null;
            derivedIsLoggedIn = false;
        }
    } else {
        // Fallback to localStorage (if cookies are missing/inconsistent)
        let loggedInLocalStorage = localStorage.getItem('isLoggedIn');
        let userLocalStorage = localStorage.getItem('loggedInUser');
        if (loggedInLocalStorage === 'true' && userLocalStorage) {
            try {
                derivedUser = JSON.parse(userLocalStorage);
                 if (derivedUser && derivedUser.id && derivedUser.username) {
                     derivedIsLoggedIn = true;
                     console.log("MainNav: Auth state restored from localStorage.");
                 } else {
                    console.warn("MainNav: Invalid user data structure in localStorage.");
                    derivedUser = null;
                    derivedIsLoggedIn = false;
                 }
            } catch (e) {
                 console.error("MainNav: Error parsing user localStorage:", e);
                 derivedUser = null;
                 derivedIsLoggedIn = false;
            }
        }
    }

    // Clean up storage if checks indicate not logged in but storage persists
    if (!derivedIsLoggedIn && (localStorage.getItem('isLoggedIn') || localStorage.getItem('loggedInUser'))) {
        console.log("MainNav: Cleaning up inconsistent localStorage auth state.");
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
    }

    // Update state only if changed
    setIsLoggedIn(current => current !== derivedIsLoggedIn ? derivedIsLoggedIn : current);
    setLoggedInUser(current => JSON.stringify(current) !== JSON.stringify(derivedUser) ? derivedUser : current);

  }, [setIsLoggedIn, setLoggedInUser]); // Add setters as dependencies

   useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
        }

        updateAuthState();
        updateCartCount();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cartItems') {
                updateCartCount();
            }
             if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') {
                 updateAuthState();
            }
        };

        const handleAuthStateChanged = () => {
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
                <MobileNav /> {/* Include MobileNav skeleton/trigger */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                     <Icons.truck className="h-6 w-6" />
                     <span className="hidden font-bold sm:inline-block">Toyota</span>
                </Link>
                <nav className="hidden md:flex space-x-4 flex-grow">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                   <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
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
        <MobileNav /> {/* Add MobileNav component */}
       <Link href="/" className="mr-6 flex items-center space-x-2">
         <Icons.truck className="h-6 w-6" />
         <span className="hidden font-bold sm:inline-block">Toyota</span>
       </Link>
       <nav className="hidden md:flex space-x-4 flex-grow">
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
                    {/* Add user avatar image if available */}
                    {/* <AvatarImage src={loggedInUser.avatarUrl} alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`} /> */}
                    <AvatarFallback>{loggedInUser.firstName?.[0]}{loggedInUser.lastName?.[0]}</AvatarFallback>
                  </Avatar>
               <span className="text-sm font-medium hidden sm:inline-block">{loggedInUser.firstName} {loggedInUser.lastName}</span>
               {loggedInUser.isAdmin && (
                 <Link href="/admin" passHref>
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
             <Link href="/auth/login" passHref>
               <Button size="sm" variant="ghost">
                 Войти
               </Button>
             </Link>
           )}
       </div>
     </div>
   )
}