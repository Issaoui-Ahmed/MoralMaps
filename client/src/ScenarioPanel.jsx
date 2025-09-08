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
  scenarioText,
}) => {
  const isSelected = selectedLabel === label;

  const line1 = scenarioText?.line1?.replace('{defaultTime}', defaultTime) ||
    `The time-efficient route takes approximately ${defaultTime} minutes.`;
  const line2 = scenarioText?.line2
    ?.replace('{label}', label)
    ?.replace('{alternativeTime}', alternativeTime) ||
    `The ${label} route prioritizes safety and takes about ${alternativeTime} minutes.`;
  const line3 = scenarioText?.line3
    ?.replace('{label}', label.toLowerCase()) ||
    `Use the toggle below to activate the ${label.toLowerCase()} route if you prefer safety over speed.`;

  return (
    <div className="absolute top-5 left-5 w-80 bg-white p-6 rounded-xl shadow-lg z-[1000] text-base text-gray-800 font-sans">
      <p className="font-semibold">Scenario {scenarioNumber} out of {totalScenarios}</p>
      <div className="mt-3 mb-6 p-4 bg-gray-100 rounded-md text-gray-700">
        <p className="mb-2">{line1}</p>
        <p className="mb-2">{line2}</p>
        <p className="text-sm">{line3}</p>
      </div>

      <div className="space-y-6">

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
                "w-14 h-7 bg-gray-300 rounded-full relative transition-colors " +
                "peer-checked:bg-blue-600 " +
                "after:content-[''] after:absolute after:top-[2px] after:left-[2px] " +
                "after:w-6 after:h-6 after:bg-white after:rounded-full after:transition-transform " +
                "peer-checked:after:translate-x-7"
              }
            ></div>
          </label>
        </div>

        <button
          onClick={onSubmit}
          className={
            "w-full py-3 px-5 bg-blue-600 text-white font-semibold " +
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
