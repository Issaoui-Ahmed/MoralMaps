import React, { useState, useEffect, useMemo } from "react";
import { useConfig } from "./AdminApp";
import SettingsEditor from "./SettingsEditor";
import ScenarioMapPreview from "./ScenarioMapPreview";

const ensureArray = (value, fallback) => {
  if (Array.isArray(value) && value.length > 0) {
    return value;
  }
  return fallback;
};

const ensureCoordList = (value, fallback) => {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }
  return value.map((pair, index) => {
    if (Array.isArray(pair) && pair.length === 2) {
      const [lat, lng] = pair;
      const latNum = typeof lat === "number" ? lat : fallback[Math.min(index, fallback.length - 1)][0];
      const lngNum = typeof lng === "number" ? lng : fallback[Math.min(index, fallback.length - 1)][1];
      return [latNum, lngNum];
    }
    return fallback[Math.min(index, fallback.length - 1)] || fallback[0];
  });
};

const ensureNumberList = (value, fallback) => {
  const arr = ensureArray(value, fallback);
  return arr.map((num) => (typeof num === "number" && !Number.isNaN(num) ? num : 0));
};

const ensureStringList = (value, fallback) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : fallback;
  }
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  return fallback;
};

const createDefaultRoute = (scenario) => {
  const start = ensureCoordList(scenario?.start, [[0, 0]]);
  const end = ensureCoordList(scenario?.end, [[0, 0]]);
  const [startLat, startLng] = start[0] || [0, 0];
  const [endLat, endLng] = end[0] || [0, 0];
  const mid = [(startLat + endLat) / 2, (startLng + endLng) / 2];

  return {
    middle_point: [mid.every((n) => typeof n === "number" && !Number.isNaN(n)) ? mid : [0, 0]],
    tts: [0],
    value_name: [""],
    description: [""],
    preselected: false,
  };
};

const normalizeRoute = (route, scenario) => {
  const fallback = createDefaultRoute(scenario);
  return {
    ...fallback,
    ...route,
    middle_point: ensureCoordList(route?.middle_point, fallback.middle_point),
    tts: ensureNumberList(route?.tts, fallback.tts),
    value_name: ensureStringList(route?.value_name, fallback.value_name),
    description: ensureStringList(route?.description, fallback.description),
    preselected: typeof route?.preselected === "boolean" ? route.preselected : false,
  };
};

const normalizeScenario = (scenario) => {
  const start = ensureCoordList(scenario?.start, [[0, 0]]);
  const end = ensureCoordList(scenario?.end, [[0, 0]]);
  const defaultRoute = createDefaultRoute({ start, end });
  const routesArray = Array.isArray(scenario?.choice_list) ? scenario.choice_list : [];
  const normalizedRoutes = routesArray.length
    ? routesArray.map((route) => normalizeRoute(route, { start, end }))
    : [defaultRoute];

  return {
    ...scenario,
    start,
    end,
    default_route_time: ensureNumberList(scenario?.default_route_time, [0]),
    choice_list: normalizedRoutes,
    randomly_preselect_route: Boolean(scenario?.randomly_preselect_route),
  };
};

const normalizeScenarioMap = (scenarios) => {
  if (!scenarios || typeof scenarios !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(scenarios).map(([key, scenario]) => [key, normalizeScenario(scenario)])
  );
};

