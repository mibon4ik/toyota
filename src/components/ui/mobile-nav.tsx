"use client";
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Icons } from "@/components/icons"
import { NavLink } from "@/app/components/nav-link"

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MobileNav({ className, ...props }: MobileNavProps) {
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

