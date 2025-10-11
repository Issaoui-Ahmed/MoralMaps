import React, { useMemo } from "react";

const ProgressBar = ({ currentStep = 0, totalSteps = 1 }) => {
  const { safeTotalSteps, clampedCurrent } = useMemo(() => {
    const safeTotal = Math.max(1, Number.isFinite(totalSteps) ? totalSteps : 1);
    const clamped = Math.min(Math.max(currentStep ?? 0, 0), safeTotal - 1);

    return { safeTotalSteps: safeTotal, clampedCurrent: clamped };
  }, [currentStep, totalSteps]);

  return (
    <div className="absolute left-0 top-0 z-[1000] w-full px-4 py-2">
      <div className="flex h-2 w-full gap-1">
        {Array.from({ length: safeTotalSteps }).map((_, index) => {
          const isCompleted = index < clampedCurrent;
          const isCurrent = index === clampedCurrent;
          const baseRounded =
            index === 0
              ? "rounded-l-full"
              : index === safeTotalSteps - 1
              ? "rounded-r-full"
              : "";

          const colorClass = isCompleted
            ? "bg-blue-700"
            : isCurrent
            ? "bg-blue-500"
            : "bg-gray-200";

          return (
            <div
              key={`progress-segment-${index}`}
              className={`flex-1 transition-colors duration-300 ${colorClass} ${baseRounded}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;

