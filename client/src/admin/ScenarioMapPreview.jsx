"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

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

function Routes({ scenario }) {
  const map = useMap();
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (!map || !scenario) return;

    const start = Array.isArray(scenario.start?.[0]) ? scenario.start[0] : null;
    const end = Array.isArray(scenario.end?.[0]) ? scenario.end[0] : null;
    if (!start || !end) return;

    const waypointSets = [
      [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
    ];

    const alternatives = Array.isArray(scenario.choice_list) ? scenario.choice_list : [];
    alternatives.forEach((ch) => {
      const mid = Array.isArray(ch.middle_point?.[0]) ? ch.middle_point[0] : null;
      if (mid) {
        waypointSets.push([
          L.latLng(start[0], start[1]),
          L.latLng(mid[0], mid[1]),
          L.latLng(end[0], end[1]),
        ]);
      }
    });

    const controls = [];
    const newRoutes = [];

    waypointSets.forEach((wps, idx) => {
      const control = L.Routing.control({
        waypoints: wps,
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: false,
        fitSelectedRoutes: false,
        createMarker: () => null,
        lineOptions: { styles: [] },
      }).addTo(map);

      control.on("routesfound", (e) => {
        newRoutes[idx] = e.routes[0].coordinates.map((c) => [c.lat, c.lng]);
        if (newRoutes.filter(Boolean).length === waypointSets.length) {
          setRoutes([...newRoutes]);
          const allCoords = newRoutes.flatMap((r) => (r ? r : []));
          if (allCoords.length) {
            const bounds = L.latLngBounds(allCoords);
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15, animate: false });
          }
        }
      });

      controls.push(control);
    });

    return () => {
      controls.forEach((ctrl) => {
        ctrl.off();
        if (ctrl.getRouter && typeof ctrl.getRouter().abort === "function") {
          ctrl.getRouter().abort();
        }
        map.removeControl(ctrl);
      });
      setRoutes([]);
    };
  }, [map, scenario]);

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

export default function ScenarioMapPreview({ scenario, onChange = () => {} }) {
  const start = Array.isArray(scenario?.start?.[0]) ? scenario.start[0] : null;
  const end = Array.isArray(scenario?.end?.[0]) ? scenario.end[0] : null;
  if (!start || !end) return null;

  const alternatives = Array.isArray(scenario.choice_list) ? scenario.choice_list : [];

  const handleDrag = (type, idx) => (e) => {
    const { lat, lng } = e.target.getLatLng();
    if (type === "start") {
      onChange({ start: [[lat, lng]] });
    } else if (type === "end") {
      onChange({ end: [[lat, lng]] });
    } else if (type === "mid") {
      const next = alternatives.map((r, i) =>
        i === idx ? { ...r, middle_point: [[lat, lng]] } : r
      );
      onChange({ choice_list: next });
    }
  };

  const bounds = L.latLngBounds([start, end]);

  return (
    <div className="h-64 w-full">
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
        {start && (
          <Marker
            position={start}
            draggable
            eventHandlers={{ dragend: handleDrag("start") }}
          />
        )}
        {end && (
          <Marker
            position={end}
            draggable
            eventHandlers={{ dragend: handleDrag("end") }}
          />
        )}
        {alternatives.map((ch, i) => {
          const mid = Array.isArray(ch.middle_point?.[0]) ? ch.middle_point[0] : null;
          return (
            mid && (
              <Marker
                key={i}
                position={mid}
                draggable
                eventHandlers={{ dragend: handleDrag("mid", i) }}
              />
            )
          );
        })}
        <Routes scenario={scenario} />
      </MapContainer>
    </div>
  );
}

