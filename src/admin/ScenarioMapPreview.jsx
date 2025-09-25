"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { startIcon, endIcon } from "../markerIcons";
import { fetchRoute } from "../utils/fetchRoute";

// Ensure Leaflet marker icons are loaded correctly in bundlers like Next.js
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for missing marker icons by explicitly setting their image URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});

function isValidCoord(point) {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    point.every((value) => typeof value === "number" && Number.isFinite(value))
  );
}

function buildCombinations(scenario) {
  if (!scenario) return [];

  const startOptions = Array.isArray(scenario.start)
    ? scenario.start.filter(isValidCoord)
    : [];
  const endOptions = Array.isArray(scenario.end)
    ? scenario.end.filter(isValidCoord)
    : [];

  if (!startOptions.length || !endOptions.length) return [];

  const alternatives = Array.isArray(scenario.choice_list)
    ? scenario.choice_list
    : [];

  const middleOptions = alternatives.map((alt) => {
    const mids = Array.isArray(alt?.middle_point)
      ? alt.middle_point.filter(isValidCoord)
      : [];
    return mids.length ? mids : [null];
  });

  const combos = [];

  startOptions.forEach((start, startIndex) => {
    endOptions.forEach((end, endIndex) => {
      const iterate = (depth, selected) => {
        if (depth === middleOptions.length) {
          combos.push({
            start,
            end,
            startIndex,
            endIndex,
            middlePoints: middleOptions.map((options, idx) => {
              const optIndex = selected[idx];
              const coord = options[optIndex] || null;
              return {
                coord: coord && isValidCoord(coord) ? coord : null,
                index: coord && isValidCoord(coord) ? optIndex : null,
              };
            }),
          });
          return;
        }

        const options = middleOptions[depth];
        options.forEach((_, optionIndex) => {
          iterate(depth + 1, [...selected, optionIndex]);
        });
      };

      if (middleOptions.length) {
        iterate(0, []);
      } else {
        combos.push({
          start,
          end,
          startIndex,
          endIndex,
          middlePoints: [],
        });
      }
    });
  });

  return combos;
}

function Routes({ start, end, middlePoints }) {
  const map = useMap();
  const [routes, setRoutes] = useState([]);

  const startKey = Array.isArray(start) ? start.join(",") : "";
  const endKey = Array.isArray(end) ? end.join(",") : "";
  const middleKey = Array.isArray(middlePoints)
    ? middlePoints
        .map((mid) => (Array.isArray(mid) ? mid.join(",") : "null"))
        .join("|")
    : "";

  useEffect(() => {
    if (!map || !Array.isArray(start) || !Array.isArray(end)) return;
    if (
      !start ||
      !end ||
      (start[0] === 0 && start[1] === 0) ||
      (end[0] === 0 && end[1] === 0) ||
      (start[0] === end[0] && start[1] === end[1])
    )
      return;

    const validMids = Array.isArray(middlePoints)
      ? middlePoints.filter((mid) => Array.isArray(mid) && mid.length === 2)
      : [];

    const waypointSets = [[start, end]];
    validMids.forEach((mid) => {
      waypointSets.push([start, mid, end]);
    });

    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      const tasks = waypointSets.map((wps) => fetchRoute(wps, controller.signal));
      const results = await Promise.all(tasks.map((p) => p.catch(() => null)));

      if (cancelled) return;

      setRoutes(results);

      const defined = results.filter(Boolean);
      const allCoords = defined.flat();
      if (allCoords.length) {
        const bounds = L.latLngBounds(allCoords);
        map.whenReady(() => {
          if (!cancelled) {
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15, animate: false });
          }
        });
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
      setRoutes([]);
    };
  }, [map, startKey, endKey, middleKey]);

  return (
    <>
      {routes.map(
        (coords, i) =>
          coords && (
            <Polyline
              key={i}
              positions={coords}
              pathOptions={{
                color: i === 0 ? "#1452EE" : "#BCCEFB",
                weight: i === 0 ? 7 : 5,
                opacity: 1,
              }}
            />
          )
      )}
    </>
  );
}

export default function ScenarioMapPreview({
  scenario,
  onChange = () => {},
  className = "h-64 w-full",
}) {
  const [previewMode, setPreviewMode] = useState("canonical");
  const [comboIndex, setComboIndex] = useState(0);

  const startRaw = Array.isArray(scenario?.start) ? scenario.start : [];
  const endRaw = Array.isArray(scenario?.end) ? scenario.end : [];

  const startOptions = startRaw.filter(isValidCoord);
  const endOptions = endRaw.filter(isValidCoord);

  const validationErrors = [];

  if (!startRaw.length) {
    validationErrors.push("Missing starting points");
  } else if (!startOptions.length) {
    validationErrors.push("Starting points must be [lat, lng] numbers");
  }

  if (!endRaw.length) {
    validationErrors.push("Missing ending points");
  } else if (!endOptions.length) {
    validationErrors.push("Ending points must be [lat, lng] numbers");
  }

  const start = startOptions[0] || null;
  const end = endOptions[0] || null;

  if (!start || !end) {
    return (
      <div
        className={`relative ${className} flex items-center justify-center rounded border border-dashed border-rose-300 bg-rose-50 p-4 text-sm text-rose-700`}
      >
        <div className="space-y-1 text-center">
          <p className="font-semibold">Unable to render map preview</p>
          <ul className="space-y-0.5">
            {validationErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const alternatives = Array.isArray(scenario.choice_list) ? scenario.choice_list : [];

  const combinations = useMemo(() => buildCombinations(scenario), [scenario]);

  useEffect(() => {
    if (previewMode === "canonical") {
      setComboIndex(0);
      return;
    }

    if (previewMode === "sample" && combinations.length) {
      setComboIndex((prev) => {
        if (combinations.length === 1) return 0;
        let next = Math.floor(Math.random() * combinations.length);
        if (next === prev) {
          next = (next + 1) % combinations.length;
        }
        return next;
      });
    }
  }, [previewMode, combinations]);

  useEffect(() => {
    if (!combinations.length) {
      setComboIndex(0);
      return;
    }

    setComboIndex((idx) => {
      if (idx >= combinations.length) {
        return combinations.length - 1;
      }
      return idx;
    });
  }, [combinations.length]);

  const activeCombo = combinations.length ? combinations[comboIndex] : null;

  const activeStart = activeCombo?.start || start;
  const activeEnd = activeCombo?.end || end;
  const middleSelections = activeCombo
    ? activeCombo.middlePoints.map((mp) => mp?.coord || null)
    : alternatives.map((ch) => (Array.isArray(ch.middle_point?.[0]) ? ch.middle_point[0] : null));

  const markersDraggable = previewMode === "canonical";

  const handleDrag = (type, idx) => (e) => {
    const { lat, lng } = e.target.getLatLng();
    if (type === "start") {
      const arr = Array.isArray(scenario.start) ? [...scenario.start] : [];
      arr[0] = [lat, lng];
      onChange({ start: arr });
    } else if (type === "end") {
      const arr = Array.isArray(scenario.end) ? [...scenario.end] : [];
      arr[0] = [lat, lng];
      onChange({ end: arr });
    } else if (type === "mid") {
      const next = alternatives.map((r, i) => {
        if (i !== idx) return r;
        const arr = Array.isArray(r.middle_point) ? [...r.middle_point] : [];
        arr[0] = [lat, lng];
        return { ...r, middle_point: arr };
      });
      onChange({ choice_list: next });
    }
  };

  const boundCoords = [activeStart, activeEnd, ...middleSelections.filter(Boolean)];
  const bounds = L.latLngBounds(boundCoords);

  const canCycle = combinations.length > 1;

  const cyclePrev = () => {
    if (!canCycle || previewMode !== "sample") return;
    setComboIndex((idx) => (idx - 1 + combinations.length) % combinations.length);
  };

  const cycleNext = () => {
    if (!canCycle || previewMode !== "sample") return;
    setComboIndex((idx) => (idx + 1) % combinations.length);
  };

  const randomize = () => {
    if (!canCycle || previewMode !== "sample") return;
    setComboIndex((prev) => {
      let next = Math.floor(Math.random() * combinations.length);
      if (next === prev) {
        next = (next + 1) % combinations.length;
      }
      return next;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
        <div className="flex overflow-hidden rounded bg-white shadow">
          <button
            type="button"
            onClick={() => setPreviewMode("canonical")}
            className={`px-3 py-1 text-xs font-medium transition ${
              previewMode === "canonical"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Canonical preview
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("sample")}
            className={`px-3 py-1 text-xs font-medium transition ${
              previewMode === "sample"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Sample preview
          </button>
        </div>
        {canCycle && (
          <div className="flex items-center gap-2 rounded bg-white/95 px-3 py-1 text-xs shadow">
            <button
              type="button"
              onClick={cyclePrev}
              disabled={previewMode !== "sample"}
              className="rounded border px-2 py-0.5 disabled:opacity-40"
              aria-label="Previous combination"
            >
              ◀
            </button>
            <span className="font-medium">
              {comboIndex + 1} / {combinations.length}
            </span>
            <button
              type="button"
              onClick={cycleNext}
              disabled={previewMode !== "sample"}
              className="rounded border px-2 py-0.5 disabled:opacity-40"
              aria-label="Next combination"
            >
              ▶
            </button>
            <button
              type="button"
              onClick={randomize}
              disabled={previewMode !== "sample"}
              className="rounded border px-2 py-0.5 disabled:opacity-40"
            >
              Shuffle
            </button>
          </div>
        )}
        {previewMode === "sample" && (
          <span className="rounded bg-white/90 px-2 py-0.5 text-[0.65rem] text-gray-600 shadow">
            Sample mode is read-only
          </span>
        )}
      </div>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [20, 20], maxZoom: 15 }}
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
        {activeStart && (
          <Marker
            position={activeStart}
            draggable={markersDraggable}
            icon={startIcon}
            eventHandlers={
              markersDraggable ? { dragend: handleDrag("start") } : undefined
            }
          />
        )}
        {activeEnd && (
          <Marker
            position={activeEnd}
            draggable={markersDraggable}
            icon={endIcon}
            eventHandlers={
              markersDraggable ? { dragend: handleDrag("end") } : undefined
            }
          />
        )}
        {alternatives.map((ch, i) => {
          const mid = middleSelections[i];
          return (
            mid && (
              <Marker
                key={i}
                position={mid}
                draggable={markersDraggable}
                eventHandlers={
                  markersDraggable ? { dragend: handleDrag("mid", i) } : undefined
                }
              />
            )
          );
        })}
        <Routes start={activeStart} end={activeEnd} middlePoints={middleSelections} />
      </MapContainer>
    </div>
  );
}

