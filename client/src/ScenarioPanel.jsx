import React from "react";

const ScenarioPanel = ({
  scenarioIndex,
  totalScenarios,
  label,
  description,
  selectedLabel,
  onToggle,
  onSubmit,
}) => {
  const isSelected = selectedLabel === label;

  return (
    <div className="absolute top-5 left-5 w-72 bg-white p-5 rounded-xl shadow-lg z-50 text-sm text-gray-800 font-sans">
      <h2 className="text-lg font-semibold mb-1">
        Scenario {scenarioIndex + 1} of {totalScenarios}
      </h2>
      <p className="text-gray-600">Choose your preferred route to continue.</p>

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{label}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div
              className={
                "relative w-12 h-6 bg-gray-300 rounded-full " +
                "peer-checked:bg-blue-600 transition-colors"
              }
            >
              <div
                className={
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full " +
                  "transition-transform peer-checked:translate-x-6"
                }
              ></div>
            </div>
          </label>
        </div>

        <button
          onClick={onSubmit}
          className={
            "w-full py-2 px-4 bg-blue-600 text-white font-semibold " +
            "rounded-md shadow hover:bg-blue-700 " +
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

export default ScenarioPanel;
