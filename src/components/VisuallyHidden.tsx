// src/components/VisuallyHidden.tsx
import * as React from "react";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";

import { cn } from "@/lib/utils";

const VisuallyHidden = React.forwardRef<
  React.ElementRef<typeof VisuallyHiddenPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof VisuallyHiddenPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <VisuallyHiddenPrimitive.Root
      ref={ref}
      className={cn("sr-only", className)} // Use sr-only utility class or custom styles
      {...props}
    />
  );
});

VisuallyHidden.displayName = VisuallyHiddenPrimitive.Root.displayName;

export { VisuallyHidden };
