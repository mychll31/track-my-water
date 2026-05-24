"use client";

import { WaterEntry } from "@/lib/storage";

interface EntryListProps {
  entries: WaterEntry[];
  onRemove: (id: string) => void;
}

export default function EntryList({ entries, onRemove }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-sky-400">
        <p className="text-4xl mb-2">💧</p>
        <p className="text-sm">No water logged yet today.</p>
        <p className="text-xs mt-1">Start by adding your first glass!</p>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold text-sky-800 mb-3">
        Today&apos;s Log
      </h2>
      <ul className="space-y-2">
        {sorted.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-sky-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">💧</span>
              <div>
                <p className="text-sm font-medium text-sky-900">
                  {entry.amount} ml
                </p>
                <p className="text-xs text-sky-400">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(entry.id)}
              className="p-1.5 text-sky-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Remove entry"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
