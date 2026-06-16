"use client";

import DateTimeRangeComponent from "@/components/ui/datetime/DateTimeRange";
import { DropdownMenu } from "@/components/ui/dropDownMenu";
import { getNurseDropdownOptions, getPracticeDropdownOptions } from "@/lib/nursing-efficiency/dev/nursing-efficiency-mock";
import { ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import type { NursingEfficiencyFilters } from "@/lib/nursing-efficiency/types";
import { ALL_NURSES_ID } from "@/lib/nursing-efficiency/dev/nursing-efficiency-mock";
import type { DateRange } from "react-day-picker";
import type { DateRangePreset } from "@/types/report";

export type DashboardViewMode = "nurse" | "admin";

const FILTER_TRIGGER_CLASS =
  "!h-9 min-w-[11rem] !rounded-[10px] !border-[#D6E6ED] !px-3 !py-2 !text-sm !font-medium !text-[#1B3A4F] !shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]";

type Props = {
  filters: NursingEfficiencyFilters;
  onDateRangeChange: (range: DateRange, preset: DateRangePreset) => void;
  onNurseChange: (nurseId: string) => void;
  onPracticeChange: (practiceId: string) => void;
  viewMode: DashboardViewMode;
  onViewModeChange: (mode: DashboardViewMode) => void;
};

export default function NursingEfficiencyFilters({
  filters,
  onDateRangeChange,
  onNurseChange,
  onPracticeChange,
  viewMode,
  onViewModeChange,
}: Props) {
  const nurseOptions = getNurseDropdownOptions();
  const practiceOptions = getPracticeDropdownOptions();

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={ENROLLMENT_SECTION_LABEL}>Nurse</span>
          <DropdownMenu
            options={nurseOptions}
            value={filters.nurseId}
            onValueChange={(value) => onNurseChange(String(value))}
            placeholder="All Vive Nurses"
            className={FILTER_TRIGGER_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={ENROLLMENT_SECTION_LABEL}>Practice</span>
          <DropdownMenu
            options={practiceOptions}
            value={filters.practiceId}
            onValueChange={(value) => onPracticeChange(String(value))}
            placeholder="All Practices"
            className={FILTER_TRIGGER_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={ENROLLMENT_SECTION_LABEL}>Date Range</span>
          <DateTimeRangeComponent
            selected={filters.dateRange}
            onSelect={onDateRangeChange}
            triggerVariant="select"
          />
        </div>
      </div>

      {/* Admin hint when all nurses selected */}
      {viewMode === "admin" && filters.nurseId === ALL_NURSES_ID && (
        <p className="self-end pb-2 text-xs text-[#5F8899]">
          Select a nurse to enable editing
        </p>
      )}

      {/* Nurse / Admin toggle */}
      <div className="flex flex-col gap-1.5">
        <span className={ENROLLMENT_SECTION_LABEL}>View as</span>
        <div className="flex h-9 items-center rounded-[10px] border border-[#D6E6ED] bg-white p-0.5 shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
          {(["nurse", "admin"] as DashboardViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={`h-full rounded-[8px] px-4 text-sm font-medium capitalize transition-colors ${
                viewMode === mode
                  ? "bg-[#3EB1C8] text-white shadow-sm"
                  : "text-[#5F8899] hover:text-[#1B3A4F]"
              }`}
            >
              {mode === "nurse" ? "Nurse" : "Admin"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
