import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Polyline,
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

const useRoute = (from, mid, to) => {
  const map = useMap();
  const [routeCoords, setRouteCoords] = useState(null);
  const controlRef = useRef(null);

  useEffect(() => {
    if (!from || !to || from.some((v) => v == null) || to.some((v) => v == null)) return;

    const waypoints = [L.latLng(from[0], from[1])];
    if (mid && mid.length === 2 && !mid.some((v) => v == null)) {
      waypoints.push(L.latLng(mid[0], mid[1]));
    }
    waypoints.push(L.latLng(to[0], to[1]));

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      show: false,
      fitSelectedRoutes: false,
      lineOptions: { styles: [] },
    }).addTo(map);

    control.on("routesfound", (e) => {
      const coords = e.routes[0].coordinates.map((c) => [c.lat, c.lng]);
      setRouteCoords(coords);
    });

    controlRef.current = control;

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
        setRouteCoords(null);
      }
    };
  }, [from, mid, to, map]);

  return routeCoords;
};

const RouteTab = ({ start, end, middlePoint, onMiddleChange, name, onNameChange, summary, onSummaryChange }) => {
  useMapEvents({
    click(e) {
      if (!middlePoint) {
        onMiddleChange([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  const routeCoords = useRoute(start, middlePoint, end);

  return (
    <>
      {middlePoint && (
        <Marker
          position={middlePoint}
          draggable
          eventHandlers={{
            dragend: (e) =>
              onMiddleChange([e.target.getLatLng().lat, e.target.getLatLng().lng]),
          }}
        />
      )}
      {routeCoords && (
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: "#BCCEFB", weight: 5 }}
        />
      )}

      <div style={{ marginTop: 12 }}>
        <label>Route Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        {middlePoint && (
          <div style={{ marginBottom: 8 }}>
            <label>Middle Point: {middlePoint.map((v) => v.toFixed(5)).join(", ")}</label>
          </div>
        )}
        <label>Total Time (ms):</label>
        <input
          type="number"
          value={summary.totalTime}
          onChange={(e) =>
            onSummaryChange({ ...summary, totalTime: parseInt(e.target.value) || 0 })
          }
          style={{ width: "100%", marginBottom: 8 }}
        />
        <label>Total Distance (m):</label>
        <input
          type="number"
          value={summary.totalDistance}
          onChange={(e) =>
            onSummaryChange({ ...summary, totalDistance: parseInt(e.target.value) || 0 })
          }
          style={{ width: "100%", marginBottom: 8 }}
        />
      </div>
    </>
  );
};

export default RouteTab;
