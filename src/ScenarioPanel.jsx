import React from "react";

const ScenarioPanel = ({
  label,
  description,
  isSelected,
  onToggle,
  onSubmit,
  scenarioNumber,
  totalScenarios,
  defaultTime,
  alternativeTime,
  scenarioText,
  alternatives = [],
  activeAlternativeIndex = -1,
}) => {
  const safeLabel =
    typeof label === "string" && label.trim() !== ""
      ? label
      : "Alternative";
  const labelLower = safeLabel.toLowerCase();
  const defaultTimeValue =
    typeof defaultTime === "number" || typeof defaultTime === "string"
      ? defaultTime
      : "?";
  const alternativeTimeValue =
    typeof alternativeTime === "number" || typeof alternativeTime === "string"
      ? alternativeTime
      : defaultTimeValue;
  const alternativeCount = Array.isArray(alternatives)
    ? alternatives.length
    : 0;

  const normalizeLabel = (value) =>
    typeof value === "string" ? value.trim() : "";

  const uniqueLabels = Array.from(
    new Set(
      (Array.isArray(alternatives) ? alternatives : [])
        .map((alt) => normalizeLabel(alt?.label))
        .filter(Boolean)
    )
  );

  const currentAltLabel = normalizeLabel(
    alternatives?.[activeAlternativeIndex]?.label
  );
  const currentAltLabelLower = currentAltLabel.toLowerCase();
  const otherLabels = currentAltLabel
    ? uniqueLabels.filter(
        (name) => name.toLowerCase() !== currentAltLabelLower
      )
    : uniqueLabels;

  const formatList = (items) => {
    const filtered = items.filter(Boolean);
    if (!filtered.length) return "";

    if (typeof Intl !== "undefined" && typeof Intl.ListFormat === "function") {
      return new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
      }).format(filtered);
    }

    if (filtered.length === 1) return filtered[0];
    if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;

    const head = filtered.slice(0, -1).join(", ");
    const tail = filtered[filtered.length - 1];
    return `${head}, and ${tail}`;
  };

  const labelsList = formatList(uniqueLabels);
  const otherLabelsList = formatList(otherLabels);

  const replacements = {
    defaultTime: defaultTimeValue,
    alternativeTime: alternativeTimeValue,
    label: safeLabel,
    labelLower,
    labelsList,
    otherLabelsList,
    alternativeCount,
  };

  const formatLine = (template, fallback) => {
    if (typeof template === "string" && template.trim() !== "") {
      return template.replace(/\{(.*?)\}/g, (_, key) => {
        const trimmed = key.trim();
        if (Object.prototype.hasOwnProperty.call(replacements, trimmed)) {
          const value = replacements[trimmed];
          return value != null ? String(value) : "";
        }
        return `{${trimmed}}`;
      });
    }
    return fallback;
  };

  const line1 = formatLine(
    scenarioText?.line1,
    `The time-efficient route takes approximately ${defaultTimeValue} minutes.`
  );

  const multipleLine2Template =
    scenarioText?.line2Multiple ?? scenarioText?.line2 ?? "";
  const singleLine2Fallback =
    `The ${safeLabel} route prioritizes safety and takes about ${alternativeTimeValue} minutes.`;
  const multipleLine2Fallback =
    `There are ${alternativeCount} alternative routes available. The currently selected ${safeLabel} option takes about ${alternativeTimeValue} minutes.`;
  const line2 =
    alternativeCount > 1
      ? formatLine(multipleLine2Template, multipleLine2Fallback)
      : formatLine(scenarioText?.line2, singleLine2Fallback);

  const multipleLine3Template =
    scenarioText?.line3Multiple ?? scenarioText?.line3 ?? "";
  const singleLine3Fallback =
    `Use the toggle below to activate the ${labelLower} route if you prefer safety over speed.`;
  const multipleLine3Fallback = otherLabelsList
    ? `Use the toggle or select on the map to compare the other routes, such as ${otherLabelsList}.`
    : `Use the toggle or select on the map to explore the available routes.`;
  const line3 =
    alternativeCount > 1
      ? formatLine(multipleLine3Template, multipleLine3Fallback)
      : formatLine(scenarioText?.line3, singleLine3Fallback);

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
            <p className="font-medium">{safeLabel}</p>
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
