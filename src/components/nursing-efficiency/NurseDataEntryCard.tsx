"use client";

import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { MOCK_NURSES } from "@/lib/nursing-efficiency/dev/nursing-efficiency-mock";
import { ENROLLMENT_CONTENT_SHELL, ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import { DropdownMenu } from "@/components/ui/dropDownMenu";
import EfficiencyBadge from "@/components/nursing-efficiency/EfficiencyBadge";
import { computeEfficiencyPercent, computeExpectedMinutes } from "@/lib/nursing-efficiency/utils";
import type { DailyEntry } from "@/lib/nursing-efficiency/types";
import dayjs from "@/lib/utils/datetime";
import { cn } from "@/lib/utils/style";

const NURSE_STORAGE_KEY = "nursing_selected_nurse";
const DATE_HISTORY_DAYS = 14;

function buildDateOptions(): { value: string; label: string }[] {
  const options = [];
  for (let i = 0; i < DATE_HISTORY_DAYS; i++) {
    const d = dayjs().subtract(i, "day");
    const value = d.format("YYYY-MM-DD");
    let label: string;
    if (i === 0) label = `Today · ${d.format("MMM D, YYYY")}`;
    else if (i === 1) label = `Yesterday · ${d.format("MMM D, YYYY")}`;
    else label = d.format("ddd, MMM D, YYYY");
    options.push({ value, label });
  }
  return options;
}

const DATE_OPTIONS = buildDateOptions();

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  error?: boolean;
  suffix?: string;
};

function Field({ label, value, onChange, step = "1", error, suffix }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className={ENROLLMENT_SECTION_LABEL}>{label}</span>
      <div className="relative">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={cn(
            "h-9 w-full rounded-[10px] border px-3 text-sm text-[#1B3A4F] outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-[#3EB1C8]/20",
            error ? "border-vivenowred focus:border-vivenowred" : "border-[#D6E6ED] focus:border-[#3EB1C8]",
            suffix && "pr-9"
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5F8899]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

type Props = {
  onSave: (entry: Omit<DailyEntry, "id">) => void;
  getEntry: (nurseId: string, date: string) => DailyEntry | undefined;
};

export default function NurseDataEntryCard({ onSave, getEntry }: Props) {
  // In production this would come from auth. For the prototype, use localStorage-persisted nurse.
  const nurseId: string = typeof window !== "undefined"
    ? (localStorage.getItem(NURSE_STORAGE_KEY) ?? MOCK_NURSES[0]!.id)
    : MOCK_NURSES[0]!.id;

  const today = dayjs().format("YYYY-MM-DD");
  const [date, setDate] = useState(today);
  const [saved, setSaved] = useState(false);
  const [callsMade, setCallsMade] = useState("");
  const [callsCompletedCpt, setCallsCompletedCpt] = useState("");
  const [smsSent, setSmsSent] = useState("");
  const [paidHours, setPaidHours] = useState("");

  const loadEntry = useCallback(() => {
    const entry = getEntry(nurseId, date);
    if (entry) {
      setCallsMade(String(entry.callsMade));
      setCallsCompletedCpt(String(entry.callsCompletedCpt));
      setSmsSent(String(entry.smsSent));
      setPaidHours(String(entry.paidHours));
    } else {
      setCallsMade("");
      setCallsCompletedCpt("");
      setSmsSent("");
      setPaidHours("");
    }
    setSaved(false);
  }, [nurseId, date, getEntry]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const calls = parseInt(callsMade) || 0;
  const completed = parseInt(callsCompletedCpt) || 0;
  const sms = parseInt(smsSent) || 0;
  const hours = parseFloat(paidHours) || 0;

  const completedExceedsCalls = callsCompletedCpt !== "" && callsMade !== "" && completed > calls;
  const hasAnyValue = callsMade !== "" || callsCompletedCpt !== "" || smsSent !== "" || paidHours !== "";
  const isValid = hasAnyValue && !completedExceedsCalls && hours > 0;
  const isEditing = !!getEntry(nurseId, date);

  const expectedMinutes = computeExpectedMinutes(calls, completed, sms);
  const actualMinutes = hours * 60;
  const efficiency = computeEfficiencyPercent(expectedMinutes, actualMinutes);
  const showPreview = hours > 0 || calls > 0 || sms > 0;

  function handleSave() {
    if (!isValid) return;
    onSave({ nurseId, date, callsMade: calls, callsCompletedCpt: completed, smsSent: sms, paidHours: hours });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={cn(ENROLLMENT_CONTENT_SHELL, "flex flex-col gap-4")}>
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-[#1B3A4F]">Log your daily data</h2>
        <p className="text-xs text-[#5F8899]">Enter today's activity. You can also go back to edit previous days.</p>
      </div>

      {/* Date dropdown */}
      <div className="w-64">
        <DropdownMenu
          options={DATE_OPTIONS}
          value={date}
          onValueChange={(val) => setDate(String(val))}
        />
        {isEditing && (
          <span className="mt-1 inline-block rounded-full bg-[#E8F7FA] px-2 py-0.5 text-xs text-[#1B7A92]">
            Editing
          </span>
        )}
      </div>

      {/* Fields + efficiency + save — all in one row */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-28">
          <Field label="Calls Made" value={callsMade} onChange={setCallsMade} />
        </div>
        <div className="w-36">
          <Field
            label="Calls Completed"
            value={callsCompletedCpt}
            onChange={setCallsCompletedCpt}
            error={completedExceedsCalls}
          />
          {completedExceedsCalls && (
            <span className="mt-0.5 block text-xs text-vivenowred">Can't exceed Calls Made</span>
          )}
        </div>
        <div className="w-28">
          <Field label="SMS Sent" value={smsSent} onChange={setSmsSent} />
        </div>
        <div className="w-32">
          <Field label="Paid Hours" value={paidHours} onChange={setPaidHours} step="0.5" suffix="hrs" />
        </div>

        <div className="flex flex-col gap-1">
          <span className={ENROLLMENT_SECTION_LABEL}>Efficiency preview</span>
          <div className="flex h-9 items-center">
            {showPreview ? (
              <EfficiencyBadge percent={efficiency} />
            ) : (
              <span className="text-sm text-[#5F8899]">—</span>
            )}
          </div>
        </div>

        <div className="ml-auto flex flex-col gap-1">
          <span className={cn(ENROLLMENT_SECTION_LABEL, "invisible")}>save</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid || saved}
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#3EB1C8] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1B7A92] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saved ? (
              <><Check className="size-4" /> Saved</>
            ) : isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
