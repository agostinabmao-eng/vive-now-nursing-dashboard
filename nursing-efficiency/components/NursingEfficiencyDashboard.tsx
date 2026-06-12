"use client";

import Card from "@/components/ui/card/Card";
import EfficiencySummaryTable from "@/components/nursing-efficiency/EfficiencySummaryTable";
import NurseCompareMatrixTable from "@/components/nursing-efficiency/NurseCompareMatrixTable";
import NurseEfficiencyChart from "@/components/nursing-efficiency/NurseEfficiencyChart";
import NursingEfficiencyFilters from "@/components/nursing-efficiency/NursingEfficiencyFilters";
import { ENROLLMENT_CONTENT_SHELL, ENROLLMENT_PAGE_BG, ENROLLMENT_PAGE_MIN_HEIGHT } from "@/lib/enrollment/styles";
import { useNursingEfficiency } from "@/lib/nursing-efficiency/hooks/useNursingEfficiency";
import { cn } from "@/lib/utils/style";

export default function NursingEfficiencyDashboard() {
  const {
    filters,
    viewMode,
    rows,
    totals,
    compareRows,
    chartSeries,
    isAllNurses,
    isWeekPreset,
    setDateRange,
    setNurseId,
    setPracticeId,
    setViewMode,
  } = useNursingEfficiency();

  return (
    <div className={cn(ENROLLMENT_PAGE_BG, "min-h-full")}>
      {/* @dev-prototype-start
       * Prototype dashboard — mock data from lib/dev/nursing-efficiency-mock.ts.
       *   - Paid Time: read-only from Gusto payroll (mock). Replace with Gusto API sync.
       *   - Activity metrics: read-only from DialPad (mock). Replace with DialPad API/webhook.
       *   - Activity Time Standards (10/25/2 min): hardcoded constants; future admin config in Settings.
       * Nurse daily hours entry (end-of-shift self-report) is a separate nurse-facing flow — not this page.
       * Role gating (management-only) pending team leader confirmation; not enforced here.
       * @dev-prototype-end */}
      <Card className={cn(ENROLLMENT_CONTENT_SHELL, ENROLLMENT_PAGE_MIN_HEIGHT, "flex flex-col gap-6 shadow-sm")}>
        <div className="flex shrink-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[#1B3A4F] md:text-3xl">Nursing Efficiency</h1>
          <p className="text-sm text-[#5F8899]">
            Efficiency compares payroll hours against an activity-based estimate from DialPad logs.
          </p>
          <p className="text-xs text-[#5F8899]">Paid hours · Gusto (mock)</p>
        </div>

        <div className="shrink-0">
          <NursingEfficiencyFilters
            filters={filters}
            viewMode={viewMode}
            isAllNurses={isAllNurses}
            onDateRangeChange={setDateRange}
            onNurseChange={setNurseId}
            onPracticeChange={setPracticeId}
            onViewModeChange={setViewMode}
          />
        </div>

        <div className="shrink-0">
          {viewMode === "summary" && <EfficiencySummaryTable rows={rows} totals={totals} periodLabel={isWeekPreset ? "Day" : "Week"} />}
          {viewMode === "compare" && <NurseCompareMatrixTable rows={compareRows} />}
          {viewMode === "chart" && <NurseEfficiencyChart series={chartSeries} />}
        </div>
      </Card>
    </div>
  );
}
