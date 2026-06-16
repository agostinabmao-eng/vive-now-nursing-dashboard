"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { MOCK_NURSES } from "@/lib/nursing-efficiency/dev/nursing-efficiency-mock";
import { ENROLLMENT_CONTENT_SHELL, ENROLLMENT_SECTION_LABEL } from "@/lib/enrollment/styles";
import { DropdownMenu } from "@/components/ui/dropDownMenu";
import EfficiencyBadge from "@/components/nursing-efficiency/EfficiencyBadge";
import { computeEfficiencyPercent, computeExpectedMinutes } from "@/lib/nursing-efficiency/utils";
import type { DailyEntry } from "@/lib/nursing-efficiency/types";
import dayjs from "@/lib/utils/datetime";
import { cn } from "@/lib/utils/style";

const NURSE_OPTIONS = MOCK_NURSES.map((n) => ({ value: n.id, label: n.name }));
const NURSE_STORAGE_KEY = "nursing_selected_nurse";

function formatDateLabel(dateStr: string): string {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  if (dateStr === today) return `Today · ${dayjs(dateStr).format("MMM D, YYYY")}`;
  if (dateStr === yesterday) return `Yesterday · ${dayjs(dateStr).format("MMM D, YYYY")}`;
  return dayjs(dateStr).format("ddd, MMM D, YYYY");
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  error?: string;
  suffix?: string;
};

function Field({ label, value, onChange, step = "1", error, suffix }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
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
            suffix && "pr-10"
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5F8899]">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-vivenowred">{error}</span>}
    </div>
  );
}

type Props = {
  onSave: (entry: Omit<DailyEntry, "id">) => void;
  getEntry: (nurseId: string, date: string) => DailyEntry | undefined;
};

export default function NurseDataEntryCard({ onSave, getEntry }: Props) {
  const [nurseId, setNurseId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(NURSE_STORAGE_KEY) ?? MOCK_NURSES[0]!.id;
    }
    return MOCK_NURSES[0]!.id;
  });

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

  function handleNurseChange(id: string) {
    setNurseId(id);
    localStorage.setItem(NURSE_STORAGE_KEY, id);
  }

  function goBack() {
    setDate((prev) => dayjs(prev).subtract(1, "day").format("YYYY-MM-DD"));
  }

  function goForward() {
    if (date < today) {
      setDate((prev) => dayjs(prev).add(1, "day").format("YYYY-MM-DD"));
    }
  }

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
    <div className={cn(ENROLLMENT_CONTENT_SHELL, "flex flex-col gap-5")}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1B3A4F]">Log your daily data</h2>
          <p className="text-xs text-[#5F8899]">Enter today's activity. You can also go back to edit previous days.</p>
        </div>
        <div className="w-44">
          <DropdownMenu options={NURSE_OPTIONS} value={nurseId} onValueChange={handleNurseChange} />
        </div>
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={goBack}
          type="button"
          className="rounded-full p-1 text-[#5F8899] transition-colors hover:bg-[#E8F7FA] hover:text-[#1B3A4F]"
          aria-label="Previous day"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="min-w-[16rem] text-center text-sm font-medium text-[#1B3A4F]">
          {formatDateLabel(date)}
          {isEditing && (
            <span className="ml-2 rounded-full bg-[#E8F7FA] px-2 py-0.5 text-xs text-[#1B7A92]">
              Editing
            </span>
          )}
        </span>
        <button
          onClick={goForward}
          type="button"
          disabled={date >= today}
          className="rounded-full p-1 text-[#5F8899] transition-colors hover:bg-[#E8F7FA] hover:text-[#1B3A4F] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next day"
        >
          <ChevronRight className="size-5" />
        </button>
        {date !== today && (
          <button
            onClick={() => setDate(today)}
            type="button"
            className="text-xs text-[#3EB1C8] hover:underline"
          >
            Back to today
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Field label="Calls Made" value={callsMade} onChange={setCallsMade} />
        <Field
          label="Calls Completed"
          value={callsCompletedCpt}
          onChange={setCallsCompletedCpt}
          error={completedExceedsCalls ? "Can't exceed Calls Made" : undefined}
        />
        <Field label="SMS Sent" value={smsSent} onChange={setSmsSent} />
        <Field label="Paid Hours" value={paidHours} onChange={setPaidHours} step="0.5" suffix="hrs" />
      </div>

      {/* Footer: preview + save */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <span className={ENROLLMENT_SECTION_LABEL}>Efficiency preview</span>
          {showPreview ? (
            <EfficiencyBadge percent={efficiency} />
          ) : (
            <span className="text-sm text-[#5F8899]">—</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || saved}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#3EB1C8] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1B7A92] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saved ? (
            <><Check className="size-4" /> Saved</>
          ) : isEditing ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
