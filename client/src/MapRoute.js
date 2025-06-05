import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

const Routing = ({ from, to }) => {
  const map = useMap();
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [routes, setRoutes] = useState([
    { coords: null, summary: null },
    { coords: null, summary: null },
  ]);

  useEffect(() => {
    const waypointsList = [
      [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      [
        L.latLng(from[0], from[1]),
        L.latLng(from[0] + 0.02, from[1] + 0.01),
        L.latLng(to[0], to[1]),
      ],
    ];

    const fakeSummaries = [
      { totalTime: 12 * 60 * 1000, totalDistance: 5600 },
      { totalTime: 28 * 60 * 1000, totalDistance: 10300 },
    ];

    const controls = [];

    waypointsList.forEach((waypoints, index) => {
      const control = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: false,
        fitSelectedRoutes: false,
        createMarker: () => null,
        lineOptions: {
          styles: [],
        },
      }).addTo(map);

      control.on("routesfound", (e) => {
        const coords = e.routes[0].coordinates.map((c) => [c.lat, c.lng]);
        setRoutes((prev) => {
          const updated = [...prev];
          updated[index] = {
            coords,
            summary: fakeSummaries[index],
          };
          return updated;
        });
      });

      controls.push(control);
    });

    return () => {
      controls.forEach((ctrl) => map.removeControl(ctrl));
      setRoutes([
        { coords: null, summary: null },
        { coords: null, summary: null },
      ]);
    };
  }, [map, from, to]);

  const colors = ["#4285F4", "#B0BEC5"];
  const dashStyles = ["5, 5", null];

  const formatDistance = (meters) =>
    meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters.toFixed(0)} m`;

  const formatDuration = (ms) => {
    const min = Math.round(ms / 60000);
    return `${min} min`;
  };

  const handleGoClick = async () => {
    const label = selectedRoute === 0 ? "time" : "safety";
    try {
      await fetch("http://localhost:5000/api/log-choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: label }),
      });
      window.location.href = "/thank-you";  // Redirect to thank you page
    } catch (err) {
      console.error("Error sending choice:", err);
      alert("Failed to log choice. Please try again.");
    }
  };

  return (
    <>
      {routes.map((route, i) => {
        if (!route.coords || !route.summary) return null;

        const middleIndex = Math.floor(route.coords.length / 2);
        const middlePoint = route.coords[middleIndex];

        const isFaster = route.summary.totalTime < routes[1 - i]?.summary?.totalTime;

        return (
          <Polyline
            key={i}
            positions={route.coords}
            pathOptions={{
              color: colors[i],
              weight: i === selectedRoute ? 7 : 5,
              opacity: i === selectedRoute ? 1 : 0.3,
              dashArray: dashStyles[i],
            }}
            eventHandlers={{
              click: () => setSelectedRoute(i),
            }}
          >
            <Popup position={middlePoint}>
              <div style={{ textAlign: "center", fontSize: "14px" }}>
                <div style={{ fontSize: "16px" }}>
                  🚗 {formatDuration(route.summary.totalTime)}
                </div>
                <div>{formatDistance(route.summary.totalDistance)}</div>
                <div
                  style={{
                    marginTop: "4px",
                    fontWeight: "bold",
                    color: i === 0 ? "#202124" : "#5F6368",
                  }}
                >
                  {isFaster ? "⚡ Faster" : "🐢 Slower"}{" "}
                  {i === 0 ? "⚠️ Less Safe" : "🛡️ Safer Route"}
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* Context Panel */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 300,
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          fontFamily: "sans-serif",
          fontSize: "15px",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "18px" }}>Choose Your Route</h2>
        <p style={{ margin: "12px 0" }}>
          You're planning a route. One is{" "}
          <span style={{ fontWeight: "bold" }}>faster but less safe</span>. The other is{" "}
          <span style={{ fontWeight: "bold" }}>slower but safer</span>.
        </p>
        <p>Which would you choose today?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px", alignItems: "center" }}>
          {/* Fast & Less Safe toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: "bold", color: selectedRoute === 0 ? "#202124" : "#5F6368" }}>⚡ Fast & Less Safe</span>

            <label style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
              <input
                type="checkbox"
                checked={selectedRoute === 0}
                onChange={() => setSelectedRoute(0)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: selectedRoute === 0 ? "#4285F4" : "#E0E0E0",
                  transition: ".4s",
                  borderRadius: "34px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  height: "26px",
                  width: "26px",
                  left: selectedRoute === 0 ? "32px" : "4px",
                  bottom: "4px",
                  backgroundColor: "#FFFFFF",
                  transition: ".4s",
                  borderRadius: "50%",
                }}
              />
            </label>
          </div>

          {/* Safe & Slower toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: "bold", color: selectedRoute === 1 ? "#202124" : "#5F6368" }}>🛡 Slower & Safe</span>

            <label style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
              <input
                type="checkbox"
                checked={selectedRoute === 1}
                onChange={() => setSelectedRoute(1)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: selectedRoute === 1 ? "#202124" : "#5F6368",
                  transition: ".4s",
                  borderRadius: "34px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  height: "26px",
                  width: "26px",
                  left: selectedRoute === 1 ? "32px" : "4px",
                  bottom: "4px",
                  backgroundColor: "white",
                  transition: ".4s",
                  borderRadius: "50%",
                }}
              />
            </label>
          </div>

          <button
            onClick={handleGoClick}
            style={{
              padding: "10px 12px",
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✅ Go
          </button>
        </div>


      </div>
    </>
  );
};

const MapRoute = () => {
  const start = [45.42376893995412, -75.68643663030589];
  const end = [45.38318580824864, -75.6715176376448];

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={start}
        zoom={13}
        style={{ height: "100vh", width: "100vw" }}
        scrollWheelZoom={false}
        zoomControl={false}
        doubleClickZoom={false}
        dragging={true}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Routing from={start} to={end} />
      </MapContainer>
    </div>
  );
};

export default MapRoute;