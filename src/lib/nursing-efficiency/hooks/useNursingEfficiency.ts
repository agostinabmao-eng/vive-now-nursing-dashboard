"use client";

import { useCallback, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { getPresetRange } from "@/components/ui/datetime/PresetDateTimeRanges";
import {
  ALL_NURSES_ID,
  ALL_PRACTICES_ID,
  getMockDialPadMetrics,
  getMockGustoPaidHours,
  MOCK_NURSES,
} from "@/lib/nursing-efficiency/dev/nursing-efficiency-mock";
import type {
  EfficiencyTotals,
  NurseChartSeries,
  NurseCompareWeekRow,
  NursingEfficiencyFilters,
  NursingEfficiencyViewMode,
  WeeklyEfficiencyRow,
  WeekBucket,
} from "@/lib/nursing-efficiency/types";
import {
  actualHoursKey,
  buildDayBuckets,
  buildEfficiencyRow,
  buildEfficiencyTotals,
  buildWeekBuckets,
  DEFAULT_TIME_ALLOCATION,
} from "@/lib/nursing-efficiency/utils";
import type { DateRangePreset } from "@/types/report";

function createDefaultFilters(): NursingEfficiencyFilters {
  const defaultRange = getPresetRange("this_month") ?? undefined;
  return {
    dateRange: defaultRange ?? undefined,
    datePreset: "this_month",
    nurseId: ALL_NURSES_ID,
    practiceId: ALL_PRACTICES_ID,
  };
}

function sumPaidHoursForWeek(
  weekKey: string,
  nurseId: string,
  paidHoursByWeek: Record<string, number>
): number {
  if (nurseId !== ALL_NURSES_ID) {
    return paidHoursByWeek[actualHoursKey(nurseId, weekKey)] ?? 0;
  }

  return MOCK_NURSES.reduce((sum, nurse) => sum + (paidHoursByWeek[actualHoursKey(nurse.id, weekKey)] ?? 0), 0);
}

function buildRowsForNurse(
  nurseId: string,
  practiceId: string,
  weeks: WeekBucket[],
  from: Date,
  to: Date
): WeeklyEfficiencyRow[] {
  const weekKeys = weeks.map((week) => week.key);
  const paidHoursByWeek = getMockGustoPaidHours({ nurseId, weeks });
  const metrics = getMockDialPadMetrics({ nurseId, practiceId, from, to }, weekKeys);

  return weeks.map((week) => {
    const weekMetrics = metrics.find((item) => item.weekKey === week.key) ?? {
      weekKey: week.key,
      callsMade: 0,
      callsCompletedCpt: 0,
      smsSent: 0,
    };
    const paidHours = paidHoursByWeek[actualHoursKey(nurseId, week.key)] ?? 0;
    return buildEfficiencyRow(week, weekMetrics, paidHours, DEFAULT_TIME_ALLOCATION);
  });
}

export function useNursingEfficiency() {
  const [filters, setFilters] = useState<NursingEfficiencyFilters>(createDefaultFilters);
  const [viewMode, setViewMode] = useState<NursingEfficiencyViewMode>("summary");

  const isAllNurses = filters.nurseId === ALL_NURSES_ID;

  const setDateRange = useCallback((range: DateRange, preset: DateRangePreset) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range,
      datePreset: preset,
    }));
  }, []);

  const setNurseId = useCallback((nurseId: string) => {
    setFilters((prev) => ({ ...prev, nurseId }));
    if (nurseId !== ALL_NURSES_ID) {
      setViewMode((current) => (current === "compare" ? "summary" : current));
    }
  }, []);

  const setPracticeId = useCallback((practiceId: string) => {
    setFilters((prev) => ({ ...prev, practiceId }));
  }, []);

  const setViewModeSafe = useCallback((mode: NursingEfficiencyViewMode) => {
    if (mode === "compare" && filters.nurseId !== ALL_NURSES_ID) return;
    setViewMode(mode);
  }, [filters.nurseId]);

  const isWeekPreset = filters.datePreset === "this_week" || filters.datePreset === "last_week";

  const weeks = useMemo(() => {
    const from = filters.dateRange?.from;
    const to = filters.dateRange?.to;
    if (!from || !to) return [];
    return isWeekPreset ? buildDayBuckets(from, to) : buildWeekBuckets(from, to);
  }, [filters.dateRange, isWeekPreset]);

  const paidHoursByWeek = useMemo(() => {
    if (weeks.length === 0) return {};
    return getMockGustoPaidHours({ nurseId: filters.nurseId, weeks });
  }, [filters.nurseId, weeks]);

  const rows: WeeklyEfficiencyRow[] = useMemo(() => {
    const from = filters.dateRange?.from;
    const to = filters.dateRange?.to;
    if (!from || !to) return [];

    const weekKeys = weeks.map((week) => week.key);
    const metrics = getMockDialPadMetrics(
      {
        nurseId: filters.nurseId,
        practiceId: filters.practiceId,
        from,
        to,
      },
      weekKeys
    );

    return weeks.map((week) => {
      const weekMetrics = metrics.find((item) => item.weekKey === week.key) ?? {
        weekKey: week.key,
        callsMade: 0,
        callsCompletedCpt: 0,
        smsSent: 0,
      };
      const paidHours = sumPaidHoursForWeek(week.key, filters.nurseId, paidHoursByWeek);
      return buildEfficiencyRow(week, weekMetrics, paidHours, DEFAULT_TIME_ALLOCATION);
    });
  }, [filters, weeks, paidHoursByWeek]);

  const totals: EfficiencyTotals = useMemo(() => buildEfficiencyTotals(rows), [rows]);

  const compareRows: NurseCompareWeekRow[] = useMemo(() => {
    const from = filters.dateRange?.from;
    const to = filters.dateRange?.to;
    if (!from || !to || weeks.length === 0 || !isAllNurses) return [];

    const rowsByNurse = MOCK_NURSES.map((nurse) => ({
      nurseId: nurse.id,
      rows: buildRowsForNurse(nurse.id, filters.practiceId, weeks, from, to),
    }));

    return weeks.map((week) => ({
      weekKey: week.key,
      weekLabel: week.label,
      byNurse: Object.fromEntries(
        rowsByNurse.map(({ nurseId, rows: nurseRows }) => {
          const match = nurseRows.find((row) => row.weekKey === week.key);
          return [nurseId, match?.efficiencyPercent ?? 0];
        })
      ),
    }));
  }, [filters.practiceId, isAllNurses, weeks, filters.dateRange]);

  const chartSeries: NurseChartSeries[] = useMemo(() => {
    const from = filters.dateRange?.from;
    const to = filters.dateRange?.to;
    if (!from || !to || weeks.length === 0) return [];

    const nursesToChart = isAllNurses
      ? MOCK_NURSES
      : MOCK_NURSES.filter((nurse) => nurse.id === filters.nurseId);

    return nursesToChart.map((nurse) => {
      const nurseRows = buildRowsForNurse(nurse.id, filters.practiceId, weeks, from, to);
      return {
        nurseId: nurse.id,
        nurseName: nurse.name,
        points: nurseRows.map((row) => ({
          weekLabel: row.weekLabel,
          efficiencyPercent: row.efficiencyPercent,
        })),
      };
    });
  }, [filters.nurseId, filters.practiceId, isAllNurses, weeks, filters.dateRange]);

  return {
    filters,
    viewMode,
    weeks,
    rows,
    totals,
    compareRows,
    chartSeries,
    isAllNurses,
    isWeekPreset,
    setDateRange,
    setNurseId,
    setPracticeId,
    setViewMode: setViewModeSafe,
  };
}
