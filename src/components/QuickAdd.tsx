"use client";

import { useState } from "react";

const PRESETS = [
  { label: "Small glass", ml: 200, icon: "🥛" },
  { label: "Medium glass", ml: 350, icon: "🥤" },
  { label: "Large bottle", ml: 500, icon: "🍶" },
  { label: "Sports bottle", ml: 750, icon: "💧" },
];

interface QuickAddProps {
  onAdd: (ml: number) => void;
}

export default function QuickAdd({ onAdd }: QuickAddProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (val > 0 && val <= 5000) {
      onAdd(val);
      setCustomAmount("");
      setShowCustom(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold text-sky-800 mb-3">Add Water</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.ml}
            onClick={() => onAdd(p.ml)}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-sky-100 hover:border-sky-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-2xl">{p.icon}</span>
            <div className="text-left">
              <p className="text-sm font-medium text-sky-900">{p.label}</p>
              <p className="text-xs text-sky-500">{p.ml} ml</p>
            </div>
          </button>
        ))}
      </div>

      {showCustom ? (
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            min={1}
            max={5000}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter ml..."
            className="flex-1 px-4 py-2 rounded-xl border border-sky-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sky-900"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowCustom(false)}
            className="px-3 py-2 text-sky-500 hover:text-sky-700 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full py-2 text-sky-500 hover:text-sky-700 text-sm font-medium transition-colors cursor-pointer"
        >
          + Custom amount
        </button>
      )}
    </div>
  );
}
