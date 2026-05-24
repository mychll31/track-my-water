export interface WaterEntry {
  id: string;
  amount: number; // in ml
  timestamp: number;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  entries: WaterEntry[];
  goal: number; // in ml
}

const STORAGE_KEY = "track-my-water";
const GOAL_KEY = "track-my-water-goal";
const DEFAULT_GOAL = 2000; // 2L

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getGoal(): number {
  if (typeof window === "undefined") return DEFAULT_GOAL;
  const saved = localStorage.getItem(GOAL_KEY);
  return saved ? parseInt(saved, 10) : DEFAULT_GOAL;
}

export function setGoal(ml: number): void {
  localStorage.setItem(GOAL_KEY, String(ml));
}

export function getDayData(date?: string): DayData {
  const key = date ?? todayKey();
  if (typeof window === "undefined") {
    return { date: key, entries: [], goal: getGoal() };
  }
  const raw = localStorage.getItem(`${STORAGE_KEY}-${key}`);
  if (raw) {
    return JSON.parse(raw) as DayData;
  }
  return { date: key, entries: [], goal: getGoal() };
}

function saveDayData(data: DayData): void {
  localStorage.setItem(`${STORAGE_KEY}-${data.date}`, JSON.stringify(data));
}

export function addWaterEntry(amount: number, date?: string): DayData {
  const data = getDayData(date);
  const entry: WaterEntry = {
    id: crypto.randomUUID(),
    amount,
    timestamp: Date.now(),
  };
  data.entries.push(entry);
  saveDayData(data);
  return data;
}

export function removeWaterEntry(entryId: string, date?: string): DayData {
  const data = getDayData(date);
  data.entries = data.entries.filter((e) => e.id !== entryId);
  saveDayData(data);
  return data;
}

export function getTotalMl(data: DayData): number {
  return data.entries.reduce((sum, e) => sum + e.amount, 0);
}

export function getWeekData(): DayData[] {
  const days: DayData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(getDayData(key));
  }
  return days;
}
