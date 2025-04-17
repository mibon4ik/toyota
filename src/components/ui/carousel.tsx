"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div className="relative">
    <div
      ref={ref}
      className={cn("w-full overflow-hidden", className)}
      {...props}
    />
  </div>
))
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex gap-1 md:gap-2", className)}
    {...props}
  />
))
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("basis-1/1 md:basis-1/2 lg:basis-1/3", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute left-1 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-md ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none data-[state=open]:bg-secondary",
      className
    )}
    {...props}
  />
))
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-1 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-md ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none data-[state=open]:bg-secondary",
      className
    )}
    {...props}
  />
))
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious }
