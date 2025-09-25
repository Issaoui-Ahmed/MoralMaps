"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import Routing from "../Routing";
import RoutingLabels from "../RoutingLabels";
import ScenarioPanel from "../ScenarioPanel";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "leaflet/dist/leaflet.css";

// Ensure Leaflet marker icons are loaded correctly in bundlers like Next.js
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src || markerIcon2x,
    iconUrl: markerIcon.src || markerIcon,
    shadowUrl: markerShadow.src || markerShadow,
  });
}

function isValidCoord(point) {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    point.every((value) => typeof value === "number" && Number.isFinite(value))
  );
}

function toNumberArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "number" && Number.isFinite(item));
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return [value];
  }
  return [];
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value === "string" && value.trim() !== "") {
    return [value];
  }
  return [];
}

function normalizeMiddlePoints(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(isValidCoord);
}

export default function ScenarioMapPreview({ scenario, className = "h-64 w-full" }) {
  const [mapPoints, setMapPoints] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const startOptions = useMemo(() => {
    return Array.isArray(scenario?.start) ? scenario.start.filter(isValidCoord) : [];
  }, [scenario]);

  const endOptions = useMemo(() => {
    return Array.isArray(scenario?.end) ? scenario.end.filter(isValidCoord) : [];
  }, [scenario]);

  const defaultTimeOptions = useMemo(() => {
    return toNumberArray(scenario?.default_route_time);
  }, [scenario]);

  const scenarioNameOptions = useMemo(() => {
    return toStringArray(scenario?.scenario_name);
  }, [scenario]);

  const alternativeOptions = useMemo(() => {
    return Array.isArray(scenario?.choice_list)
      ? scenario.choice_list.map((route) => ({
          middlePoints: normalizeMiddlePoints(route?.middle_point),
          tts: toNumberArray(route?.tts),
          valueNames: toStringArray(route?.value_name),
          descriptions: toStringArray(route?.description),
          preselected: !!route?.preselected,
        }))
      : [];
  }, [scenario]);

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [defaultTimeIndex, setDefaultTimeIndex] = useState(0);
  const [scenarioNameIndex, setScenarioNameIndex] = useState(0);
  const [alternativeSelections, setAlternativeSelections] = useState([]);

  useEffect(() => {
    setStartIndex(0);
    setEndIndex(0);
    setDefaultTimeIndex(0);
    setScenarioNameIndex(0);
    setSelectedRouteIndex(0);
  }, [scenario, startOptions.length, endOptions.length, defaultTimeOptions.length, scenarioNameOptions.length]);

  useEffect(() => {
    setAlternativeSelections(
      alternativeOptions.map(() => ({
        middleIndex: 0,
        ttsIndex: 0,
        valueIndex: 0,
        descriptionIndex: 0,
      }))
    );
    setSelectedRouteIndex(0);
  }, [scenario, alternativeOptions.length]);

  const activeStart = startOptions[startIndex] || startOptions[0] || null;
  const activeEnd = endOptions[endIndex] || endOptions[0] || null;
  const activeDefaultTime = defaultTimeOptions[defaultTimeIndex] ?? defaultTimeOptions[0] ?? 0;
  const activeScenarioName =
    scenarioNameOptions[scenarioNameIndex] || scenarioNameOptions[0] || scenario?.scenario_name || "Scenario";

  const processedAlternatives = alternativeOptions.map((alt, idx) => {
    const selection = alternativeSelections[idx] || {};
    const middle = alt.middlePoints[selection.middleIndex] || alt.middlePoints[0] || null;
    const tts = alt.tts[selection.ttsIndex] ?? alt.tts[0] ?? 0;
    const label =
      alt.valueNames[selection.valueIndex] || alt.valueNames[0] || `Alternative ${idx + 1}`;
    const description = alt.descriptions[selection.descriptionIndex] || alt.descriptions[0] || "";

    const numericTts = typeof tts === "number" && Number.isFinite(tts) ? tts : 0;

    return {
      middle,
      tts: numericTts,
      totalTimeMinutes: numericTts + (typeof activeDefaultTime === "number" ? activeDefaultTime : 0),
      label,
      description,
      preselected: alt.preselected,
    };
  });

  const preselectedIndex = useMemo(() => {
    const idx = processedAlternatives.findIndex((alt) => alt.preselected);
    return idx === -1 ? 0 : idx;
  }, [processedAlternatives]);

  const bounds = useMemo(() => {
    if (!activeStart || !activeEnd) return null;
    const points = [activeStart, activeEnd];
    processedAlternatives.forEach((alt) => {
      if (isValidCoord(alt.middle)) {
        points.push(alt.middle);
      }
    });
    return points.length ? L.latLngBounds(points) : null;
  }, [activeStart, activeEnd, processedAlternatives]);

  const fallbackAlternative =
    processedAlternatives[preselectedIndex] || processedAlternatives[0] || null;
  const panelAlternative =
    selectedRouteIndex === 0
      ? fallbackAlternative
      : processedAlternatives[selectedRouteIndex - 1] || fallbackAlternative;

  if (!activeStart || !activeEnd || !bounds) {
    return (
      <div className={`relative ${className} flex items-center justify-center rounded border border-dashed border-rose-300 bg-rose-50 p-4 text-sm text-rose-700`}>
        <div className="space-y-1 text-center">
          <p className="font-semibold">Unable to render map preview</p>
          <ul className="space-y-0.5">
            {!startOptions.length && <li>Provide at least one valid starting coordinate.</li>}
            {!endOptions.length && <li>Provide at least one valid ending coordinate.</li>}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [50, 50], maxZoom: 15 }}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Routing
          from={activeStart}
          to={activeEnd}
          alternatives={processedAlternatives}
          defaultTimeMinutes={activeDefaultTime}
          selectedIndex={selectedRouteIndex}
          setSelectedIndex={setSelectedRouteIndex}
          consentGiven={true}
          setMapPoints={setMapPoints}
          setRoutes={setRoutes}
        />
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 400,
        }}
      >
        <RoutingLabels mapPoints={mapPoints} routes={routes} />
      </div>

      <ScenarioPanel
        label={panelAlternative?.label || activeScenarioName}
        description={panelAlternative?.description || ""}
        isSelected={selectedRouteIndex !== 0}
        onToggle={() => {
          if (selectedRouteIndex === 0) {
            const targetIndex = processedAlternatives.length ? preselectedIndex + 1 : 0;
            setSelectedRouteIndex(targetIndex);
          } else {
            setSelectedRouteIndex(0);
          }
        }}
        onSubmit={() => {}}
        scenarioNumber={1}
        totalScenarios={1}
        defaultTime={activeDefaultTime}
        alternativeTime={panelAlternative?.totalTimeMinutes || activeDefaultTime}
        scenarioText={null}
      />

      <div className="absolute right-5 top-5 z-[1000] max-h-[calc(100%-2.5rem)] w-80 overflow-y-auto rounded-xl bg-white/95 p-4 text-sm shadow-lg">
        <h3 className="mb-3 text-base font-semibold text-gray-800">Preview options</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Scenario name</label>
            <select
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              value={scenarioNameIndex}
              onChange={(e) => setScenarioNameIndex(Number(e.target.value))}
            >
              {scenarioNameOptions.length ? (
                scenarioNameOptions.map((name, idx) => (
                  <option key={name + idx} value={idx}>
                    {name}
                  </option>
                ))
              ) : (
                <option value={0}>{String(scenario?.scenario_name || "Scenario")}</option>
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Start point</label>
            <select
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              value={startIndex}
              onChange={(e) => setStartIndex(Number(e.target.value))}
            >
              {startOptions.map((coord, idx) => (
                <option key={`start-${coord.join("-")}-${idx}`} value={idx}>
                  #{idx + 1}: {coord[0].toFixed(5)}, {coord[1].toFixed(5)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">End point</label>
            <select
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              value={endIndex}
              onChange={(e) => setEndIndex(Number(e.target.value))}
            >
              {endOptions.map((coord, idx) => (
                <option key={`end-${coord.join("-")}-${idx}`} value={idx}>
                  #{idx + 1}: {coord[0].toFixed(5)}, {coord[1].toFixed(5)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Default route time</label>
            <select
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              value={defaultTimeIndex}
              onChange={(e) => setDefaultTimeIndex(Number(e.target.value))}
            >
              {defaultTimeOptions.length ? (
                defaultTimeOptions.map((minutes, idx) => (
                  <option key={`time-${minutes}-${idx}`} value={idx}>
                    {minutes} minutes
                  </option>
                ))
              ) : (
                <option value={0}>{String(activeDefaultTime)} minutes</option>
              )}
            </select>
          </div>

          {processedAlternatives.map((alt, idx) => {
            const selection = alternativeSelections[idx] || {
              middleIndex: 0,
              ttsIndex: 0,
              valueIndex: 0,
              descriptionIndex: 0,
            };
            const options = alternativeOptions[idx];

            return (
              <div key={`alt-${idx}`} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">Alternative {idx + 1}</h4>
                  {options?.preselected && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[0.65rem] font-medium text-blue-700">
                      Preselected
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Middle point</label>
                    <select
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      value={selection.middleIndex}
                      onChange={(e) =>
                        setAlternativeSelections((prev) => {
                          const next = [...prev];
                          next[idx] = {
                            ...selection,
                            middleIndex: Number(e.target.value),
                          };
                          return next;
                        })
                      }
                    >
                      {options?.middlePoints?.length ? (
                        options.middlePoints.map((coord, optionIdx) => (
                          <option key={`mid-${idx}-${optionIdx}`} value={optionIdx}>
                            #{optionIdx + 1}: {coord[0].toFixed(5)}, {coord[1].toFixed(5)}
                          </option>
                        ))
                      ) : (
                        <option value={0}>No middle point</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Additional time</label>
                    <select
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      value={selection.ttsIndex}
                      onChange={(e) =>
                        setAlternativeSelections((prev) => {
                          const next = [...prev];
                          next[idx] = {
                            ...selection,
                            ttsIndex: Number(e.target.value),
                          };
                          return next;
                        })
                      }
                    >
                      {options?.tts?.length ? (
                        options.tts.map((minutes, optionIdx) => (
                          <option key={`tts-${idx}-${optionIdx}`} value={optionIdx}>
                            {minutes} minutes
                          </option>
                        ))
                      ) : (
                        <option value={0}>{alt.tts} minutes</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Label</label>
                    <select
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      value={selection.valueIndex}
                      onChange={(e) =>
                        setAlternativeSelections((prev) => {
                          const next = [...prev];
                          next[idx] = {
                            ...selection,
                            valueIndex: Number(e.target.value),
                          };
                          return next;
                        })
                      }
                    >
                      {options?.valueNames?.length ? (
                        options.valueNames.map((name, optionIdx) => (
                          <option key={`label-${idx}-${optionIdx}`} value={optionIdx}>
                            {name}
                          </option>
                        ))
                      ) : (
                        <option value={0}>{alt.label}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Description</label>
                    <select
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      value={selection.descriptionIndex}
                      onChange={(e) =>
                        setAlternativeSelections((prev) => {
                          const next = [...prev];
                          next[idx] = {
                            ...selection,
                            descriptionIndex: Number(e.target.value),
                          };
                          return next;
                        })
                      }
                    >
                      {options?.descriptions?.length ? (
                        options.descriptions.map((text, optionIdx) => (
                          <option key={`desc-${idx}-${optionIdx}`} value={optionIdx}>
                            {text}
                          </option>
                        ))
                      ) : (
                        <option value={0}>{alt.description || "No description"}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
