import React, { useMemo, useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { useConfig } from "./AdminApp";

// --- Map-as-background editor ---
// Now shows the default route + ALL variant routes simultaneously.
// All routes are light blue except the currently selected route, which is dark blue.
// Selection can be made by clicking a route on the map or a card in the left panel.

const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
const flagIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const midIcon = new L.DivIcon({
  className: "",
  html: '<div class="w-4 h-4 rounded-full bg-amber-500 ring-2 ring-white shadow"/>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const defaultCenter = [45.5017, -73.5673];

export default function RoutesEditor() {
  const { config, setConfig, setDirty } = useConfig();

  // Safe fallbacks
  const routes = (config?.routes) || { default: { totalTimeMinutes: 0 } };
  const nonDefaultKeys = useMemo(() => Object.keys(routes).filter(k => k !== "default").sort(), [routes]);
  const secondKey = nonDefaultKeys[0] || null; // the editable named route

  // Variants (belong to the second route if present)
  const variants = secondKey ? (routes[secondKey]?.variants || []) : [];

  // --- Selection state ---
  // selectedIdx: 0 = default route, 1..N = variant index + 1
  const [selectedIdx, setSelectedIdx] = useState(0);
  // Keep an editing-focused index for TTS etc.
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);

  // Helpers
  const patchConfig = (patch) => { setConfig(prev => ({ ...prev, ...patch })); setDirty(true); };
  const patchRoute = (key, patch) => {
    setConfig(prev => ({ ...prev, routes: { ...prev.routes, [key]: { ...prev.routes[key], ...patch } } }));
    setDirty(true);
  };

  // Rename the second route key
  const renameSecondRoute = (newKey) => {
    if (!secondKey || !newKey || newKey === "default" || newKey in routes) return;
    const copy = { ...routes };
    copy[newKey] = copy[secondKey];
    delete copy[secondKey];
    patchConfig({ routes: copy });
  };

  const addVariant = () => {
    if (!secondKey) return;
    const mid = midpoint(config?.start, config?.end);
    const nextVariants = [...variants, { middle: mid, tts: [4] }];
    patchRoute(secondKey, { variants: nextVariants });
    setActiveVariantIdx(nextVariants.length - 1);
    setSelectedIdx(nextVariants.length); // select newly added
  };
  const updateVariant = (idx, patch) => {
    if (!secondKey) return;
    const next = [...variants]; next[idx] = { ...next[idx], ...patch };
    patchRoute(secondKey, { variants: next });
  };
  const deleteVariant = (idx) => {
    if (!secondKey) return;
    const next = variants.filter((_, i) => i !== idx);
    patchRoute(secondKey, { variants: next });
    // Adjust selection and active index
    if (selectedIdx === idx + 1) setSelectedIdx(0); // if deleted selected variant, fall back to default
    if (activeVariantIdx >= next.length) setActiveVariantIdx(Math.max(0, next.length - 1));
  };

  // Map preview middles: all variant middles
  const middles = variants.map(v => Array.isArray(v?.middle) ? v.middle : null);

  // Selected variant middle (for showing draggable middle marker)
  const selectedVariantIdx = selectedIdx > 0 ? selectedIdx - 1 : null;
  const selectedMiddle = (selectedVariantIdx != null && Array.isArray(variants[selectedVariantIdx]?.middle))
    ? variants[selectedVariantIdx].middle
    : null;

  const defaultMinutes = routes?.default?.totalTimeMinutes ?? 0;

  return (
    <div className="relative h-[calc(100vh-2rem)]">
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={Array.isArray(config?.start) ? config.start : defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {Array.isArray(config?.start) && Array.isArray(config?.end) && (
            <MultiRoutingLayer
              from={config.start}
              to={config.end}
              middles={middles}
              selectedIdx={selectedIdx}
              onSelect={(i)=>{
                setSelectedIdx(i);
                if (i > 0) setActiveVariantIdx(i - 1);
              }}
              defaultTimeMinutes={defaultMinutes}
            />
          )}

          {Array.isArray(config?.start) && (
            <DraggableMarker
              position={config.start}
              icon={carIcon}
              onDragEnd={(ll) => patchConfig({ start: [ll.lat, ll.lng] })}
            />
          )}
          {Array.isArray(config?.end) && (
            <DraggableMarker
              position={config.end}
              icon={flagIcon}
              onDragEnd={(ll) => patchConfig({ end: [ll.lat, ll.lng] })}
            />
          )}
          {/* Show ONLY the selected variant's middle as draggable */}
          {Array.isArray(selectedMiddle) && (
            <DraggableMarker
              position={selectedMiddle}
              icon={midIcon}
              onDragEnd={(ll) => updateVariant(selectedVariantIdx, { middle: [ll.lat, ll.lng] })}
            />
          )}
        </MapContainer>
      </div>

      {/* Left Editing Panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[460px] bg-white z-10 border-r rounded-r-2xl p-4 overflow-y-auto shadow">
        <h2 className="text-lg font-semibold mb-3">Routes Editor</h2>

        {/* Start / End */}
        <Section title="Start / End">
          <CoordRow label="Start" value={config?.start} onChange={(val)=>patchConfig({ start: val })} />
          <CoordRow label="End" value={config?.end} onChange={(val)=>patchConfig({ end: val })} />
        </Section>

        {/* Default summary */}
        <Section title="Default route time">
          <NumberInput
            label="Total time (minutes)"
            value={routes.default?.totalTimeMinutes || 0}
            onChange={(n)=>patchRoute("default", { totalTimeMinutes: n })}
          />
        </Section>

        {/* Second route basic fields */}
        <Section title="Second route">
          <TextInput
            label="Name"
            value={secondKey || ""}
            disabled={!secondKey}
            onChange={(v)=> renameSecondRoute(v)}
          />
          <TextArea
            label="Description"
            value={(secondKey && routes?.[secondKey]?.description) || ""}
            onChange={(v)=> secondKey && patchRoute(secondKey, { description: v })}
          />
        </Section>

        {/* Route list & selection */}
        <Section title="Routes">
          <div className="space-y-3">
            {/* Default route card */}
            <button
              type="button"
              className={`w-full text-left border rounded-lg p-3 ${selectedIdx===0? 'border-indigo-300 bg-indigo-50/40' : 'border-gray-200'}`}
              onClick={()=> setSelectedIdx(0)}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Default route</div>
                {selectedIdx===0 && <span className="text-[11px] text-indigo-600">Selected</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">Start → End</div>
            </button>

            {/* Variants list */}
            {!secondKey || (variants?.length ?? 0) === 0 ? (
              <div className="text-xs text-gray-500 mb-2">No variants yet.</div>
            ) : null}

            {secondKey && variants.map((v, idx) => (
              <div key={idx} className={`border rounded-lg p-3 ${selectedIdx===idx+1? 'border-indigo-300 bg-indigo-50/40' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  {/* Whole card selects */}
                  <button
                    className="text-sm font-medium"
                    onClick={()=>{ setSelectedIdx(idx+1); setActiveVariantIdx(idx); }}
                  >
                    Variant {idx+1}
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="text-xs px-2 py-1 border rounded" onClick={()=>{ setSelectedIdx(idx+1); setActiveVariantIdx(idx); }}>Select</button>
                    <button className="text-xs px-2 py-1 border rounded" onClick={()=>deleteVariant(idx)}>Delete</button>
                  </div>
                </div>
                {/* Middle coordinates input intentionally omitted */}
                <TextInput
                  label={
                    <span>
                      TTS (comma-separated)
                      <span className="ml-2 text-[11px] text-gray-500">e.g. <code>6</code> or <code>6,6,4</code></span>
                    </span>
                  }
                  value={Array.isArray(v?.tts) ? v.tts.join(",") : ""}
                  onChange={(val)=> updateVariant(idx, { tts: parseTts(val) })}
                />
              </div>
            ))}

            <button className="text-sm px-2 py-1 border rounded-lg" onClick={addVariant}>Add variant</button>
          </div>
        </Section>
      </div>
    </div>
  );
}

// --- Multi-route map layer ---
function MultiRoutingLayer({ from, to, middles, selectedIdx, onSelect, defaultTimeMinutes }) {
  const map = useMap();
  const [routesData, setRoutesData] = useState([]); // [{coords, idx}] where idx: 0 = default, 1..N = variant
  const polylineRefs = useRef([]);

  useEffect(() => {
    if (!map || !from || !to) return;

    const ctrls = [];
    const found = [];

    // Build waypoint sets: first default, then each variant
    const waypointSets = [
      { idx: 0, waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])] },
      ...middles.map((m, i) => ({
        idx: i + 1,
        waypoints: Array.isArray(m)
          ? [L.latLng(from[0], from[1]), L.latLng(m[0], m[1]), L.latLng(to[0], to[1])]
          : null,
      }))
    ].filter(w => w.waypoints);

    waypointSets.forEach(({ idx, waypoints }) => {
      const control = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: false,
        fitSelectedRoutes: false,
        createMarker: () => null,
        lineOptions: { styles: [] },
      }).addTo(map);

      control.on("routesfound", (e) => {
        const coords = e.routes[0].coordinates.map(c => [c.lat, c.lng]);
        found.push({ idx, coords });
        // When all have been found, update state (preserve order by idx)
        if (found.length === waypointSets.length) {
          setRoutesData(found.sort((a,b)=>a.idx-b.idx));
        }
      });

      ctrls.push(control);
    });

    return () => {
      ctrls.forEach(c => {
        // Remove event listeners and abort any pending routing requests
        c.off();
        if (c.getRouter && typeof c.getRouter().abort === "function") {
          c.getRouter().abort();
        }
        map.removeControl(c);
      });
      setRoutesData([]);
    };
  }, [map, from, to, JSON.stringify(middles)]);

  return (
    <>
      {routesData.map((r) => (
        <Polyline
          key={r.idx}
          positions={r.coords}
          pathOptions={{
            color: r.idx === selectedIdx ? "#1452EE" : "#BCCEFB",
            weight: r.idx === selectedIdx ? 7 : 5,
            opacity: 1,
          }}
          eventHandlers={{ click: () => onSelect?.(r.idx) }}
          ref={el => { if (el) polylineRefs.current[r.idx] = el; }}
        />
      ))}
    </>
  );
}

function DraggableMarker({ position, onDragEnd, icon }) {
  return (
    <Marker
      position={position}
      icon={icon || new L.Icon.Default()}
      draggable
      eventHandlers={{ dragend: e => onDragEnd(e.target.getLatLng()) }}
    />
  );
}

// --- Small inputs ---
function Section({ title, children }) {
  return (
    <section className="mb-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function CoordRow({ label, value, onChange }) {
  const [lat, lng] = value || [0,0];
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 text-xs text-gray-600">{label}</div>
      <input className="flex-1 border rounded px-2 py-1" type="number" step="0.000001" value={lat ?? ""} onChange={(e)=>onChange([parseFloat(e.target.value), lng])} />
      <input className="flex-1 border rounded px-2 py-1" type="number" step="0.000001" value={lng ?? ""} onChange={(e)=>onChange([lat, parseFloat(e.target.value)])} />
    </div>
  );
}
function TextInput({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1">{label}</label>
      <input className="w-full border rounded px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} />
    </div>
  );
}
function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1">{label}</label>
      <textarea className="w-full border rounded px-3 py-2" rows={3} value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1">{label}</label>
      <input className="w-full border rounded px-3 py-2" type="number" value={Number.isFinite(value)?value:0} onChange={e=>onChange(Number(e.target.value))} />
    </div>
  );
}

// --- Utils ---
function parseTts(text) {
  if (!text) return [];
  // accept "6" or "6,6,4" or with spaces
  return String(text)
    .split(/[ ,]+/)
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
}
function midpoint(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return [45.5, -73.56];
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
