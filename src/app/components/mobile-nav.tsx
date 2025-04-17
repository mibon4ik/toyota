"use client";
import * as React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetTrigger, SheetClose} from "@/components/ui/sheet";
import {Icons} from "@/components/icons";

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {
}

export function MobileNav({className, ...props}: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Icons.menu className="h-4 w-4"/>
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="grid gap-4 py-4">
          <Link href="/" className={cn(
            "flex items-center text-sm font-semibold transition-colors hover:text-foreground",
            pathname === "/" ? "text-foreground" : "text-muted-foreground"
          )}>
            Home
          </Link>
          <Link href="/shop" className={cn(
            "flex items-center text-sm font-semibold transition-colors hover:text-foreground",
            pathname === "/shop" ? "text-foreground" : "text-muted-foreground"
          )}>
            Shop
          </Link>
          <Link href="/cart" className={cn(
            "flex items-center text-sm font-semibold transition-colors hover:text-foreground",
            pathname === "/cart" ? "text-foreground" : "text-muted-foreground"
          )}>
            Cart
          </Link>
          <Link href="/checkout" className={cn(
            "flex items-center text-sm font-semibold transition-colors hover:text-foreground",
            pathname === "/checkout" ? "text-foreground" : "text-muted-foreground"
          )}>
            Checkout
          </Link>
        </div>
        <SheetClose asChild>
          <Button variant="ghost" className="absolute right-4 top-4">
            <Icons.close className="h-6 w-6"/>
            <span className="sr-only">Close</span>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
