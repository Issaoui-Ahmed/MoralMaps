import React, { useEffect } from "react";
import { useConfig } from "./AdminApp";

export default function SettingsEditor() {
  const { config, setConfig, setDirty } = useConfig();
  const scenarios =
    typeof config?.scenarios === "object" && config.scenarios !== null
      ? config.scenarios
      : {};
  const settings = config?.settings || {};
  const max = Object.keys(scenarios).length > 0 ? Object.keys(scenarios).length : 1;
  const number = settings.number_of_scenarios || 1;

  const patch = (patchObj) => {
    setConfig((prev) => ({ ...prev, settings: { ...prev?.settings, ...patchObj } }));
    setDirty(true);
  };

  const boundedNumber = Math.min(Math.max(number, 1), max);

  useEffect(() => {
    if (number !== boundedNumber) {
      patch({ number_of_scenarios: boundedNumber });
    }
  }, [number, boundedNumber]);

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-lg font-semibold">General Settings</h2>
      <div className="flex items-center gap-2">
        <input
          id="scenario-shuffle"
          type="checkbox"
          className="h-4 w-4"
          checked={!!settings.scenario_shuffle}
          onChange={(e) => patch({ scenario_shuffle: e.target.checked })}
        />
        <label htmlFor="scenario-shuffle" className="text-sm">Shuffle scenarios</label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Number of scenarios: {boundedNumber}
        </label>
        <input
          type="range"
          min={1}
          max={max}
          value={boundedNumber}
          onChange={(e) => patch({ number_of_scenarios: Number(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
