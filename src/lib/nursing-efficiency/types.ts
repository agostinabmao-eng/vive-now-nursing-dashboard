import type { DateRange } from "react-day-picker";
import type { DateRangePreset } from "@/types/report";

export type Nurse = {
  id: string;
  name: string;
};

export type PracticeOption = {
  id: string;
  name: string;
};

export type WeekBucket = {
  key: string;
  from: Date;
  to: Date;
  label: string;
};

export type WeeklyDialPadMetrics = {
  weekKey: string;
  callsMade: number;
  callsCompletedCpt: number;
  smsSent: number;
};

export type WeeklyEfficiencyRow = {
  weekKey: string;
  weekLabel: string;
  actualHours: number;
  callsMade: number;
  callsCompletedCpt: number;
  smsSent: number;
  actualMinutes: number;
  expectedMinutes: number;
  efficiencyPercent: number;
  earnings: number;
};

export type EfficiencyTotals = {
  actualHours: number;
  callsMade: number;
  callsCompletedCpt: number;
  smsSent: number;
  actualMinutes: number;
  expectedMinutes: number;
  efficiencyPercent: number;
  earnings: number;
};

export type EfficiencyTier = "high" | "medium" | "low" | "none";

export type NursingEfficiencyViewMode = "summary" | "compare" | "chart";

export type NurseCompareWeekRow = {
  weekKey: string;
  weekLabel: string;
  byNurse: Record<string, number>;
};

export type NurseChartSeries = {
  nurseId: string;
  nurseName: string;
  points: { weekLabel: string; efficiencyPercent: number }[];
};

export type NursingEfficiencyFilters = {
  dateRange: DateRange | undefined;
  datePreset: DateRangePreset;
  nurseId: string;
  practiceId: string;
};

export type MockDialPadQuery = {
  nurseId: string;
  practiceId: string;
  from: Date;
  to: Date;
};

export type MockGustoPaidHoursQuery = {
  nurseId: string;
  weeks: WeekBucket[];
};

export type TimeAllocationSettings = {
  callStandardMinutes: number;
  cptStandardMinutes: number;
  smsStandardMinutes: number;
};

export type DailyEntry = {
  id: string; // `${nurseId}:${date}`
  nurseId: string;
  date: string; // YYYY-MM-DD
  callsMade: number;
  callsCompletedCpt: number;
  smsSent: number;
  paidHours: number;
};
