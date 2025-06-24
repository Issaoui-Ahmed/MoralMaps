import React, { useEffect, useState, useRef } from "react";
import { useMap, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import appConfig from "./appConfig";

// Icons
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
  consentGiven,
  selectedRouteIndex,
  setSelectedRouteIndex,
  setMapPoints,
  setRoutes,
}) => {
  const map = useMap();
  const numRoutes = 1 + appConfig.middlePoints.length;
  const [localRoutes, setLocalRoutes] = useState(
    Array(numRoutes).fill({ coords: null, summary: null })
  );

  const polylineRefs = useRef([]);

  // Setup routing and fetch routes
  useEffect(() => {
    if (!consentGiven || !map) return;

    const waypointsList = [
      [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      ...appConfig.middlePoints.map((mid) => [
        L.latLng(from[0], from[1]),
        L.latLng(mid[0], mid[1]),
        L.latLng(to[0], to[1]),
      ]),
    ];

    const fakeSummaries = appConfig.fakeSummaries;
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
        lineOptions: { styles: [] },
      }).addTo(map);

      control.on("routesfound", (e) => {
        const coords = e.routes[0].coordinates.map((c) => [c.lat, c.lng]);
        setLocalRoutes((prev) => {
          const updated = [...prev];
          updated[index] = { coords, summary: fakeSummaries[index] };
          return updated;
        });
      });

      controls.push(control);
    });

    return () => {
      controls.forEach((ctrl) => map.removeControl(ctrl));
      setLocalRoutes(Array(numRoutes).fill({ coords: null, summary: null }));
    };
  }, [map, from, to, consentGiven, numRoutes]);

  // Calculate screen points for summary labels
  useEffect(() => {
    if (!map || !consentGiven) return;

    const updatePoints = () => {
      const newPoints = localRoutes.map((route) => {
        if (!route.coords) return null;
        const mid = route.coords[Math.floor(route.coords.length / 2)];
        const point = map.latLngToContainerPoint(L.latLng(mid[0], mid[1]));
        return { x: point.x, y: point.y };
      });

      setMapPoints(newPoints);
      setRoutes(localRoutes); // share updated route summaries too
    };

    map.on("move", updatePoints);
    map.on("zoom", updatePoints);
    updatePoints();

    return () => {
      map.off("move", updatePoints);
      map.off("zoom", updatePoints);
    };
  }, [map, localRoutes, consentGiven, setMapPoints, setRoutes]);

  // Bring selected route to front
  useEffect(() => {
    const selectedPolyline = polylineRefs.current[selectedRouteIndex];
    if (selectedPolyline && selectedPolyline.bringToFront) {
      selectedPolyline.bringToFront();
    }
  }, [selectedRouteIndex, localRoutes]);

  return (
    <>
      <Marker position={from} icon={carIcon} />
      <Marker position={to} icon={flagIcon} />

      {localRoutes.map((route, i) =>
        route.coords && route.summary ? (
          <Polyline
            key={i}
            positions={route.coords}
            pathOptions={{
              color: i === selectedRouteIndex ? "#1452EE" : "#BCCEFB",
              weight: i === selectedRouteIndex ? 7 : 5,
              opacity: 1,
            }}
            eventHandlers={{ click: () => setSelectedRouteIndex(i) }}
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
