"use client";

import { Fragment, useState, useEffect } from "react";
import { Info, Pencil, X, Check } from "lucide-react";
import EfficiencyBadge from "@/components/nursing-efficiency/EfficiencyBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import {
  ACTIVITY_STANDARD_TOOLTIPS,
  EFFICIENCY_TOOLTIP,
  ESTIMATED_CARE_TIME_TOOLTIP,
  PAID_TIME_TOOLTIP,
} from "@/lib/nursing-efficiency/copy";
import type { DailyEntry, EfficiencyTotals, WeekBucket, WeeklyEfficiencyRow } from "@/lib/nursing-efficiency/types";
import { formatMixedDuration, formatEarnings } from "@/lib/nursing-efficiency/utils";
import { cn } from "@/lib/utils/style";
import { ALL_NURSES_ID } from "@/lib/nursing-efficiency/dev/nursing-efficiency-mock";
import dayjs from "@/lib/utils/datetime";

type Props = {
  rows: WeeklyEfficiencyRow[];
  totals: EfficiencyTotals;
  periodLabel?: string;
  className?: string;
  isAdmin?: boolean;
  weeks?: WeekBucket[];
  nurseId?: string;
  entries?: DailyEntry[];
  onSaveEntry?: (entry: Omit<DailyEntry, "id">) => void;
};

const HEADER_CLASS = `${ENROLLMENT_SECTION_LABEL} px-5 py-2.5 text-left border border-slate-200 bg-[#E8F7FA]/80`;
const CELL_CLASS = "px-5 py-2.5 text-sm text-[#1B3A4F] border border-slate-200 whitespace-nowrap";
const EDIT_CELL_CLASS = "px-5 py-1.5 border-x border-slate-200 bg-[#F8FBFC]";
const TOTAL_CELL_CLASS = "px-5 py-2.5 text-sm font-semibold text-[#1B3A4F] border border-slate-200 bg-[#F4F7FA]/60";

const EARNINGS_TOOLTIP = "Estimated net earnings: (Calls Completed × $25 revenue) − (Paid Hours × $25 cost).";

function earningsColor(earnings: number): string {
  if (earnings > 0) return "text-vivenowgreen";
  if (earnings < 0) return "text-vivenowred";
  return "";
}

function ColumnHeaderWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <TooltipProvider>
      <span className="inline-flex items-center gap-1">
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex rounded-sm text-[#5F8899] transition-colors hover:text-[#1B3A4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EB1C8]/50"
              aria-label={`About ${label}`}
            >
              <Info className="size-3.5" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </span>
    </TooltipProvider>
  );
}

// ─── Inline edit rows ─────────────────────────────────────────────────────────

type DayDraft = {
  callsMade: string;
  callsCompletedCpt: string;
  smsSent: string;
  paidHours: string;
};

function buildDaysInRange(week: WeekBucket): string[] {
  const days: string[] = [];
  let cursor = dayjs(week.from);
  const end = dayjs(week.to);
  while (!cursor.isAfter(end)) {
    days.push(cursor.format("YYYY-MM-DD"));
    cursor = cursor.add(1, "day");
    if (days.length > 7) break;
  }
  return days;
}

function entryToDraft(entry: DailyEntry | undefined): DayDraft {
  if (!entry) return { callsMade: "", callsCompletedCpt: "", smsSent: "", paidHours: "" };
  return {
    callsMade: String(entry.callsMade),
    callsCompletedCpt: String(entry.callsCompletedCpt),
    smsSent: String(entry.smsSent),
    paidHours: String(entry.paidHours),
  };
}

type WeekEditRowsProps = {
  week: WeekBucket;
  nurseId: string;
  entries: DailyEntry[];
  onSave: (entry: Omit<DailyEntry, "id">) => void;
  onClose: () => void;
  colCount: number;
  showEditCol: boolean;
};

