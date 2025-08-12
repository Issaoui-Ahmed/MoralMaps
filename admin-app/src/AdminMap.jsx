import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
  Circle
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";


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

const middlePointIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png", // example icon, you can change it
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});


const RouteRenderer = React.memo(({ start, end, routeCoords }) => {
  const map = useMap();
  const controlsRef = useRef([]);
  const [routeLines, setRouteLines] = useState([]);

  useEffect(() => {
    controlsRef.current.forEach(ctrl => map.removeControl(ctrl));
    controlsRef.current = [];
    setRouteLines([]);

    const newLines = [];

    const drawRoute = (waypoints, index) => {
      const control = L.Routing.control({
        waypoints: waypoints.map(p => L.latLng(p[0], p[1])),
        addWaypoints: false,
        draggableWaypoints: false,
        routeWhileDragging: false,
        show: false,
        fitSelectedRoutes: false,
        createMarker: () => null,
        lineOptions: { styles: [] },
      }).addTo(map);

      control.on("routesfound", e => {
        const coords = e.routes[0].coordinates.map(c => [c.lat, c.lng]);
        newLines.push({ coords, index });
        if (newLines.length === routeCoords.length + 1) {
          setRouteLines(newLines);
        }
      });

      controlsRef.current.push(control);
    };

    if (start.every(Boolean) && end.every(Boolean)) {
      drawRoute([start, end], -1); // direct route
      routeCoords.forEach((coords, i) => {
        if (coords.every(Boolean)) {
          drawRoute([start, coords, end], i);
        }
      });
    }

    return () => {
      controlsRef.current.forEach(ctrl => map.removeControl(ctrl));
    };
  }, [start, end, routeCoords, map]);

  return (
    <>
      {routeLines.map((line, i) => (
        <Polyline
          key={i}
          positions={line.coords}
          pathOptions={{ color: "#1452EE", weight: 5, opacity: 0.9 }}
        />
      ))}
    </>
  );
});

