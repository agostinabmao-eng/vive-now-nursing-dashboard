"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/style";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DropdownMenu({ options, value, onValueChange, placeholder, className }: Props) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className={cn(
          "inline-flex items-center justify-between gap-2 rounded-[10px] border border-[#D6E6ED] bg-white px-3 py-2 text-sm font-medium text-[#1B3A4F] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)] outline-none focus:ring-2 focus:ring-[#3EB1C8]/40",
          className
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="size-4 text-[#5F8899]" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-50 min-w-[10rem] overflow-hidden rounded-xl border border-[#D6E6ED] bg-white shadow-lg"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#1B3A4F] outline-none hover:bg-[#E8F7FA] data-[highlighted]:bg-[#E8F7FA]"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="ml-auto">
                  <Check className="size-3.5 text-[#3EB1C8]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
