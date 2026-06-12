"use client";

import { Info } from "lucide-react";
import EfficiencyBadge from "@/components/nursing-efficiency/EfficiencyBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ENROLLMENT_CONTENT_SHELL, ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import {
  ACTIVITY_STANDARD_TOOLTIPS,
  EFFICIENCY_TOOLTIP,
  ESTIMATED_CARE_TIME_TOOLTIP,
  PAID_TIME_TOOLTIP,
} from "@/lib/nursing-efficiency/copy";
import type { EfficiencyTotals, WeeklyEfficiencyRow } from "@/lib/nursing-efficiency/types";
import { formatMixedDuration } from "@/lib/nursing-efficiency/utils";
import { cn } from "@/lib/utils/style";

type Props = {
  rows: WeeklyEfficiencyRow[];
  totals: EfficiencyTotals;
  periodLabel?: string;
  className?: string;
};

const HEADER_CLASS = `${ENROLLMENT_SECTION_LABEL} px-3 py-2.5 text-left border border-slate-200 bg-[#E8F7FA]/80`;
const CELL_CLASS = "px-3 py-2.5 text-sm text-[#1B3A4F] border border-slate-200";
const TOTAL_CELL_CLASS = "px-3 py-2.5 text-sm font-semibold text-[#1B3A4F] border border-slate-200 bg-[#F4F7FA]/60";

function ColumnHeaderWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
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
  );
}

export default function EfficiencySummaryTable({ rows, totals, periodLabel = "Week", className }: Props) {
  return (
    <div className={cn(ENROLLMENT_CONTENT_SHELL, "w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[720px] table-fixed border-collapse">
        <colgroup>
          <col className="w-[14%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[11%]" />
          <col className="w-[18%]" />
          <col className="w-[16%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={HEADER_CLASS}>
              {periodLabel}
            </th>
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
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className={`${CELL_CLASS} py-16 text-center text-[#5F8899]`}>
                Select a date range to view weekly efficiency data.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.weekKey}>
                <td className={CELL_CLASS}>{row.weekLabel}</td>
                <td className={CELL_CLASS}>{row.callsMade}</td>
                <td className={CELL_CLASS}>{row.callsCompletedCpt}</td>
                <td className={CELL_CLASS}>{row.smsSent}</td>
                <td className={CELL_CLASS}>{formatMixedDuration(row.expectedMinutes)}</td>
                <td className={CELL_CLASS}>{formatMixedDuration(row.actualMinutes)}</td>
                <td className={cn(CELL_CLASS, "text-center")}>
                  <EfficiencyBadge percent={row.efficiencyPercent} />
                </td>
              </tr>
            ))
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
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
