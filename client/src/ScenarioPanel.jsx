import React from "react";

const ScenarioPanel = ({
  label,
  description,
  selectedLabel,
  onToggle,
  onSubmit,
  scenarioNumber,
  totalScenarios,
  defaultTime,
  alternativeTime,
}) => {
  const isSelected = selectedLabel === label;

  return (
    <div className="absolute top-5 left-5 w-72 bg-white p-5 rounded-xl shadow-lg z-[1000] text-sm text-gray-800 font-sans">
      <p className="font-semibold">Scenario {scenarioNumber} out of {totalScenarios}</p>
      <div className="mt-2 mb-4 p-3 bg-gray-100 rounded-md text-gray-700">
        <p className="mb-1">
          The <span className="font-medium">time-efficient route</span> takes approximately {defaultTime} minutes.
        </p>
        <p className="mb-1">
          The <span className="font-medium">{label} route</span> prioritizes safety and takes about {alternativeTime} minutes.
        </p>
        <p>Use the toggle below to activate the {label.toLowerCase()} route if you prefer safety over speed.</p>
      </div>

      <div className="space-y-4">
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
                "w-12 h-6 bg-gray-300 rounded-full relative transition-colors " +
                "peer-checked:bg-blue-600 " +
                "after:content-[''] after:absolute after:top-[2px] after:left-[2px] " +
                "after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform " +
                "peer-checked:after:translate-x-6"
              }
            ></div>
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
