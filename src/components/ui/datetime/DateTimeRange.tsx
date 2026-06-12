"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { DateRangePreset } from "@/types/report";
import { PRESET_OPTIONS, getPresetRange } from "./PresetDateTimeRanges";
import { cn } from "@/lib/utils/style";
import dayjs from "@/lib/utils/datetime";
import "react-day-picker/dist/style.css";

type Props = {
  selected: DateRange | undefined;
  onSelect: (range: DateRange, preset: DateRangePreset) => void;
  triggerVariant?: "select";
};

function formatRange(range: DateRange | undefined): string {
  if (!range?.from) return "Select dates";
  if (!range.to) return dayjs(range.from).format("MMM D, YYYY");
  return `${dayjs(range.from).format("MMM D")} – ${dayjs(range.to).format("MMM D, YYYY")}`;
}

export default function DateTimeRangeComponent({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  function handlePreset(preset: DateRangePreset) {
    const range = getPresetRange(preset);
    if (range?.from && range.to) {
      onSelect(range as DateRange & { from: Date; to: Date }, preset);
      setOpen(false);
    }
  }

  function handleCustomSelect(range: DateRange | undefined) {
    setCustomRange(range);
    if (range?.from && range.to) {
      onSelect(range as DateRange & { from: Date; to: Date }, "custom");
      setOpen(false);
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D6E6ED] bg-white px-3 py-2 text-sm font-medium text-[#1B3A4F] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)] outline-none focus:ring-2 focus:ring-[#3EB1C8]/40"
        >
          <CalendarIcon className="size-4 text-[#5F8899]" />
          <span>{formatRange(selected)}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 flex overflow-hidden rounded-xl border border-[#D6E6ED] bg-white shadow-xl"
          sideOffset={4}
          align="start"
        >
          {/* Presets */}
          <div className="flex flex-col gap-0.5 border-r border-[#D6E6ED] p-2 min-w-[10rem]">
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePreset(opt.value)}
                className="rounded-lg px-3 py-1.5 text-left text-sm text-[#1B3A4F] hover:bg-[#E8F7FA] transition-colors"
              >
                {opt.label}
              </button>
            ))}
            <hr className="my-1 border-[#D6E6ED]" />
            <button
              type="button"
              className={cn(
                "rounded-lg px-3 py-1.5 text-left text-sm text-[#1B3A4F] hover:bg-[#E8F7FA] transition-colors",
                customRange && "bg-[#E8F7FA]"
              )}
              onClick={() => setCustomRange(undefined)}
            >
              Custom
            </button>
          </div>
          {/* Calendar */}
          <div className="p-3">
            <DayPicker
              mode="range"
              selected={customRange ?? selected}
              onSelect={handleCustomSelect}
              numberOfMonths={2}
              styles={{
                caption: { color: "#1B3A4F" },
                day_selected: { backgroundColor: "#3EB1C8" },
                day_range_middle: { backgroundColor: "#E8F7FA" },
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