function WeekEditRows({ week, nurseId, entries, onSave, onClose, colCount, showEditCol }: WeekEditRowsProps) {
  const days = buildDaysInRange(week);

  const [drafts, setDrafts] = useState<Record<string, DayDraft>>(() => {
    const init: Record<string, DayDraft> = {};
    for (const date of days) {
      const existing = entries.find((e) => e.nurseId === nurseId && e.date === date);
      init[date] = entryToDraft(existing);
    }
    return init;
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const updated: Record<string, DayDraft> = {};
    for (const date of days) {
      const existing = entries.find((e) => e.nurseId === nurseId && e.date === date);
      updated[date] = entryToDraft(existing);
    }
    setDrafts(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nurseId, week.key]);

  function setField(date: string, field: keyof DayDraft, value: string) {
    setDrafts((prev) => ({ ...prev, [date]: { ...prev[date]!, [field]: value } }));
  }

  function handleSave() {
    for (const date of days) {
      const d = drafts[date]!;
      const calls = parseInt(d.callsMade) || 0;
      const completed = parseInt(d.callsCompletedCpt) || 0;
      const sms = parseInt(d.smsSent) || 0;
      const hours = parseFloat(d.paidHours) || 0;
      if (calls > 0 || completed > 0 || sms > 0 || hours > 0) {
        onSave({ nurseId, date, callsMade: calls, callsCompletedCpt: completed, smsSent: sms, paidHours: hours });
      }
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  const inputClass =
    "h-8 w-full rounded-[8px] border border-[#D6E6ED] bg-white px-2 text-sm text-[#1B3A4F] outline-none placeholder:text-slate-300 focus:border-[#3EB1C8] focus:ring-2 focus:ring-[#3EB1C8]/20";

  return (
    <>
      {/* Day rows — each input aligned to its column */}
      {days.map((date, i) => {
        const d = drafts[date]!;
        const isFirst = i === 0;
        const isLast = i === days.length - 1;
        const label = date === dayjs().format("YYYY-MM-DD")
          ? `Today · ${dayjs(date).format("MMM D")}`
          : dayjs(date).format("ddd, MMM D");

        const cellCls = cn(
          EDIT_CELL_CLASS,
          isFirst && "border-t border-slate-200",
        );

        return (
          <tr key={date} className="bg-[#F8FBFC]">
            {/* Col 0: date label */}
            <td className={cn(cellCls, "text-sm font-medium text-[#1B3A4F] border-l")}>{label}</td>
            {/* Col 1: Calls Made */}
            <td className={cellCls}>
              <input type="number" min="0" value={d.callsMade} onChange={(e) => setField(date, "callsMade", e.target.value)} placeholder="0" className={inputClass} />
            </td>
            {/* Col 2: Calls Completed */}
            <td className={cellCls}>
              <input type="number" min="0" value={d.callsCompletedCpt} onChange={(e) => setField(date, "callsCompletedCpt", e.target.value)} placeholder="0" className={inputClass} />
            </td>
            {/* Col 3: SMS Sent */}
            <td className={cellCls}>
              <input type="number" min="0" value={d.smsSent} onChange={(e) => setField(date, "smsSent", e.target.value)} placeholder="0" className={inputClass} />
            </td>
            {/* Col 4: Estimated Care Time — calculated, no input */}
            <td className={cellCls} />
            {/* Col 5: Paid Hours */}
            <td className={cellCls}>
              <div className="relative">
                <input type="number" min="0" step="0.5" value={d.paidHours} onChange={(e) => setField(date, "paidHours", e.target.value)} placeholder="0" className={cn(inputClass, "pr-9")} />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5F8899]">hrs</span>
              </div>
            </td>
            {/* Col 6: Efficiency — calculated */}
            <td className={cellCls} />
            {/* Col 7: Earnings — calculated */}
            <td className={cn(cellCls, !showEditCol && "border-r")} />
            {/* Col 8: Edit button column — keep space */}
            {showEditCol && <td className={cn(cellCls, "border-r")} />}
          </tr>
        );
      })}

      {/* Save/cancel row */}
      <tr className="bg-[#F8FBFC]">
        <td colSpan={colCount} className="border border-t-0 border-slate-200 px-5 py-2">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#D6E6ED] px-3 text-sm text-[#5F8899] hover:text-[#1B3A4F] transition-colors"
            >
              <X className="size-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saved}
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[#3EB1C8] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1B7A92] disabled:opacity-60"
            >
              {saved ? <><Check className="size-3.5" /> Saved</> : "Save Changes"}
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export default function EfficiencySummaryTable({
  rows,
  totals,
  periodLabel = "Week",
  className,
  isAdmin = false,
  weeks = [],
  nurseId = "",
  entries = [],
  onSaveEntry,
}: Props) {
  const [expandedWeekKey, setExpandedWeekKey] = useState<string | null>(null);
  const canEdit = isAdmin && nurseId !== ALL_NURSES_ID && !!onSaveEntry;
  const showEditCol = canEdit;
  const colCount = showEditCol ? 9 : 8;

  function toggleExpand(weekKey: string) {
    setExpandedWeekKey((prev) => (prev === weekKey ? null : weekKey));
  }

  return (
    <div className={cn("rounded-[10px] overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[11%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            {showEditCol && <col className="w-[4%]" />}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={HEADER_CLASS}>{periodLabel}</th>
              <th scope="col" className={HEADER_CLASS}>
                <ColumnHeaderWithTooltip label="Calls Made" tooltip={ACTIVITY_STANDARD_TOOLTIPS.callsMade} />
              </th>
              <th scope="col" className={HEADER_CLASS}>
                <ColumnHeaderWithTooltip label="Calls Completed" tooltip={ACTIVITY_STANDARD_TOOLTIPS.callsCompleted} />
              </th>
              <th scope="col" className={HEADER_CLASS}>
                <ColumnHeaderWithTooltip label="SMS Sent" tooltip={ACTIVITY_STANDARD_TOOLTIPS.smsSent} />
              </th>
              <th scope="col" className={HEADER_CLASS}>
                <ColumnHeaderWithTooltip label="Estimated Care Time" tooltip={ESTIMATED_CARE_TIME_TOOLTIP} />
              </th>
              <th scope="col" className={HEADER_CLASS}>
                <ColumnHeaderWithTooltip label="Paid Time" tooltip={PAID_TIME_TOOLTIP} />
              </th>
              <th scope="col" className={HEADER_CLASS}>
                <ColumnHeaderWithTooltip label="Efficiency" tooltip={EFFICIENCY_TOOLTIP} />
              </th>
              <th scope="col" className={HEADER_CLASS}>
                <ColumnHeaderWithTooltip label="Earnings" tooltip={EARNINGS_TOOLTIP} />
              </th>
              {showEditCol && <th scope="col" className={HEADER_CLASS} />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className={`${CELL_CLASS} py-16 text-center text-[#5F8899]`}>
                  Select a date range to view weekly efficiency data.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isExpanded = expandedWeekKey === row.weekKey;
                const week = weeks.find((w) => w.key === row.weekKey);
                return (
                  <Fragment key={row.weekKey}>
                    <tr className={isExpanded ? "bg-[#F4F7FA]/60" : undefined}>
                      <td className={CELL_CLASS}>{row.weekLabel}</td>
                      <td className={CELL_CLASS}>{row.callsMade}</td>
                      <td className={CELL_CLASS}>{row.callsCompletedCpt}</td>
                      <td className={CELL_CLASS}>{row.smsSent}</td>
                      <td className={CELL_CLASS}>{formatMixedDuration(row.expectedMinutes)}</td>
                      <td className={CELL_CLASS}>{formatMixedDuration(row.actualMinutes)}</td>
                      <td className={cn(CELL_CLASS, "text-center")}>
                        <EfficiencyBadge percent={row.efficiencyPercent} />
                      </td>
                      <td className={cn(CELL_CLASS, "font-medium", earningsColor(row.earnings))}>
                        {formatEarnings(row.earnings)}
                      </td>
                      {showEditCol && week && (
                        <td className={cn(CELL_CLASS, "text-center")}>
                          <button
                            type="button"
                            onClick={() => toggleExpand(row.weekKey)}
                            className={cn(
                              "inline-flex items-center justify-center rounded-[6px] p-1.5 transition-colors",
                              isExpanded
                                ? "bg-[#3EB1C8] text-white"
                                : "text-[#5F8899] hover:bg-[#E8F7FA] hover:text-[#1B3A4F]"
                            )}
                            aria-label="Edit week data"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                    {isExpanded && week && canEdit && (
                      <WeekEditRows
                        week={week}
                        nurseId={nurseId}
                        entries={entries}
                        onSave={onSaveEntry!}
                        onClose={() => setExpandedWeekKey(null)}
                        colCount={colCount}
                        showEditCol={showEditCol}
                      />
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td className={TOTAL_CELL_CLASS}>Total</td>
                <td className={TOTAL_CELL_CLASS}>{totals.callsMade}</td>
                <td className={TOTAL_CELL_CLASS}>{totals.callsCompletedCpt}</td>
                <td className={TOTAL_CELL_CLASS}>{totals.smsSent}</td>
                <td className={TOTAL_CELL_CLASS}>{formatMixedDuration(totals.expectedMinutes)}</td>
                <td className={TOTAL_CELL_CLASS}>{formatMixedDuration(totals.actualMinutes)}</td>
                <td className={cn(TOTAL_CELL_CLASS, "text-center")}>
                  <EfficiencyBadge percent={totals.efficiencyPercent} />
                </td>
                <td className={cn(TOTAL_CELL_CLASS, earningsColor(totals.earnings))}>
                  {formatEarnings(totals.earnings)}
                </td>
                {showEditCol && <td className={TOTAL_CELL_CLASS} />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
