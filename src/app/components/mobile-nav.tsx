"use client";
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"; // Import useAuth hook

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"; // Import Separator
import { VisuallyHidden } from "@/components/VisuallyHidden"; // Import VisuallyHidden

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {}


interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
  icon?: React.ElementType // Add icon prop
  onClick?: () => void; // Add onClick prop for SheetClose
}

function NavLink({ className, href, children, icon: Icon, onClick, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <SheetClose asChild>
      <Link
        href={href}
        className={cn(
            "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
            active
                ? "bg-primary text-primary-foreground shadow-sm" // Active state style
                : "text-foreground hover:bg-muted hover:text-foreground", // Default state style
            className
        )}
        onClick={onClick} // Close sheet on click
        {...props}
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />} {/* Render icon */}
        <span className="flex-grow">{children}</span>
      </Link>
    </SheetClose>
  )
}


export function MobileNav({ className, ...props }: MobileNavProps) {
  const { isLoggedIn, logout } = useAuth(); // Get auth state and logout function

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2 md:hidden"> {/* Only show on mobile */}
          <Icons.menu className="h-5 w-5" /> {/* Slightly larger icon */}
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className={cn(
            "flex h-full w-full max-w-[280px] flex-col border-r bg-background p-0 shadow-xl sm:max-w-sm", // Adjusted width and padding
             className
        )}
        {...props}
       >
           {/* Visually Hidden Title for Accessibility */}
            <VisuallyHidden>
                <SheetClose /> {/* Need a close button inside for accessibility, can be hidden */}
                Меню навигации
            </VisuallyHidden>

            {/* Custom Header with Close Button */}
            <div className="flex items-center justify-between border-b p-4">
                 <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => { /* Close logic handled by SheetClose wrapper */ }}>
                    <Icons.truck className="h-6 w-6 text-primary" />
                    <span>Toyota</span>
                </Link>
                <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                         <Icons.close className="h-5 w-5" />
                         <span className="sr-only">Закрыть меню</span>
                    </Button>
                </SheetClose>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2 overflow-y-auto p-4"> {/* Added padding and scroll */}
              <NavLink href="/" icon={Icons.home}>Главная</NavLink>
              <NavLink href="/shop" icon={Icons.shoppingCart}>Магазин</NavLink>
              <NavLink href="/cart" icon={Icons.shoppingCart}>Корзина</NavLink>
              <NavLink href="/checkout" icon={Icons.check}>Оформление</NavLink>
              <NavLink href="/contacts" icon={Icons.mail}>Контакты</NavLink> {/* Changed icon */}

              <Separator className="my-4" /> {/* Separator */}

               {isLoggedIn ? (
                 <SheetClose asChild>
                     <Button
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-3 rounded-md px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={logout}
                     >
                          <Icons.arrowRight className="h-5 w-5 flex-shrink-0 rotate-180" /> {/* Logout icon */}
                         <span className="flex-grow">Выйти</span>
                     </Button>
                 </SheetClose>
                ) : (
                 <NavLink href="/auth/login" icon={Icons.user}> {/* Login icon */}
                      Войти
                 </NavLink>
                )}
            </nav>

             {/* Optional Footer */}
             {/* <div className="mt-auto border-t p-4">
                 <p className="text-center text-xs text-muted-foreground">
                     &copy; {new Date().getFullYear()} Toyota
                 </p>
             </div> */}
      </SheetContent>
    </Sheet>
  )
}

MobileNav.displayName = "MobileNav";
```</content>
  </change>
  <change>
    <file>src/components/ui/sheet.tsx</file>
    <description>Remove default close button from SheetContent as a custom one is added in MobileNav.</description>
    <content><![CDATA["use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@/components/VisuallyHidden"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
        {/* Add a visually hidden title for accessibility */}
        <VisuallyHidden>
            {/* Assign a default title or ideally pass one via props */}
            <SheetPrimitive.Title>{props['aria-label'] || 'Sheet'}</SheetPrimitive.Title>
             {/* Include a description if applicable */}
            {props['aria-describedby'] && <SheetPrimitive.Description id={props['aria-describedby']}>Sheet Description</SheetPrimitive.Description>}
        </VisuallyHidden>
      {children}
      {/* Default close button removed - handle close via SheetClose in the implementation */}
      {/*
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      */}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```</content>
  </change>
  <change>
    <file>src/components/ui/separator.tsx</file>
    <description>Add Separator component from ShadCN UI.</description>
    <content><![CDATA["use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
