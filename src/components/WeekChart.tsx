"use client";

import { DayData, getTotalMl } from "@/lib/storage";

interface WeekChartProps {
  weekData: DayData[];
  goal: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekChart({ weekData, goal }: WeekChartProps) {
  const maxVal = Math.max(goal, ...weekData.map((d) => getTotalMl(d)));

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold text-sky-800 mb-3">This Week</h2>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-sky-50">
        <div className="flex items-end justify-between gap-2 h-32">
          {weekData.map((day) => {
            const total = getTotalMl(day);
            const height = maxVal > 0 ? (total / maxVal) * 100 : 0;
            const isToday =
              day.date === new Date().toISOString().slice(0, 10);
            const metGoal = total >= goal;
            const dayOfWeek = new Date(day.date + "T12:00:00").getDay();

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-sky-500 font-medium">
                  {total > 0 ? `${Math.round(total / 100) * 100}` : "0"}
                </span>
                <div className="w-full h-24 bg-sky-50 rounded-lg relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500 ${
                      metGoal
                        ? "bg-gradient-to-t from-emerald-500 to-emerald-300"
                        : "bg-gradient-to-t from-sky-500 to-sky-300"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isToday ? "text-sky-700" : "text-sky-400"
                  }`}
                >
                  {DAY_LABELS[dayOfWeek]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-sky-400">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-sky-400" />
            <span>Below goal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-emerald-400" />
            <span>Goal met</span>
          </div>
        </div>
      </div>
    </div>
  );
}
