"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils/style";

export const TooltipProvider = RadixTooltip.Provider;
export const Tooltip = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;

type ContentProps = React.ComponentPropsWithoutRef<typeof RadixTooltip.Content>;

export function TooltipContent({ className, sideOffset = 4, ...props }: ContentProps) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md bg-[#1B3A4F] px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      />
    </RadixTooltip.Portal>
  );
}
