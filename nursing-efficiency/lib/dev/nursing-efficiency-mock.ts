// @dev-prototype-start
// Temporary mock data layer for the Nursing Efficiency Dashboard prototype.
// Replace with real API integrations before production merge:
//   - DialPad API/webhook → weekly callsMade, callsCompletedCpt, smsSent per nurse/practice
//   - Gusto API → read-only paid hours per nurse/week (Paid Time column)
// Nurse daily hours self-report (end-of-shift) is a separate nurse-facing flow that feeds Gusto;
// it does not belong on this management dashboard.
// Backend handoff: role gating (management-only) is TBD with team leader — not enforced here.
import type {
  MockDialPadQuery,
  MockGustoPaidHoursQuery,
  Nurse,
  PracticeOption,
  WeeklyDialPadMetrics,
} from "@/lib/nursing-efficiency/types";
import { actualHoursKey } from "@/lib/nursing-efficiency/utils";

export const ALL_NURSES_ID = "all";
export const ALL_PRACTICES_ID = "all";

export const MOCK_NURSES: Nurse[] = [
  { id: "nurse-diane", name: "Diane" },
  { id: "nurse-mel", name: "Mel" },
  { id: "nurse-samantha", name: "Samantha" },
];

export const MOCK_PRACTICES: PracticeOption[] = [
  { id: ALL_PRACTICES_ID, name: "All Practices" },
  { id: "practice-sunrise", name: "Sunrise Family Medicine" },
  { id: "practice-coastal", name: "Coastal Heart & Vascular" },
  { id: "practice-valley", name: "Valley Primary Care" },
];

type RawMetricRecord = {
  nurseId: string;
  practiceId: string;
  weekKey: string;
  callsMade: number;
  callsCompletedCpt: number;
  smsSent: number;
};

const RAW_METRICS: RawMetricRecord[] = [
  { nurseId: "nurse-diane", practiceId: "practice-sunrise", weekKey: "2025-05-26", callsMade: 18, callsCompletedCpt: 6, smsSent: 22 },
  { nurseId: "nurse-diane", practiceId: "practice-sunrise", weekKey: "2025-06-02", callsMade: 20, callsCompletedCpt: 8, smsSent: 25 },
  { nurseId: "nurse-diane", practiceId: "practice-coastal", weekKey: "2025-05-26", callsMade: 12, callsCompletedCpt: 4, smsSent: 15 },
  { nurseId: "nurse-diane", practiceId: "practice-coastal", weekKey: "2025-06-02", callsMade: 14, callsCompletedCpt: 5, smsSent: 18 },
  { nurseId: "nurse-mel", practiceId: "practice-sunrise", weekKey: "2025-05-26", callsMade: 16, callsCompletedCpt: 5, smsSent: 20 },
  { nurseId: "nurse-mel", practiceId: "practice-sunrise", weekKey: "2025-06-02", callsMade: 15, callsCompletedCpt: 4, smsSent: 19 },
  { nurseId: "nurse-mel", practiceId: "practice-valley", weekKey: "2025-05-26", callsMade: 10, callsCompletedCpt: 3, smsSent: 12 },
  { nurseId: "nurse-mel", practiceId: "practice-valley", weekKey: "2025-06-02", callsMade: 11, callsCompletedCpt: 3, smsSent: 14 },
  { nurseId: "nurse-samantha", practiceId: "practice-coastal", weekKey: "2025-05-26", callsMade: 22, callsCompletedCpt: 9, smsSent: 28 },
  { nurseId: "nurse-samantha", practiceId: "practice-coastal", weekKey: "2025-06-02", callsMade: 24, callsCompletedCpt: 10, smsSent: 30 },
  { nurseId: "nurse-samantha", practiceId: "practice-valley", weekKey: "2025-05-26", callsMade: 14, callsCompletedCpt: 4, smsSent: 16 },
  { nurseId: "nurse-samantha", practiceId: "practice-valley", weekKey: "2025-06-02", callsMade: 13, callsCompletedCpt: 4, smsSent: 17 },
];

