"use client";

import { useState, useCallback } from "react";
import type { DailyEntry } from "@/lib/nursing-efficiency/types";

const STORAGE_KEY = "nursing_daily_entries";

function loadFromStorage(): DailyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useDailyEntries() {
  const [entries, setEntries] = useState<DailyEntry[]>(loadFromStorage);

  const saveEntry = useCallback((data: Omit<DailyEntry, "id">) => {
    const id = `${data.nurseId}:${data.date}`;
    setEntries((prev) => {
      const next = [...prev.filter((e) => e.id !== id), { ...data, id }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getEntry = useCallback(
    (nurseId: string, date: string): DailyEntry | undefined =>
      entries.find((e) => e.nurseId === nurseId && e.date === date),
    [entries]
  );

  return { entries, saveEntry, getEntry };
}
