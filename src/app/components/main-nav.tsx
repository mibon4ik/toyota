"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/ui/mobile-nav" // Corrected import path
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user'; // Import User type

interface CartItem {
  id: string;
  quantity: number;
  // Add other necessary properties from AutoPart if needed for calculation
}

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default to false initially
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null); // Default to null
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount

  // Function to update cart count from localStorage
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
          console.error("Error parsing cartItems from storage:", e);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    }
  }, []); // No state dependencies needed as it reads directly

  const handleLogout = useCallback(() => {
    // Clear cookies
    deleteCookie('authToken');
    deleteCookie('isLoggedIn');
    deleteCookie('loggedInUser');

    // Clear localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        // Optionally clear cart on logout? Depends on requirements.
        // localStorage.removeItem('cartItems');
        // Dispatch event to notify other components (like nav bar) immediately
        window.dispatchEvent(new Event('authStateChanged'));
    }

    // Update local state
    setIsLoggedIn(false);
    setLoggedInUser(null);
    // setCartItemCount(0); // Reset cart count if clearing cart on logout

    router.push('/auth/login'); // Redirect to login
  }, [router]); // Removed stable setters, only router dependency

  // Function to update auth state from cookies and localStorage
  const updateAuthState = useCallback(() => {
     if (typeof window === 'undefined') return; // Ensure this only runs client-side

    const loggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    let loggedInLocalStorage = localStorage.getItem('isLoggedIn');
    let userLocalStorage = localStorage.getItem('loggedInUser');


    const shouldBeLoggedIn = loggedInCookie === 'true' || loggedInLocalStorage === 'true';
    const userJson = userCookie || userLocalStorage;
    let parsedUser: User | null = null;
    let isActuallyLoggedIn = false;

    if (shouldBeLoggedIn && userJson) {
        try {
            parsedUser = JSON.parse(userJson);
            // Basic validation
            if (parsedUser && parsedUser.id && parsedUser.username) {
                isActuallyLoggedIn = true;
            } else {
                 console.warn("Invalid user data structure in storage.");
                 parsedUser = null; // Treat invalid data as logged out
                 isActuallyLoggedIn = false;
                 // Clear invalid storage potentially causing issues
                 deleteCookie('authToken');
                 deleteCookie('isLoggedIn');
                 deleteCookie('loggedInUser');
                 localStorage.removeItem('isLoggedIn');
                 localStorage.removeItem('loggedInUser');

            }
        } catch (e) {
            console.error("Error parsing user data:", e);
            parsedUser = null; // Treat parse error as logged out
            isActuallyLoggedIn = false;
             // Clear invalid storage
             deleteCookie('authToken');
             deleteCookie('isLoggedIn');
             deleteCookie('loggedInUser');
             localStorage.removeItem('isLoggedIn');
             localStorage.removeItem('loggedInUser');
        }
    } else {
         isActuallyLoggedIn = false;
         parsedUser = null;
    }

    // Set state based on derived values ONLY if they changed
     setIsLoggedIn(current => current !== isActuallyLoggedIn ? isActuallyLoggedIn : current);
     setLoggedInUser(current => JSON.stringify(current) !== JSON.stringify(parsedUser) ? parsedUser : current);


  }, []); // Removed state setters from dependencies

  // Effect to run on mount and listen for changes
   useEffect(() => {
        setIsMounted(true); // Indicate component has mounted

        // Initial check on mount
        updateAuthState();
        updateCartCount();

        // Listener for direct storage changes (e.g., other tabs)
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cartItems') {
                updateCartCount();
            }
             if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') {
                 updateAuthState();
            }
        };

        // Listener for custom event dispatched after login/logout actions
        const handleAuthStateChanged = () => updateAuthState();
        // Listener for custom event dispatched after cart updates
        const handleCartUpdated = () => updateCartCount();

        // Attach listeners
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authStateChanged', handleAuthStateChanged);
        window.addEventListener('cartUpdated', handleCartUpdated);


        // Cleanup listeners on component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authStateChanged', handleAuthStateChanged);
            window.removeEventListener('cartUpdated', handleCartUpdated);
        };
    // updateAuthState and updateCartCount are stable due to useCallback with no dependencies
    }, [updateAuthState, updateCartCount]);


   const navigateToCart = () => {
        router.push('/cart');
   };

   // Avoid rendering interactive parts until mounted to prevent hydration errors
    if (!isMounted) {
        // Render a skeleton or simplified version during SSR/initial client render
        return (
            <div className={cn("flex h-16 w-full shrink-0 items-center px-6", className)} {...props}>
                 <Button variant="ghost" size="icon" className="mr-2" disabled>
                     <Icons.menu className="h-4 w-4" />
                 </Button>
                <Link href="/" className="mr-6 flex items-center space-x-2">
                     <Icons.truck className="h-6 w-6" />
                     <span className="hidden font-bold sm:inline-block">Toyota</span>
                </Link>
                <nav className="hidden md:flex space-x-4 flex-grow">
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


   // Render the final structure directly on both server and client
   // useEffect will update the state after hydration based on client-side storage
   return (
     <div className={cn("flex h-16 w-full shrink-0 items-center px-6", className)} {...props}>
       <MobileNav className="mr-4" /> {/* Add MobileNav */}
       <Link href="/" className="mr-6 flex items-center space-x-2">
         <Icons.truck className="h-6 w-6" />
         <span className="hidden font-bold sm:inline-block">Toyota</span>
       </Link>
       <nav className="hidden md:flex space-x-4 flex-grow"> {/* Use flex-grow to push items to the right */}
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
               {/* Show cart count always, regardless of login status - updates via useEffect */}
               {cartItemCount > 0 && (
                 <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs" style={{ backgroundColor: '#8dc572' }}>
                   {cartItemCount}
                 </Badge>
               )}
             </Button>

           {/* Conditional rendering based on state updated by useEffect */}
           {isLoggedIn && loggedInUser ? (
             <>
               {/* Display user info or avatar */}
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
