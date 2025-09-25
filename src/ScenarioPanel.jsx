import React from "react";

const ScenarioPanel = ({
  scenarioNumber,
  totalScenarios,
  defaultTime,
  scenarioText,
  activeLabel,
  activeDescription,
  activeTime,
  alternatives,
  selectedRouteIndex,
  onSelectRoute,
  onSubmit,
}) => {
  const safeLabel = activeLabel || "Alternative";
  const defaultScenarioText =
    "The time-efficient route takes approximately 25 minutes.\n\n" +
    "The Default route prioritizes safety and takes about 25 minutes.\n\n" +
    "Use the toggle below to activate the default route if you prefer safety over speed.";
  const scenarioDescription =
    typeof scenarioText === "string" && scenarioText.trim().length > 0
      ? scenarioText
      : defaultScenarioText;
  return (
    <div className="absolute top-5 left-5 w-96 bg-white p-6 rounded-xl shadow-lg z-[1000] text-base text-gray-800 font-sans">
      <p className="font-semibold">Scenario {scenarioNumber} out of {totalScenarios}</p>
      <div className="mt-3 mb-6 p-4 bg-gray-100 rounded-md text-gray-700">
        <p>{scenarioDescription}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          {alternatives.length === 0 ? (
            <p className="text-sm text-gray-500">No alternative routes configured.</p>
          ) : (
            alternatives.map((alt, idx) => {
              const index = idx + 1;
              const isSelected = selectedRouteIndex === index;
              const altTime = alt.totalTimeMinutes ?? "-";
              const difference =
                typeof alt.totalTimeMinutes === "number" && typeof defaultTime === "number"
                  ? alt.totalTimeMinutes - defaultTime
                  : null;
              const diffLabel =
                Number.isFinite(difference) && difference !== 0
                  ? `${difference > 0 ? "+" : ""}${difference} min`
                  : null;

              return (
                <div
                  key={`${alt.label}-${idx}`}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="pr-4">
                    <p className="font-medium text-sm">{alt.label}</p>
                    {alt.description && (
                      <p className="text-xs text-gray-500 mt-1">{alt.description}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Estimated time: {altTime} min
                      {diffLabel && <span className="ml-1">({diffLabel} vs time-efficient)</span>}
                    </p>
                  </div>

                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRoute(isSelected ? 0 : index)}
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
              );
            })
          )}
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
