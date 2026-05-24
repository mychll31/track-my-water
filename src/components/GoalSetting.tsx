"use client";

import { useState } from "react";

interface GoalSettingProps {
  currentGoal: number;
  onUpdate: (ml: number) => void;
}

export default function GoalSetting({ currentGoal, onUpdate }: GoalSettingProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentGoal));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(value, 10);
    if (ml >= 500 && ml <= 10000) {
      onUpdate(ml);
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => {
          setValue(String(currentGoal));
          setEditing(true);
        }}
        className="text-sm text-sky-500 hover:text-sky-700 font-medium transition-colors cursor-pointer"
      >
        Goal: {currentGoal} ml ✏️
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        min={500}
        max={10000}
        step={100}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 px-2 py-1 text-sm rounded-lg border border-sky-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sky-900"
        autoFocus
      />
      <span className="text-xs text-sky-400">ml</span>
      <button
        type="submit"
        className="px-2 py-1 text-xs bg-sky-500 text-white rounded-lg hover:bg-sky-600 cursor-pointer"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="px-2 py-1 text-xs text-sky-400 hover:text-sky-600 cursor-pointer"
      >
        Cancel
      </button>
    </form>
  );
}
