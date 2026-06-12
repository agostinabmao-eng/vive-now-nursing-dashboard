"use client";

import EfficiencyBadge from "@/components/nursing-efficiency/EfficiencyBadge";
// @dev-prototype-start
import { MOCK_NURSES } from "@/lib/dev/nursing-efficiency-mock";
// @dev-prototype-end
import { ENROLLMENT_CONTENT_SHELL, ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import type { NurseCompareWeekRow } from "@/lib/nursing-efficiency/types";
import { cn } from "@/lib/utils/style";

type Props = {
  rows: NurseCompareWeekRow[];
  className?: string;
};

const HEADER_CLASS = `${ENROLLMENT_SECTION_LABEL} px-3 py-2.5 text-left border border-slate-200 bg-[#E8F7FA]/80`;
const CELL_CLASS = "px-3 py-2.5 text-sm text-[#1B3A4F] border border-slate-200 text-center";

export default function NurseCompareMatrixTable({ rows, className }: Props) {
  return (
    <div className={cn(ENROLLMENT_CONTENT_SHELL, "w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[480px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className={HEADER_CLASS}>
              Week
            </th>
            {MOCK_NURSES.map((nurse) => (
              <th key={nurse.id} scope="col" className={cn(HEADER_CLASS, "text-center")}>
                {nurse.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={MOCK_NURSES.length + 1} className={`${CELL_CLASS} py-16 text-center text-[#5F8899]`}>
                Select All Vive Nurses and a date range to compare weekly efficiency.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.weekKey}>
                <td className={`${CELL_CLASS} text-left`}>{row.weekLabel}</td>
                {MOCK_NURSES.map((nurse) => (
                  <td key={nurse.id} className={CELL_CLASS}>
                    <EfficiencyBadge percent={row.byNurse[nurse.id] ?? 0} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
