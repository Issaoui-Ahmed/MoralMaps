import React, { useState, useEffect } from "react";
import { useConfig } from "./AdminApp";
import SettingsEditor from "./SettingsEditor";
import ScenarioMapPreview from "./ScenarioMapPreview";

function CoordPairInput({ label, value, onChange }) {
  const pair = Array.isArray(value) && Array.isArray(value[0]) ? value[0] : [0, 0];
  const [lat, lng] = pair;
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          value={lat}
          onChange={(e) => onChange([[Number(e.target.value), lng]])}
          className="w-1/2 border rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          step="any"
          value={lng}
          onChange={(e) => onChange([[lat, Number(e.target.value)]])}
          className="w-1/2 border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}

function AlternativeRouteEditor({ route, onChange, onDelete, index }) {
  const pair = Array.isArray(route?.middle_point) && Array.isArray(route.middle_point[0])
    ? route.middle_point[0]
    : [0, 0];
  const [lat, lng] = pair;
  const ttsString = Array.isArray(route?.tts) ? route.tts.join(",") : "";
  return (
    <div className="border rounded p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">Alternative route {index + 1}</h4>
        <button onClick={onDelete} className="text-xs text-red-600">Delete</button>
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1">Middle point</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => onChange({ middle_point: [[Number(e.target.value), lng]] })}
            className="w-1/2 border rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => onChange({ middle_point: [[lat, Number(e.target.value)]] })}
            className="w-1/2 border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1">TTS (comma separated)</label>
        <input
          type="text"
          value={ttsString}
          onChange={(e) =>
            onChange({ tts: e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n)) })
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!route?.preselected}
          onChange={(e) => onChange({ preselected: e.target.checked })}
          className="h-4 w-4"
        />
        <label className="text-xs">Preselected</label>
      </div>
    </div>
  );
}

function ScenarioForm({ scenario, onChange, name }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{name}</h3>

      <CoordPairInput
        label="Start"
        value={scenario.start}
        onChange={(val) => onChange({ start: val })}
      />
      <CoordPairInput
        label="End"
        value={scenario.end}
        onChange={(val) => onChange({ end: val })}
      />
      <div>
        <label className="block text-sm font-medium mb-1">Default route time (min)</label>
        <input
          type="number"
          value={Array.isArray(scenario.default_route_time) ? scenario.default_route_time[0] : 0}
          onChange={(e) => onChange({ default_route_time: [Number(e.target.value)] })}
          className="border rounded px-2 py-1 text-sm w-32"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Value name</label>
        <input
          type="text"
          value={scenario.value_name || ""}
          onChange={(e) => onChange({ value_name: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={scenario.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!scenario.randomly_preselect_route}
          onChange={(e) => onChange({ randomly_preselect_route: e.target.checked })}
          className="h-4 w-4"
        />
        <label className="text-sm">Randomly preselect route</label>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold">Alternative routes</h4>
          <button
            onClick={() => {
              const start = Array.isArray(scenario.start?.[0]) ? scenario.start[0] : [0, 0];
              const end = Array.isArray(scenario.end?.[0]) ? scenario.end[0] : [0, 0];
              const mid = [
                (start[0] + end[0]) / 2,
                (start[1] + end[1]) / 2,
              ];
              onChange({
                choice_list: [
                  ...(scenario.choice_list || []),
                  { middle_point: [mid], tts: [], preselected: false },
                ],
              });
            }}
            className="text-xs px-2 py-1 border rounded"
          >
            Add alternative route
          </button>
        </div>
        {Array.isArray(scenario.choice_list) && scenario.choice_list.length > 0 ? (
          scenario.choice_list.map((ch, i) => (
            <AlternativeRouteEditor
              key={i}
              route={ch}
              index={i}
              onChange={(patch) => {
                const next = scenario.choice_list.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
                onChange({ choice_list: next });
              }}
              onDelete={() => {
                const next = scenario.choice_list.filter((_, idx) => idx !== i);
                onChange({ choice_list: next });
              }}
            />
          ))
        ) : (
          <p className="text-xs text-gray-500">No alternative routes defined.</p>
        )}
      </div>
    </div>
  );
}

export default function ScenariosEditor() {
  const { config, setConfig, setDirty } = useConfig();
  const scenarios =
    typeof config?.scenarios === "object" && config.scenarios !== null
      ? config.scenarios
      : {};
  const scenarioKeys = Object.keys(scenarios);
  const [selectedKey, setSelectedKey] = useState(scenarioKeys[0] || "");

  useEffect(() => {
    if (!selectedKey && scenarioKeys.length > 0) {
      setSelectedKey(scenarioKeys[0]);
    }
  }, [scenarioKeys, selectedKey]);

  const patchScenarios = (next) => {
    setConfig((prev) => ({ ...prev, scenarios: next }));
    setDirty(true);
  };

  const addScenario = () => {
    const prev = selectedKey ? scenarios[selectedKey] : {};
    const cloneCoords = (coords) =>
      Array.isArray(coords)
        ? coords.map((p) => (Array.isArray(p) ? [...p] : p))
        : [[0, 0]];
    const nextIndex = scenarioKeys.length + 1;
    const fresh = {
      start: prev.start ? cloneCoords(prev.start) : [[0, 0]],
      end: prev.end ? cloneCoords(prev.end) : [[0, 0]],
      default_route_time: [0],
      choice_list: [],
      scenario_name: `Scenario ${nextIndex}`,
      value_name: "",
      description: "",
      randomly_preselect_route: false,
    };
    const newKey = `scenario_${nextIndex}`;
    patchScenarios({ ...scenarios, [newKey]: fresh });
    setSelectedKey(newKey);
  };

  const updateScenario = (key, patch) => {
    const next = { ...scenarios, [key]: { ...scenarios[key], ...patch } };
    patchScenarios(next);
  };

  const deleteScenario = (key) => {
    const { [key]: _, ...rest } = scenarios;
    patchScenarios(rest);
    setSelectedKey(Object.keys(rest)[0] || "");
  };

  const selected = scenarios[selectedKey];

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      <aside className="w-60 border-r p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Scenarios</h2>
          <button onClick={addScenario} className="text-xs px-2 py-1 border rounded">Add</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {scenarioKeys.map((key) => (
            <div key={key} className="flex items-center mb-1">
              <button
                onClick={() => deleteScenario(key)}
                className="text-xs text-red-600 mr-2 px-1"
                aria-label={`Delete ${scenarios[key]?.scenario_name || key}`}
              >
                ✕
              </button>
              <button
                onClick={() => setSelectedKey(key)}
                className={`flex-1 text-left px-2 py-1 rounded text-sm ${key === selectedKey ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
              >
                {scenarios[key]?.scenario_name ? scenarios[key].scenario_name : key}
              </button>
            </div>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-4 overflow-y-auto space-y-6">
        <SettingsEditor />
        {selected ? (
          <>
            <ScenarioMapPreview
              scenario={selected}
              onChange={(patch) => updateScenario(selectedKey, patch)}
            />
            <ScenarioForm
              scenario={selected}
              scenarioKey={selectedKey}
              onChange={(patch) => updateScenario(selectedKey, patch)}
            />
          </>
        ) : (
          <p className="text-sm text-gray-500">No scenarios defined.</p>
        )}
      </main>
    </div>
  );
}

