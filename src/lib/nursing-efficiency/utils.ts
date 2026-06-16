import { addDays, addWeeks, endOfWeek, isAfter, max as maxDate, min as minDate, startOfWeek } from "date-fns";
import dayjs from "@/lib/utils/datetime";
import type {
  EfficiencyTier,
  EfficiencyTotals,
  TimeAllocationSettings,
  WeekBucket,
  WeeklyEfficiencyRow,
  WeeklyDialPadMetrics,
} from "./types";

export const DEFAULT_TIME_ALLOCATION: TimeAllocationSettings = {
  callStandardMinutes: 10,
  cptStandardMinutes: 25,
  smsStandardMinutes: 2,
};

export function formatWeekKey(from: Date): string {
  return dayjs(from).format("YYYY-MM-DD");
}

export function formatWeekLabel(from: Date, to: Date): string {
  return `${dayjs(from).format("M/D")} - ${dayjs(to).format("M/D")}`;
}

export function buildDayBuckets(from: Date, to: Date): WeekBucket[] {
  const buckets: WeekBucket[] = [];
  let cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);

  while (!isAfter(cursor, to)) {
    buckets.push({
      key: formatWeekKey(cursor),
      from: new Date(cursor),
      to: new Date(cursor),
      label: dayjs(cursor).format("ddd M/D"),
    });
    cursor = addDays(cursor, 1);
    if (buckets.length > 31) break;
  }

  return buckets;
}

export function buildWeekBuckets(from: Date, to: Date): WeekBucket[] {
  const buckets: WeekBucket[] = [];
  let cursor = startOfWeek(from);

  while (!isAfter(cursor, to)) {
    const weekStart = maxDate([cursor, from]);
    const weekEnd = minDate([endOfWeek(cursor), to]);
    const key = formatWeekKey(weekStart);

    buckets.push({
      key,
      from: weekStart,
      to: weekEnd,
      label: formatWeekLabel(weekStart, weekEnd),
    });

    cursor = addWeeks(cursor, 1);
    if (buckets.length > 52) break;
  }

  return buckets;
}

export function computeExpectedMinutes(
  callsMade: number,
  callsCompletedCpt: number,
  smsSent: number,
  allocation: TimeAllocationSettings = DEFAULT_TIME_ALLOCATION
): number {
  return (
    callsMade * allocation.callStandardMinutes +
    callsCompletedCpt * allocation.cptStandardMinutes +
    smsSent * allocation.smsStandardMinutes
  );
}

export function computeEfficiencyPercent(expectedMinutes: number, actualMinutes: number): number {
  if (actualMinutes <= 0) return 0;
  return (expectedMinutes / actualMinutes) * 100;
}

export function getEfficiencyTier(percent: number): EfficiencyTier {
  if (percent <= 0) return "none";
  if (percent > 70) return "high";
  if (percent >= 35) return "medium";
  return "low";
}

export function formatMixedDuration(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

const CPT_REVENUE_PER_CALL = 25;
const NURSE_COST_PER_HOUR = 25;

export function computeEarnings(callsCompletedCpt: number, actualHours: number): number {
  return callsCompletedCpt * CPT_REVENUE_PER_CALL - actualHours * NURSE_COST_PER_HOUR;
}

export function formatEarnings(earnings: number): string {
  const abs = Math.abs(Math.round(earnings));
  return earnings >= 0 ? `+$${abs}` : `-$${abs}`;
}

export function buildEfficiencyRow(
  week: WeekBucket,
  metrics: WeeklyDialPadMetrics,
  actualHours: number,
  allocation: TimeAllocationSettings = DEFAULT_TIME_ALLOCATION
): WeeklyEfficiencyRow {
  const actualMinutes = actualHours * 60;
  const expectedMinutes = computeExpectedMinutes(
    metrics.callsMade,
    metrics.callsCompletedCpt,
    metrics.smsSent,
    allocation
  );

  return {
    weekKey: week.key,
    weekLabel: week.label,
    actualHours,
    callsMade: metrics.callsMade,
    callsCompletedCpt: metrics.callsCompletedCpt,
    smsSent: metrics.smsSent,
    actualMinutes,
    expectedMinutes,
    efficiencyPercent: computeEfficiencyPercent(expectedMinutes, actualMinutes),
    earnings: computeEarnings(metrics.callsCompletedCpt, actualHours),
  };
}

export function buildEfficiencyTotals(rows: WeeklyEfficiencyRow[]): EfficiencyTotals {
  const totals = rows.reduce(
    (acc, row) => ({
      actualHours: acc.actualHours + row.actualHours,
      callsMade: acc.callsMade + row.callsMade,
      callsCompletedCpt: acc.callsCompletedCpt + row.callsCompletedCpt,
      smsSent: acc.smsSent + row.smsSent,
      actualMinutes: acc.actualMinutes + row.actualMinutes,
      expectedMinutes: acc.expectedMinutes + row.expectedMinutes,
      earnings: acc.earnings + row.earnings,
    }),
    {
      actualHours: 0,
      callsMade: 0,
      callsCompletedCpt: 0,
      smsSent: 0,
      actualMinutes: 0,
      expectedMinutes: 0,
      earnings: 0,
    }
  );

  return {
    ...totals,
    efficiencyPercent: computeEfficiencyPercent(totals.expectedMinutes, totals.actualMinutes),
  };
}

export function actualHoursKey(nurseId: string, weekKey: string): string {
  return `${nurseId}:${weekKey}`;
}