const AdminMap = () => {
  const [start, setStart] = useState([null, null]);
  const [end, setEnd] = useState([null, null]);
  const [routes, setRoutes] = useState([]);
  const [defaultSummary, setDefaultSummary] = useState({ totalTime: 0, totalDistance: 0 });
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/route-endpoints")
      .then(res => res.json())
      .then(({ start, end, middlePoints, routeNames, fakeSummaries }) => {
        setStart(start);
        setEnd(end);
        setDefaultSummary(fakeSummaries?.[0] || { totalTime: 0, totalDistance: 0 });
        setRoutes(
          (middlePoints || []).map((p, i) => ({
            name: routeNames?.[i] || `Route ${i + 1}`,
            coords: p,
            summary: fakeSummaries?.[i + 1] || { totalTime: 0, totalDistance: 0 },
          }))
        );
      })
      .catch(() => setStatusMsg("⚠️ Failed to load route endpoints."));
  }, []);

  // ✅ Memoize coordinates ONLY so rerender happens only on coord change
  const routeCoords = useMemo(() => {
    return routes.map(r => r.coords);
  }, [routes.map(r => r.coords.join(",")).join("|")]);

  const saveAll = async () => {
    const body = {
      start,
      end,
      middlePoints: routes.map(r => r.coords),
      routeNames: routes.map(r => r.name),
      fakeSummaries: [
        defaultSummary,
        ...routes.map(r => r.summary),
      ],
    };

    const res = await fetch("http://localhost:5000/api/route-endpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) setStatusMsg("✅ Coordinates saved!");
    else setStatusMsg("❌ " + (data.error || "Error saving coordinates."));
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const restrictInput = (e) => {
    const allowed = /[0-9.\-]/;
    if (!allowed.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
      e.preventDefault();
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        if (!start.every(Boolean)) setStart(coords);
        else if (!end.every(Boolean)) setEnd(coords);
        else setRoutes([...routes, {
          name: `Route ${routes.length + 1}`,
          coords,
          summary: { totalTime: 0, totalDistance: 0 },
        }]);
      },
    });
    return null;
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <MapContainer
        center={start.every(Boolean) ? start : [45.4215, -75.6972]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {start.every(Boolean) && (
          <Marker
            position={start}
            icon={carIcon}
            draggable
            eventHandlers={{
              dragend: (e) => setStart([e.target.getLatLng().lat, e.target.getLatLng().lng]),
            }}
          />
        )}

        {end.every(Boolean) && (
          <Marker
            position={end}
            icon={flagIcon}
            draggable
            eventHandlers={{
              dragend: (e) => setEnd([e.target.getLatLng().lat, e.target.getLatLng().lng]),
            }}
          />
        )}

        {routes.map((r, i) =>
  r.coords.every(Boolean) ? (
    <Marker
      key={i}
      position={r.coords}
      icon={middlePointIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const updated = [...routes];
          updated[i].coords = [e.target.getLatLng().lat, e.target.getLatLng().lng];
          setRoutes(updated);
        },
      }}
    />
  ) : null
)}


        <RouteRenderer start={start} end={end} routeCoords={routeCoords} />
        <MapClickHandler />
      </MapContainer>

      {/* UI Controls */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1000,
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          width: 320,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          overflowY: "auto",
          maxHeight: "95vh",
        }}
      >
        <h3>Start & End</h3>
        {[["Latitude", 0], ["Longitude", 1]].map(([label, i]) => (
          <input
            key={`start-${label}`}
            placeholder={`Start ${label}`}
            value={start[i] ?? ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const next = [...start];
              next[i] = isNaN(val) ? null : val;
              setStart(next);
            }}
            onKeyDown={restrictInput}
            style={{ width: "100%", marginBottom: 8 }}
          />
        ))}

        {[["Latitude", 0], ["Longitude", 1]].map(([label, i]) => (
          <input
            key={`end-${label}`}
            placeholder={`End ${label}`}
            value={end[i] ?? ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const next = [...end];
              next[i] = isNaN(val) ? null : val;
              setEnd(next);
            }}
            onKeyDown={restrictInput}
            style={{ width: "100%", marginBottom: 8 }}
          />
        ))}

        <h3>Default Route Summary</h3>
        <input
          placeholder="Total Time (ms)"
          value={defaultSummary.totalTime}
          onChange={(e) =>
            setDefaultSummary({ ...defaultSummary, totalTime: parseInt(e.target.value) || 0 })
          }
          onKeyDown={restrictInput}
          style={{ width: "100%", marginBottom: 4 }}
        />
        <input
          placeholder="Total Distance (m)"
          value={defaultSummary.totalDistance}
          onChange={(e) =>
            setDefaultSummary({ ...defaultSummary, totalDistance: parseInt(e.target.value) || 0 })
          }
          onKeyDown={restrictInput}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <h3>Routes</h3>
        {routes.map((r, i) => (
          <div key={i} style={{ marginBottom: 12, borderBottom: "1px solid #ccc", paddingBottom: 8 }}>
            <input
              placeholder="Name"
              value={r.name}
              onChange={(e) => {
                const updated = [...routes];
                updated[i].name = e.target.value;
                setRoutes(updated);
              }}
              style={{ width: "100%", marginBottom: 4 }}
            />
            {["Latitude", "Longitude"].map((label, j) => (
              <input
                key={label + j}
                placeholder={label}
                value={r.coords[j] ?? ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const updated = [...routes];
                  updated[i].coords[j] = isNaN(val) ? null : val;
                  setRoutes(updated);
                }}
                onKeyDown={restrictInput}
                style={{ width: "100%", marginBottom: 4 }}
              />
            ))}
            <input
              placeholder="Total Time (ms)"
              value={r.summary.totalTime}
              onChange={(e) => {
                const updated = [...routes];
                updated[i].summary.totalTime = parseInt(e.target.value) || 0;
                setRoutes(updated);
              }}
              onKeyDown={restrictInput}
              style={{ width: "100%", marginBottom: 4 }}
            />
            <input
              placeholder="Total Distance (m)"
              value={r.summary.totalDistance}
              onChange={(e) => {
                const updated = [...routes];
                updated[i].summary.totalDistance = parseInt(e.target.value) || 0;
                setRoutes(updated);
              }}
              onKeyDown={restrictInput}
              style={{ width: "100%", marginBottom: 4 }}
            />
            <button onClick={() => setRoutes(routes.filter((_, idx) => idx !== i))}>
              🗑 Delete
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            setRoutes([...routes, {
              name: `Route ${routes.length + 1}`,
              coords: [null, null],
              summary: { totalTime: 0, totalDistance: 0 },
            }])
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          ➕ Add Route
        </button>

        <button onClick={saveAll} style={{ width: "100%" }}>
          💾 Save All
        </button>

        {statusMsg && <p style={{ marginTop: 8 }}>{statusMsg}</p>}
      </div>
    </div>
  );
};

export default AdminMap;
