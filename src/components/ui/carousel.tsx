"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import {
  Carousel as CarouselPrimitive,
  CarouselContent as CarouselContentPrimitive,
  CarouselNext as CarouselNextPrimitive,
  CarouselPrevious as CarouselPreviousPrimitive,
  CarouselItem as CarouselItemPrimitive,
} from "vaul-carousel"

import { cn } from "@/lib/utils"

const Carousel = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive>
>(({ className, ...props }, ref) => (
  <div className="relative">
    <CarouselPrimitive
      ref={ref}
      className={cn("w-full overflow-hidden", className)}
      {...props}
    />
  </div>
))
Carousel.displayName = CarouselPrimitive.displayName

const CarouselContent = React.forwardRef<
  React.ElementRef<typeof CarouselContentPrimitive>,
  React.ComponentPropsWithoutRef<typeof CarouselContentPrimitive>
>(({ className, ...props }, ref) => (
  <CarouselContentPrimitive
    ref={ref}
    className={cn("flex gap-1 md:gap-2", className)}
    {...props}
  />
))
CarouselContent.displayName = CarouselContentPrimitive.displayName

const CarouselItem = React.forwardRef<
  React.ElementRef<typeof CarouselItemPrimitive>,
  React.ComponentPropsWithoutRef<typeof CarouselItemPrimitive>
>(({ className, ...props }, ref) => (
  <CarouselItemPrimitive
    ref={ref}
    className={cn("basis-1/1 md:basis-1/2 lg:basis-1/3", className)}
    {...props}
  />
))
CarouselItem.displayName = CarouselItemPrimitive.displayName

const CarouselPrevious = React.forwardRef<
  React.ElementRef<typeof CarouselNextPrimitive>,
  React.ComponentPropsWithoutRef<typeof CarouselNextPrimitive>
>(({ className, ...props }, ref) => (
  <CarouselPreviousPrimitive
    ref={ref}
    className={cn(
      "absolute left-1 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-md ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none data-[state=open]:bg-secondary",
      className
    )}
    {...props}
  />
))
CarouselPrevious.displayName = CarouselPreviousPrimitive.displayName

const CarouselNext = React.forwardRef<
  React.ElementRef<typeof CarouselNextPrimitive>,
  React.ComponentPropsWithoutRef<typeof CarouselNextPrimitive>
>(({ className, ...props }, ref) => (
  <CarouselNextPrimitive
    ref={ref}
    className={cn(
      "absolute right-1 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-md ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none data-[state=open]:bg-secondary",
      className
    )}
    {...props}
  />
))
CarouselNext.displayName = CarouselNextPrimitive.displayName

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious }
