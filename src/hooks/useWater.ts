"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import {
  DayData,
  addWaterEntry,
  removeWaterEntry,
  getDayData,
  getTotalMl,
  getGoal,
  setGoal as persistGoal,
  getWeekData,
} from "@/lib/storage";

let version = 0;
const listeners = new Set<() => void>();

function notify() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return version;
}

function getServerSnapshot() {
  return 0;
}

export function useWater() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [mounted, setMounted] = useState(false);

  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
  }

  const dayData: DayData | null = mounted ? getDayData() : null;
  const goal = mounted ? getGoal() : 2000;
  const weekData = mounted ? getWeekData() : [];

  const addWater = useCallback((amount: number) => {
    addWaterEntry(amount);
    notify();
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    removeWaterEntry(entryId);
    notify();
  }, []);

  const updateGoal = useCallback((ml: number) => {
    persistGoal(ml);
    notify();
  }, []);

  const total = dayData ? getTotalMl(dayData) : 0;
  const progress = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;

  return {
    dayData,
    goal,
    total,
    progress,
    weekData,
    addWater,
    removeEntry,
    updateGoal,
  };
}
