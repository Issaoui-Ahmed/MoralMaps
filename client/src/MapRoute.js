import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import Routing from "./Routing";
import RoutingLabels from "./RoutingLabels";
import appConfig from "./appConfig";
import OnboardingModal from "./OnboardingModal";

const MapRoute = () => {
  const { start, end } = appConfig.routeEndpoints;
  const numRoutes = 1 + appConfig.middlePoints.length;
  const [consentGiven, setConsentGiven] = useState(false);

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(() =>
    Math.floor(Math.random() * numRoutes)
  );

  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Shared state to pass summary positions from Routing to RoutingLabels
  const [mapPoints, setMapPoints] = useState([]);
  const [routes, setRoutes] = useState([]);

  const handleGoClick = async () => {
    const label =
      selectedRouteIndex === 0
        ? "default"
        : appConfig.routeNames[selectedRouteIndex - 1] || `route-${selectedRouteIndex}`;
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

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) setScrolledToBottom(true);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <MapContainer
        center={start}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Routing
          from={start}
          to={end}
          consentGiven={consentGiven}
          selectedRouteIndex={selectedRouteIndex}
          setSelectedRouteIndex={setSelectedRouteIndex}
          setMapPoints={setMapPoints}
          setRoutes={setRoutes}
        />
      </MapContainer>

      {/* ✅ Overlay labels on top of the map */}
      {consentGiven && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 400,
          }}
        >
          <RoutingLabels mapPoints={mapPoints} routes={routes} />
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          step={onboardingStep}
          onNext={() => setOnboardingStep((s) => s + 1)}
          onBack={() => setOnboardingStep((s) => s - 1)}
          onSkip={() => setShowOnboarding(false)}
          onFinish={() => setShowOnboarding(false)}
        />
      )}

      {/* Consent Form */}
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
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <h2>Consent Form</h2>
            <div
              onScroll={handleScroll}
              style={{
                overflowY: "scroll",
                flex: "1 1 auto",
                marginBottom: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "10px",
              }}
            >
              {appConfig.consentText.split("\n").map((line, index) => (
                <p key={index}>{line.trim()}</p>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              I agree to the terms and conditions.
            </label>
            <button
              disabled={!scrolledToBottom || !checkboxChecked}
              onClick={() => {
                setConsentGiven(true);
                setShowOnboarding(true);
              }}
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
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Toggle Controls */}
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
          <h2 style={{ marginTop: 0 }}>Choose Your Route</h2>
          <p>
            Select one of the available routes. If no toggle is enabled, the default route is shown.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            {appConfig.routeNames.map((name, index) => (
              <label key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>{name}</span>
                <div
                  onClick={() =>
                    setSelectedRouteIndex(selectedRouteIndex === index + 1 ? 0 : index + 1)
                  }
                  style={{
                    width: "50px",
                    height: "28px",
                    borderRadius: "14px",
                    backgroundColor: selectedRouteIndex === index + 1 ? "#202124" : "#ccc",
                    position: "relative",
                    cursor: "pointer",
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
                      left: selectedRouteIndex === index + 1 ? "24px" : "2px",
                      transition: "left 0.3s ease",
                    }}
                  />
                </div>
              </label>
            ))}
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
    </div>
  );
};

export default MapRoute;
