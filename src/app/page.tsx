"use client";

import { useWater } from "@/hooks/useWater";
import WaterGlass from "@/components/WaterGlass";
import QuickAdd from "@/components/QuickAdd";
import EntryList from "@/components/EntryList";
import WeekChart from "@/components/WeekChart";
import GoalSetting from "@/components/GoalSetting";

export default function Home() {
  const {
    dayData,
    goal,
    total,
    progress,
    weekData,
    addWater,
    removeEntry,
    updateGoal,
  } = useWater();

  if (!dayData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sky-400 animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  const greeting = getGreeting();
  const motivationMessage = getMotivation(progress);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 gap-8 max-w-lg mx-auto w-full">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-sky-900 mb-1">
          💧 Track My Water
        </h1>
        <p className="text-sm text-sky-500">{greeting}</p>
      </header>

      <div className="flex flex-col items-center gap-2">
        <WaterGlass progress={progress} total={total} goal={goal} />
        <GoalSetting currentGoal={goal} onUpdate={updateGoal} />
        <p className="text-sm text-sky-600 font-medium text-center mt-1">
          {motivationMessage}
        </p>
      </div>

      <QuickAdd onAdd={addWater} />

      <WeekChart weekData={weekData} goal={goal} />

      <EntryList entries={dayData.entries} onRemove={removeEntry} />

      <footer className="text-xs text-sky-300 pb-4">
        Stay hydrated, stay healthy
      </footer>
    </main>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! Start your day with water.";
  if (hour < 17) return "Good afternoon! Keep sipping.";
  return "Good evening! How was your hydration today?";
}

function getMotivation(progress: number): string {
  if (progress >= 100) return "Amazing! You hit your daily goal! 🎉";
  if (progress >= 75) return "Almost there! Just a bit more! 💪";
  if (progress >= 50) return "Halfway there! Keep it up! 🌊";
  if (progress >= 25) return "Good start! Keep drinking! 🚰";
  return "Let's get hydrated! 💦";
}