function filterRecords(query: MockDialPadQuery): RawMetricRecord[] {
  const nurseIds = query.nurseId === ALL_NURSES_ID ? MOCK_NURSES.map((n) => n.id) : [query.nurseId];
  const practiceIds =
    query.practiceId === ALL_PRACTICES_ID
      ? MOCK_PRACTICES.filter((p) => p.id !== ALL_PRACTICES_ID).map((p) => p.id)
      : [query.practiceId];

  return RAW_METRICS.filter((record) => nurseIds.includes(record.nurseId) && practiceIds.includes(record.practiceId));
}

function aggregateByWeek(records: RawMetricRecord[]): WeeklyDialPadMetrics[] {
  const byWeek = new Map<string, WeeklyDialPadMetrics>();

  records.forEach((record) => {
    const existing = byWeek.get(record.weekKey);
    if (existing) {
      byWeek.set(record.weekKey, {
        weekKey: record.weekKey,
        callsMade: existing.callsMade + record.callsMade,
        callsCompletedCpt: existing.callsCompletedCpt + record.callsCompletedCpt,
        smsSent: existing.smsSent + record.smsSent,
      });
      return;
    }

    byWeek.set(record.weekKey, {
      weekKey: record.weekKey,
      callsMade: record.callsMade,
      callsCompletedCpt: record.callsCompletedCpt,
      smsSent: record.smsSent,
    });
  });

  return Array.from(byWeek.values());
}

function generateFallbackMetrics(weekKeys: string[]): WeeklyDialPadMetrics[] {
  return weekKeys.map((weekKey, index) => ({
    weekKey,
    callsMade: 12 + (index % 4) * 3,
    callsCompletedCpt: 4 + (index % 3),
    smsSent: 14 + (index % 5) * 2,
  }));
}

export function getMockDialPadMetrics(query: MockDialPadQuery, weekKeys: string[]): WeeklyDialPadMetrics[] {
  const filtered = filterRecords(query);
  const aggregated = aggregateByWeek(filtered);

  return weekKeys.map((weekKey) => {
    const match = aggregated.find((item) => item.weekKey === weekKey);
    if (match) return match;

    const fallback = generateFallbackMetrics([weekKey])[0];
    return fallback;
  });
}

const DEFAULT_HOURS_BY_NURSE: Record<string, number[]> = {
  "nurse-diane": [32, 36, 34, 38],
  "nurse-mel": [28, 30, 29, 31],
  "nurse-samantha": [40, 42, 39, 41],
};

export function getMockGustoPaidHours(query: MockGustoPaidHoursQuery): Record<string, number> {
  const nurseIds = query.nurseId === ALL_NURSES_ID ? MOCK_NURSES.map((n) => n.id) : [query.nurseId];
  const result: Record<string, number> = {};

  nurseIds.forEach((nurseId) => {
    const seedHours = DEFAULT_HOURS_BY_NURSE[nurseId] ?? [30, 32, 31, 33];
    query.weeks.forEach((week, index) => {
      result[actualHoursKey(nurseId, week.key)] = seedHours[index % seedHours.length];
    });
  });

  return result;
}

/** @deprecated Use getMockGustoPaidHours */
export function getDefaultActualHours(query: MockGustoPaidHoursQuery): Record<string, number> {
  return getMockGustoPaidHours(query);
}

export function getNurseDropdownOptions(): { value: string; label: string }[] {
  return [{ value: ALL_NURSES_ID, label: "All Vive Nurses" }, ...MOCK_NURSES.map((n) => ({ value: n.id, label: n.name }))];
}

export function getPracticeDropdownOptions(): { value: string; label: string }[] {
  return MOCK_PRACTICES.map((p) => ({ value: p.id, label: p.name }));
}
// @dev-prototype-end
