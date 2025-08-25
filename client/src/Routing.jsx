import React, { useEffect, useState, useRef } from "react";
import { useMap, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

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
      controls.forEach((ctrl) => map.removeControl(ctrl));
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
      <Marker position={from} icon={carIcon} />
      <Marker position={to} icon={flagIcon} />

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
