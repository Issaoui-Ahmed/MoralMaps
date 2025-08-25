import React, { useEffect, useState, useRef } from "react";
import { useMap, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const createTextPinIcon = (color, label) =>
  L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    html: `
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <text x="12" y="16" text-anchor="middle" font-size="10" font-family="Arial" font-weight="bold" fill="#fff">${label}</text>
      </svg>
    `,
  });

const startIcon = createPinIcon(
  "#34A853",
  "M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.23.42-1.43 1.01L3 11v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-7l-1.08-5.99zM6.85 6h10.29l1.04 3H5.81l1.04-3zM5 16v-3h14v3H5z"
);

const endIcon = createPinIcon(
  "#EA4335",
  "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
);


const Routing = ({
  from,
  to,
  middle,
  totalTimeMinutes,
  defaultTimeMinutes,
  selectedLabel,
  setSelectedLabel,
  consentGiven,
  setMapPoints,
  setRoutes,
  scenarioLabel,
}) => {
  const map = useMap();
  const [localRoutes, setLocalRoutes] = useState([]);
  const polylineRefs = useRef([]);

  useEffect(() => {
    if (!map || !from || !to) return;

    const defaultWaypoints = [
      L.latLng(from[0], from[1]),
      L.latLng(to[0], to[1])
    ];

    const altWaypoints = [
      L.latLng(from[0], from[1]),
      L.latLng(middle[0], middle[1]),
      L.latLng(to[0], to[1])
    ];

    const waypointsList = [defaultWaypoints, altWaypoints];
    const timeList = [defaultTimeMinutes, totalTimeMinutes];

    const controls = [];
    const newRoutes = [];

    waypointsList.forEach((waypoints, index) => {
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
        const coords = e.routes[0].coordinates.map((c) => [c.lat, c.lng]);
        newRoutes[index] = {
          coords,
          totalTimeMinutes: timeList[index] ?? 0,
        };

        if (newRoutes.filter(Boolean).length === waypointsList.length) {
          setLocalRoutes([...newRoutes]);
        }
      });

      controls.push(control);
    });

    return () => {
      controls.forEach((ctrl) => {
        // Cancel any in-flight routing requests and detach listeners
        ctrl.off();
        if (ctrl.getRouter && typeof ctrl.getRouter().abort === "function") {
          ctrl.getRouter().abort();
        }
        map.removeControl(ctrl);
      });
      setLocalRoutes([]);
    };
  }, [map, from, to, middle, totalTimeMinutes, defaultTimeMinutes]);

  useEffect(() => {
    if (!map || !consentGiven) return;

    const updatePoints = () => {
      const newPoints = localRoutes.map((route) => {
        if (!route?.coords) return null;
        const mid = route.coords[Math.floor(route.coords.length / 2)];
        const point = map.latLngToContainerPoint(L.latLng(mid[0], mid[1]));
        return { x: point.x, y: point.y };
      });

      setMapPoints(newPoints);
      setRoutes(localRoutes);
    };

    map.on("move", updatePoints);
    map.on("zoom", updatePoints);
    updatePoints();

    return () => {
      map.off("move", updatePoints);
      map.off("zoom", updatePoints);
    };
  }, [map, localRoutes, consentGiven, setMapPoints, setRoutes]);

  useEffect(() => {
    const selectedIndex = selectedLabel === "default" ? 0 : 1;
    const selectedPolyline = polylineRefs.current[selectedIndex];
    if (selectedPolyline?.bringToFront) {
      selectedPolyline.bringToFront();
    }
  }, [selectedLabel, localRoutes]);

  return (
    <>
      <Marker position={from} icon={startIcon} />
      <Marker position={to} icon={endIcon} />

      {localRoutes.map((route, i) =>
        route?.coords ? (
          <Polyline
            key={i}
            positions={route.coords}
            pathOptions={{
              color: (selectedLabel === "default" && i === 0) || (selectedLabel !== "default" && i === 1) ? "#1452EE" : "#BCCEFB",
              weight: (selectedLabel === "default" && i === 0) || (selectedLabel !== "default" && i === 1) ? 7 : 5,
              opacity: 1,
            }}
            eventHandlers={{
              click: () => setSelectedLabel(i === 0 ? "default" : scenarioLabel),
            }}
            ref={(el) => {
              if (el) polylineRefs.current[i] = el;
            }}
          />
        ) : null
      )}
    </>
  );
};

export default Routing;
