"use client";
import * as React from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetTrigger, SheetClose} from "@/components/ui/sheet";
import {Icons} from "@/components/icons";
import { useEffect, useState } from "react";

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {
}


interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

function NavLink({ className, href, children, ...props }: NavLinkProps) {
  const pathname = usePathname()

  const active =
    (pathname === href) ||
    (pathname?.startsWith(`${href}/`) ?? false)

  return (
    <Link href={href} className={cn(active ? "font-semibold text-foreground" : "text-muted-foreground", className)} {...props}>
      {children}
    </Link>
  )
}


export function MobileNav({ className, ...props }: MobileNavProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(storedLogin === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    router.push('/auth/login');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Icons.menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <NavLink href="/">
          Home
        </NavLink>
        <NavLink href="/shop">
          Shop
        </NavLink>
        <NavLink href="/cart">
          Cart
        </NavLink>
        <NavLink href="/checkout">
          Checkout
        </NavLink>
        {isLoggedIn ? (
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Link href="/auth/login">
            <Button variant="ghost">
              Login
            </Button>
          </Link>
        )}
        <SheetClose asChild>
          <Button variant="ghost" className="absolute right-4 top-4">
            <Icons.close className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}
