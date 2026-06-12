"use client";

import DateTimeRangeComponent from "@/components/ui/datetime/DateTimeRange";
import { DropdownMenu } from "@/components/ui/dropDownMenu";
import NursingEfficiencyViewSwitcher from "@/components/nursing-efficiency/NursingEfficiencyViewSwitcher";
// @dev-prototype-start
import { getNurseDropdownOptions, getPracticeDropdownOptions } from "@/lib/dev/nursing-efficiency-mock";
// @dev-prototype-end
import { ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import type { NursingEfficiencyFilters, NursingEfficiencyViewMode } from "@/lib/nursing-efficiency/types";
import type { DateRange } from "react-day-picker";
import type { DateRangePreset } from "@/types/report";

const FILTER_TRIGGER_CLASS =
  "!h-9 min-w-[11rem] !rounded-[10px] !border-[#D6E6ED] !px-3 !py-2 !text-sm !font-medium !text-[#1B3A4F] !shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]";

type Props = {
  filters: NursingEfficiencyFilters;
  viewMode: NursingEfficiencyViewMode;
  isAllNurses: boolean;
  onDateRangeChange: (range: DateRange, preset: DateRangePreset) => void;
  onNurseChange: (nurseId: string) => void;
  onPracticeChange: (practiceId: string) => void;
  onViewModeChange: (mode: NursingEfficiencyViewMode) => void;
};

export default function NursingEfficiencyFilters({
  filters,
  viewMode,
  isAllNurses,
  onDateRangeChange,
  onNurseChange,
  onPracticeChange,
  onViewModeChange,
}: Props) {
  const nurseOptions = getNurseDropdownOptions();
  const practiceOptions = getPracticeDropdownOptions();

  return (
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

      <NursingEfficiencyViewSwitcher
        viewMode={viewMode}
        isAllNurses={isAllNurses}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
}