function CoordListInput({ label, values = [], onChange }) {
  const coords = Array.isArray(values) ? values : [];

  const update = (idx, lat, lng) => {
    const next = coords.map((p, i) => (i === idx ? [lat, lng] : p));
    onChange(next);
  };

  const add = () => {
    onChange([...coords, [0, 0]]);
  };

  const remove = (idx) => {
    onChange(coords.filter((_, i) => i !== idx));
  };

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {coords.map((pair, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <input
            type="number"
            step="any"
            value={pair[0]}
            onChange={(e) => update(i, Number(e.target.value), pair[1])}
            className="w-1/2 border rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            step="any"
            value={pair[1]}
            onChange={(e) => update(i, pair[0], Number(e.target.value))}
            className="w-1/2 border rounded px-2 py-1 text-sm"
          />
          {coords.length > 1 && (
            <button
              onClick={() => remove(i)}
              className="text-xs text-red-600"
              aria-label="Remove coordinate"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button onClick={add} className="text-xs px-2 py-1 border rounded">
        Add
      </button>
    </div>
  );
}

function NumberListInput({ label, values = [], onChange }) {
  const nums = Array.isArray(values) ? values : [];

  const update = (idx, val) => {
    const next = nums.map((n, i) => (i === idx ? val : n));
    onChange(next);
  };

  const add = () => onChange([...nums, 0]);
  const remove = (idx) => onChange(nums.filter((_, i) => i !== idx));

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {nums.map((n, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <input
            type="number"
            value={n}
            onChange={(e) => update(i, Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm w-32"
          />
          {nums.length > 1 && (
            <button
              onClick={() => remove(i)}
              className="text-xs text-red-600"
              aria-label="Remove value"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button onClick={add} className="text-xs px-2 py-1 border rounded">
        Add
      </button>
    </div>
  );
}

function TextListInput({ label, values = [], onChange, placeholder = "" }) {
  const items = Array.isArray(values)
    ? values
    : typeof values === "string"
    ? [values]
    : [];

  const update = (idx, val) => {
    const next = items.map((n, i) => (i === idx ? val : n));
    onChange(next);
  };

  const add = () => onChange([...items, ""]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {items.map((text, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <input
            type="text"
            value={text}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
          />
          {items.length > 1 && (
            <button
              onClick={() => remove(i)}
              className="text-xs text-red-600"
              aria-label="Remove value"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button onClick={add} className="text-xs px-2 py-1 border rounded">
        Add
      </button>
    </div>
  );
}

function AlternativeRouteEditor({ route, onChange, onDelete, index, canDelete }) {
  return (
    <div className="border rounded p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">Alternative route {index + 1}</h4>
        {canDelete && (
          <button onClick={onDelete} className="text-xs text-red-600">
            Delete
          </button>
        )}
      </div>
      <CoordListInput
        label="Middle points"
        values={route.middle_point}
        onChange={(val) => onChange({ middle_point: val })}
      />
      <NumberListInput
        label="TTS"
        values={route.tts}
        onChange={(val) => onChange({ tts: val })}
      />
      <TextListInput
        label="Value names (pool)"
        values={route.value_name}
        onChange={(val) => onChange({ value_name: val })}
        placeholder="e.g. drivers safety"
      />
      <TextListInput
        label="Descriptions (pool)"
        values={route.description}
        onChange={(val) => onChange({ description: val })}
        placeholder="Brief explanation for participants"
      />
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

      <CoordListInput
        label="Start"
        values={scenario.start}
        onChange={(val) => onChange({ start: val })}
      />
      <CoordListInput
        label="End"
        values={scenario.end}
        onChange={(val) => onChange({ end: val })}
      />
      <NumberListInput
        label="Default route time (min)"
        values={scenario.default_route_time}
        onChange={(val) => onChange({ default_route_time: val })}
      />
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
                  {
                    middle_point: [mid],
                    tts: [0],
                    value_name: [""],
                    description: [""],
                    preselected: false,
                  },
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
              canDelete={scenario.choice_list.length > 1}
              onChange={(patch) => {
                const next = scenario.choice_list.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
                onChange({ choice_list: next });
              }}
              onDelete={() => {
                const next = scenario.choice_list.filter((_, idx) => idx !== i);
                onChange({ choice_list: next.length > 0 ? next : [createDefaultRoute(scenario)] });
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
  const rawScenarios =
    typeof config?.scenarios === "object" && config.scenarios !== null
      ? config.scenarios
      : {};
  const scenarios = useMemo(() => normalizeScenarioMap(rawScenarios), [rawScenarios]);

  useEffect(() => {
    if (!config || !config.scenarios) return;

    const original = JSON.stringify(rawScenarios);
    const normalized = JSON.stringify(scenarios);

    if (original !== normalized) {
      setConfig((prev) => ({ ...prev, scenarios }));
    }
  }, [config, rawScenarios, scenarios, setConfig]);

  const scenarioKeys = Object.keys(scenarios);
  const [selectedKey, setSelectedKey] = useState(scenarioKeys[0] || "");

  useEffect(() => {
    if (!selectedKey && scenarioKeys.length > 0) {
      setSelectedKey(scenarioKeys[0]);
    }
  }, [scenarioKeys, selectedKey]);

  const patchScenarios = (next) => {
    const normalized = normalizeScenarioMap(next);
    setConfig((prev) => ({ ...prev, scenarios: normalized }));
    setDirty(true);
  };

  const addScenario = () => {
    const prev = selectedKey ? scenarios[selectedKey] : null;
    const nextIndex = scenarioKeys.length + 1;

    const cloneScenario = (sc) =>
      typeof structuredClone === "function"
        ? structuredClone(sc)
        : JSON.parse(JSON.stringify(sc));

    const fresh = prev
      ? { ...cloneScenario(prev), scenario_name: `Scenario ${nextIndex}` }
      : {
          start: [[0, 0]],
          end: [[0, 0]],
          default_route_time: [0],
          choice_list: [],
          scenario_name: `Scenario ${nextIndex}`,
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
    <div className="relative h-[calc(100vh-6rem)]">
      {selected && (
        <ScenarioMapPreview
          scenario={selected}
          onChange={(patch) => updateScenario(selectedKey, patch)}
          className="absolute inset-0 z-0"
        />
      )}
      <div className="absolute top-0 left-0 z-10 h-full w-[30rem] max-w-full overflow-y-auto bg-white p-4 space-y-6 shadow-md">
        <SettingsEditor />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Scenarios</h2>
            <button onClick={addScenario} className="text-xs px-2 py-1 border rounded">Add</button>
          </div>
          <div className="max-h-40 overflow-y-auto mb-4">
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
                  className={`flex-1 text-left px-2 py-1 rounded text-sm ${
                    key === selectedKey ? "bg-indigo-100" : "hover:bg-gray-100"
                  }`}
                >
                  {scenarios[key]?.scenario_name ? scenarios[key].scenario_name : key}
                </button>
              </div>
            ))}
          </div>
        </div>
        {selected ? (
          <ScenarioForm
            scenario={selected}
            scenarioKey={selectedKey}
            onChange={(patch) => updateScenario(selectedKey, patch)}
          />
        ) : (
          <p className="text-sm text-gray-500">No scenarios defined.</p>
        )}
      </div>
    </div>
  );
}

