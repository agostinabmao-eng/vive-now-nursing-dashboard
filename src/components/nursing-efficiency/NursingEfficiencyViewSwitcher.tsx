"use client";

import { useMemo } from "react";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import type { NursingEfficiencyViewMode } from "@/lib/nursing-efficiency/types";
import { cn } from "@/lib/utils/style";

type Props = {
  viewMode: NursingEfficiencyViewMode;
  isAllNurses: boolean;
  onViewModeChange: (mode: NursingEfficiencyViewMode) => void;
};

const TAB_BASE_CLASS =
  "rounded-[8px] px-3 py-1.5 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#3EB1C8]/50 focus-visible:ring-offset-1";

function getViewOptions(isAllNurses: boolean): { value: NursingEfficiencyViewMode; label: string }[] {
  return [
    { value: "summary", label: isAllNurses ? "Team summary" : "Summary" },
    ...(isAllNurses ? [{ value: "compare" as const, label: "Compare nurses" }] : []),
    { value: "chart", label: "Chart" },
  ];
}

export default function NursingEfficiencyViewSwitcher({ viewMode, isAllNurses, onViewModeChange }: Props) {
  const viewOptions = useMemo(() => getViewOptions(isAllNurses), [isAllNurses]);

  const selectedIndex = Math.max(
    0,
    viewOptions.findIndex((option) => option.value === viewMode)
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className={ENROLLMENT_SECTION_LABEL}>View</span>
      <TabGroup
        selectedIndex={selectedIndex}
        onChange={(index) => {
          const option = viewOptions[index];
          if (option) onViewModeChange(option.value);
        }}
      >
        <TabList className="flex h-9 items-center gap-1 rounded-[10px] border border-[#D6E6ED]/60 bg-[#E8F7FA] p-1 shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
          {viewOptions.map(({ value, label }) => (
            <Tab
              key={value}
              className={cn(
                TAB_BASE_CLASS,
                "text-[#5F8899] hover:text-[#1B3A4F]",
                "data-[selected]:bg-white data-[selected]:text-[#1B7A92] data-[selected]:shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]"
              )}
            >
              {label}
            </Tab>
          ))}
        </TabList>
      </TabGroup>
    </div>
  );
}
