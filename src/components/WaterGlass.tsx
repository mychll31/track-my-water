"use client";

interface WaterGlassProps {
  progress: number; // 0-100
  total: number;
  goal: number;
}

export default function WaterGlass({ progress, total, goal }: WaterGlassProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-56 rounded-b-3xl border-4 border-sky-300 bg-white/50 overflow-hidden shadow-lg">
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 to-sky-300 transition-all duration-700 ease-out"
          style={{ height: `${clampedProgress}%` }}
        >
          {clampedProgress > 10 && (
            <div className="absolute top-2 left-0 right-0">
              <div className="h-1 bg-white/20 rounded-full mx-3 mb-2" />
              <div className="h-0.5 bg-white/15 rounded-full mx-5 mb-3" />
              <div className="h-0.5 bg-white/10 rounded-full mx-4" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-2xl font-bold text-sky-900 drop-shadow-sm">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      </div>

      <p className="text-sm text-sky-700 font-medium">
        {total} ml / {goal} ml
      </p>
    </div>
  );
}
