import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  Polyline,
  Marker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import consentText from "./consentText";

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

const Routing = ({ from, to, consentGiven }) => {
  const map = useMap();
  const [selectedRoute, setSelectedRoute] = useState(() => (Math.random() < 0.5 ? 0 : 1));
  const [routes, setRoutes] = useState([
    { coords: null, summary: null },
    { coords: null, summary: null },
  ]);
  const [mapPoints, setMapPoints] = useState([]);

  useEffect(() => {
    if (!consentGiven || !map) return;

    const midPoint = [45.42128445357713, -75.65860364134997];

    const waypointsList = [
      [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      [
        L.latLng(from[0], from[1]),
        L.latLng(midPoint[0], midPoint[1]),
        L.latLng(to[0], to[1]),
      ],
    ];

    const fakeSummaries = [
      { totalTime: 12 * 60 * 1000, totalDistance: 6000 },
      { totalTime: 16 * 60 * 1000, totalDistance: 7100 },
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
  }, [map, from, to, consentGiven]);

  useEffect(() => {
    if (!map || !consentGiven) return;

    const updatePoints = () => {
      const newPoints = routes.map((route) => {
        if (!route.coords) return null;
        const mid = route.coords[Math.floor(route.coords.length / 2)];
        const point = map.latLngToContainerPoint(L.latLng(mid[0], mid[1]));
        return { x: point.x, y: point.y };
      });
      setMapPoints(newPoints);
    };

    map.on("move", updatePoints);
    map.on("zoom", updatePoints);
    updatePoints();

    return () => {
      map.off("move", updatePoints);
      map.off("zoom", updatePoints);
    };
  }, [map, routes, consentGiven]);

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
      window.location.href = "/thank-you";
    } catch (err) {
      console.error("Error sending choice:", err);
      alert("Failed to log choice. Please try again.");
    }
  };

  return (
    <>
      <Marker position={from} icon={carIcon} />
      <Marker position={to} icon={flagIcon} />

      {routes.map((route, i) => {
        if (!route.coords || !route.summary) return null;
        return (
          <Polyline
            key={i}
            positions={route.coords}
            pathOptions={{
              color: i === selectedRoute ? "#1452EE" : "#BCCEFB",
              weight: i === selectedRoute ? 7 : 5,
              opacity: 1,
              dashArray: null,
            }}
            eventHandlers={{
              click: () => setSelectedRoute(i),
            }}
          />
        );
      })}

      {mapPoints.map((pt, i) => {
        const route = routes[i];
        if (!pt || !route?.summary) return null;

        return (
          <div
            key={`label-${i}`}
            style={{
              position: "absolute",
              left: pt.x + 8,
              top: pt.y - 20,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "4px 6px",
              fontSize: "12px",
              fontFamily: "sans-serif",
              color: "#333",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              textAlign: "left",
              zIndex: 1000,
              width: "80px",
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="#5f6368"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 11h14l-1.5-4.5h-11L5 11zm0 2c-.6 0-1 .4-1 1v6h2v-2h12v2h2v-6c0-.6-.4-1-1-1H5zm3.5 3c-.8 0-1.5-.7-1.5-1.5S7.7 13 8.5 13s1.5.7 1.5 1.5S9.3 16 8.5 16zm7 0c-.8 0-1.5-.7-1.5-1.5S14.7 13 15.5 13s1.5.7 1.5 1.5S16.3 16 15.5 16z" />
              </svg>
              <span
                style={{
    fontWeight: "bold",
    fontSize: "13px",
  }}
              >
                {formatDuration(route.summary.totalTime)}
              </span>
            </div>
            <div style={{ color: "#5f6368", fontSize: "11px", marginTop: "2px" }}>
              {formatDistance(route.summary.totalDistance)}
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "-6px",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderRight: "6px solid #ccc",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "-5px",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderRight: "5px solid #fff",
                zIndex: 1001,
              }}
            />
          </div>
        );
      })}

      {/* Context Panel */}
      {consentGiven && (
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
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "bold",
              }}
            >
              <span>Safe mode</span>
              <div
  onClick={() => setSelectedRoute((prev) => 1 - prev)}
  style={{
    width: "50px",
    height: "28px",
    borderRadius: "14px",
    backgroundColor: selectedRoute === 1 ? "#202124" : "#ccc", // Grayed out when off
    position: "relative",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  }}
>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    position: "absolute",
                    top: "2px",
                    left: selectedRoute === 0 ? "2px" : "24px",
                    transition: "left 0.3s ease",
                  }}
                />
              </div>
            </label>
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
      )}
    </>
  );
};

