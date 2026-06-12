import type { DateRange } from "react-day-picker";
import type { DateRangePreset } from "@/types/report";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subDays,
  subMonths,
} from "date-fns";

export type PresetOption = {
  value: DateRangePreset;
  label: string;
};

export const PRESET_OPTIONS: PresetOption[] = [
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "prev_30_days", label: "Previous 30 Days" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
];

export function getPresetRange(preset: DateRangePreset): DateRange | null {
  const now = new Date();

  switch (preset) {
    case "this_week":
      return { from: startOfWeek(now), to: endOfWeek(now) };
    case "last_week": {
      const lastWeek = subWeeks(now, 1);
      return { from: startOfWeek(lastWeek), to: endOfWeek(lastWeek) };
    }
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "prev_30_days":
      return { from: subDays(now, 29), to: now };
    case "today":
      return { from: now, to: now };
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return { from: yesterday, to: yesterday };
    }
    default:
      return null;
  }
}
