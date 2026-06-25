import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef(
  ({ className, align = "start", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-[100] w-auto rounded-xl border bg-popover p-0 text-popover-foreground shadow-2xl outline-none overflow-hidden",
          className,
        )}
        // ─── ADD THESE TWO PROPS BELOW TO STOP THE DIALOG FOCUS BLOCKED CONFLICT ───
        onPointerDownOutside={(e) => {
          // If you click inside the timekeeper body, don't let Radix close or lock up
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