const MapRoute = () => {
  const start = [45.42376893995412, -75.68643663030589];
  const end = [45.38318580824864, -75.6715176376448];

  const [consentGiven, setConsentGiven] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);


  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={start}
        zoom={13}
        style={{ height: "100vh", width: "100vw" }}
        scrollWheelZoom={true}
        zoomControl={false}
        doubleClickZoom={false}
        dragging={true}
        touchZoom={false}
        boxZoom={false}
        keyboard={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Routing from={start} to={end} consentGiven={consentGiven} />
      </MapContainer>
      {showOnboarding && (
  <OnboardingModal
    step={onboardingStep}
    onNext={() => setOnboardingStep((s) => s + 1)}
    onBack={() => setOnboardingStep((s) => s - 1)}
    onSkip={() => setShowOnboarding(false)}
    onFinish={() => setShowOnboarding(false)}
  />
)}
      {!consentGiven && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ margin: "0 0 10px 0" }}>Consent Form</h2>

            <div
              onScroll={handleScroll}
              style={{
                overflowY: "scroll",
                flex: "1 1 auto",
                paddingRight: "10px",
                marginBottom: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "10px",
              }}
            >
              {consentText.split("\n").map((line, index) => (
                <p key={index}>{line.trim()}</p>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "center", marginTop: "10px", gap: "8px" }}>
              <input
                type="checkbox"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              I agree to the terms and conditions.
            </label>

            <button
              style={{
                marginTop: "12px",
                padding: "10px",
                backgroundColor: scrolledToBottom && checkboxChecked ? "#1452EE" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: scrolledToBottom && checkboxChecked ? "pointer" : "not-allowed",
              }}
              disabled={!scrolledToBottom || !checkboxChecked}
              onClick={() => {
  setConsentGiven(true);
  setShowOnboarding(true); // show onboarding immediately after consent
}}

            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const OnboardingModal = ({ step, onNext, onBack, onSkip, onFinish }) => {
  const steps = [
    {
      title: "Welcome!",
      content: (
        <>
          <p>
            In this short task, you will be shown two different routes from point A to B. One is{" "}
            <strong>faster</strong>, while the other is <strong>safer</strong>.
          </p>
          <p>Your job is to choose the one you would take if this were your trip today.</p>
        </>
      ),
    },
    {
      title: "How to choose a route",
      content: (
        <>
          <video
            src="/videos/select-routes.mp4"
            controls
            style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
          />
          <p>
            You can <strong>click on the route</strong> directly on the map, or use the toggle in the panel
            to select the one you prefer.
          </p>
        </>
      ),
    },
    {
      title: "How to submit your choice",
      content: (
        <>
          <video
            src="/videos/submit-choice.mp4"
            controls
            style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
          />
          <p>
            Once you've made your selection, click the <strong>✅ Go</strong> button to submit your choice.
          </p>
        </>
      ),
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          maxWidth: "600px",
          width: "100%",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{steps[step].title}</h2>
        <div style={{ marginBottom: "20px" }}>{steps[step].content}</div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onSkip}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline",
            }}
          >
            Skip tutorial
          </button>

          <div>
            {step > 0 && (
              <button
                onClick={onBack}
                style={{
                  padding: "8px 12px",
                  marginRight: "10px",
                  backgroundColor: "#eee",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={isLast ? onFinish : onNext}
              style={{
                padding: "8px 16px",
                backgroundColor: "#1452EE",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {isLast ? "Start" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapRoute;
