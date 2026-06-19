import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

// Scrollbar variant system
export type ScrollBarVariant = "default" | "thin" | "hidden" | "auto-hide";

// Scroll orientation system
export type ScrollOrientation = "vertical" | "horizontal" | "both";

interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  /**
   * Scrollbar style variant:
   * - default: 6px width, semi-transparent with hover effect
   * - thin: 4px width, lighter opacity
   * - hidden: completely hidden scrollbar
   * - auto-hide: appears only on hover
   */
  scrollbarVariant?: ScrollBarVariant;
  /**
   * Scroll orientation:
   * - vertical: only vertical scroll (default)
   * - horizontal: only horizontal scroll
   * - both: both directions
   */
  orientation?: ScrollOrientation;
  /**
   * Additional className for the viewport element
   */
  viewportClassName?: string;
}

const orientationStyles = {
  // CRITICAL: !block min-w-0 prevents Radix table-like viewport expansion
  // that would swallow nested horizontal overflows
  vertical: "!block min-w-0 overflow-y-auto overflow-x-hidden",
  horizontal: "!block min-w-0 overflow-x-auto overflow-y-hidden",
  both: "!block min-w-0 overflow-auto",
};

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, scrollbarVariant = "default", orientation = "vertical", viewportClassName, ...props }, ref) => (
  <ScrollAreaPrimitive.Root 
    ref={ref} 
    className={cn(
      "relative overflow-hidden",
      scrollbarVariant === "auto-hide" && "group",
      className
    )} 
    {...props}
  >
    <ScrollAreaPrimitive.Viewport 
      className={cn(
        "h-full w-full rounded-[inherit] overscroll-contain",
        orientationStyles[orientation],
        viewportClassName
      )}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar 
      variant={scrollbarVariant} 
      orientation={orientation === "horizontal" ? "horizontal" : "vertical"} 
    />
    {orientation === "both" && (
      <ScrollBar variant={scrollbarVariant} orientation="horizontal" />
    )}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// Scrollbar variant styles
const scrollbarVariantStyles = {
  default: {
    bar: "w-1.5", // 6px
    barHorizontal: "h-1.5",
    thumb: "bg-foreground/20 hover:bg-foreground/40",
  },
  thin: {
    bar: "w-1", // 4px
    barHorizontal: "h-1",
    thumb: "bg-foreground/15 hover:bg-foreground/30",
  },
  hidden: {
    bar: "w-0 opacity-0",
    barHorizontal: "h-0 opacity-0",
    thumb: "",
  },
  "auto-hide": {
    bar: "w-1.5 opacity-0 group-hover:opacity-100",
    barHorizontal: "h-1.5 opacity-0 group-hover:opacity-100",
    thumb: "bg-foreground/25 hover:bg-foreground/45",
  },
};

interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  variant?: ScrollBarVariant;
}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", variant = "default", ...props }, ref) => {
  const styles = scrollbarVariantStyles[variant];
  
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-all duration-200",
        orientation === "vertical" && cn("h-full border-l border-l-transparent p-[1px]", styles.bar),
        orientation === "horizontal" && cn("w-full flex-col border-t border-t-transparent p-[1px]", styles.barHorizontal),
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb 
        className={cn(
          "relative flex-1 rounded-full transition-colors duration-200",
          styles.thumb
        )} 
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
