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

const calendarStyles = `
  .rdp {
    --rdp-accent-color: #3EB1C8;
    --rdp-background-color: #E8F7FA;
    margin: 0;
  }
  .rdp-day_selected:not(.rdp-day_range_middle) {
    background-color: #3EB1C8 !important;
    color: white !important;
    border-radius: 50% !important;
  }
  .rdp-day_range_middle {
    background-color: #E8F7FA !important;
    color: #1B3A4F !important;
    border-radius: 0 !important;
  }
  .rdp-day_range_start,
  .rdp-day_range_end {
    background-color: #3EB1C8 !important;
    color: white !important;
    border-radius: 50% !important;
  }
  .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
    background-color: #E8F7FA !important;
    border-radius: 50% !important;
  }
  .rdp-caption_label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1B3A4F;
  }
  .rdp-head_cell {
    font-size: 0.75rem;
    color: #5F8899;
    font-weight: 500;
  }
  .rdp-day {
    font-size: 0.875rem;
    color: #1B3A4F;
    width: 36px;
    height: 36px;
  }
  .rdp-nav_button {
    color: #5F8899;
  }
`;

export default function DateTimeRangeComponent({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(undefined);

  function handlePreset(preset: DateRangePreset) {
    const range = getPresetRange(preset);
    if (range?.from && range.to) {
      onSelect(range as DateRange & { from: Date; to: Date }, preset);
      setPendingRange(undefined);
      setOpen(false);
    }
  }

  function handleCalendarSelect(range: DateRange | undefined) {
    setPendingRange(range);
    if (range?.from && range.to) {
      onSelect(range as DateRange & { from: Date; to: Date }, "custom");
      setOpen(false);
    }
  }

  const displayRange = pendingRange ?? selected;

  return (
    <>
      <style>{calendarStyles}</style>
      <Popover.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPendingRange(undefined); }}>
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
            className="z-50 flex flex-col overflow-hidden rounded-xl border border-[#D6E6ED] bg-white shadow-xl"
            sideOffset={4}
            align="start"
          >
            {/* Calendars */}
            <div className="px-3 pt-3">
              <DayPicker
                mode="range"
                selected={displayRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
              />
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2 border-t border-[#D6E6ED] px-4 py-3">
              {PRESET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePreset(opt.value)}
                  className={cn(
                    "rounded-full border border-[#D6E6ED] px-3 py-1 text-sm text-[#1B3A4F] transition-colors hover:border-[#3EB1C8] hover:bg-[#E8F7FA] hover:text-[#1B7A92]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
