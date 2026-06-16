"use client";

import { useState } from "react";
import Card from "@/components/ui/card/Card";
import EfficiencySummaryTable from "@/components/nursing-efficiency/EfficiencySummaryTable";
import NursingEfficiencyFilters from "@/components/nursing-efficiency/NursingEfficiencyFilters";
import NurseDataEntryCard from "@/components/nursing-efficiency/NurseDataEntryCard";
import { ENROLLMENT_PAGE_BG, ENROLLMENT_PAGE_MIN_HEIGHT } from "@/lib/enrollment/styles";
import { useNursingEfficiency } from "@/lib/nursing-efficiency/hooks/useNursingEfficiency";
import { useDailyEntries } from "@/lib/nursing-efficiency/hooks/useDailyEntries";
import type { DashboardViewMode } from "@/components/nursing-efficiency/NursingEfficiencyFilters";
import { cn } from "@/lib/utils/style";

export default function NursingEfficiencyDashboard() {
  const [viewMode, setViewMode] = useState<DashboardViewMode>("nurse");
  const { entries, saveEntry, getEntry } = useDailyEntries();

  const {
    filters,
    rows,
    totals,
    weeks,
    isWeekPreset,
    setDateRange,
    setNurseId,
    setPracticeId,
  } = useNursingEfficiency(entries);

  return (
    <div className={cn(ENROLLMENT_PAGE_BG, "min-h-full")}>
      <Card className={cn(ENROLLMENT_PAGE_MIN_HEIGHT, "flex flex-col gap-6 p-6 shadow-sm")}>
        <div className="flex shrink-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[#1B3A4F] md:text-3xl">Nursing Efficiency</h1>
          <p className="text-sm text-[#5F8899]">
            Efficiency shows how much of each nurse's paid time is accounted for by documented activity (calls and SMS).
          </p>
          <p className="text-xs text-[#5F8899]">Paid hours · Gusto (mock)</p>
        </div>

        <div className="shrink-0">
          <NursingEfficiencyFilters
            filters={filters}
            onDateRangeChange={setDateRange}
            onNurseChange={setNurseId}
            onPracticeChange={setPracticeId}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        <div className="shrink-0">
          <EfficiencySummaryTable
            rows={rows}
            totals={totals}
            periodLabel={isWeekPreset ? "Day" : "Week"}
            isAdmin={viewMode === "admin"}
            weeks={weeks}
            nurseId={filters.nurseId}
            entries={entries}
            onSaveEntry={saveEntry}
          />
        </div>

        {viewMode === "nurse" && (
          <div className="shrink-0">
            <NurseDataEntryCard onSave={saveEntry} getEntry={getEntry} />
          </div>
        )}
      </Card>
    </div>
  );
}
