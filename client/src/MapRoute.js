"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import Routing from "./Routing";
import RoutingLabels from "./RoutingLabels";
import OnboardingModal from "./OnboardingModal";
import ConsentModal from "./ConsentModal";
import ScenarioPanel from "./ScenarioPanel";
import ProgressBar from "./ProgressBar";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

const MapRoute = () => {
  const [routeConfig, setRouteConfig] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [mapPoints, setMapPoints] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState("default");
  const [error, setError] = useState(null);
  const [sessionId] = useState(uuidv4());
  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
  }, [sessionId]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/route-endpoints")
      .then((res) => res.json())
      .then((data) => {
        setRouteConfig(data);
        setScenarios(
          (data.scenarios || []).map((sc) => {
            const pre = sc.choice_list.find((c) => c.preselected) || sc.choice_list[0];
            const tts = pre?.tts ?? 0;
            return {
              label: sc.value_name,
              description: sc.description,
              start: sc.start,
              end: sc.end,
              middle: pre?.middle_point,
              tts,
              defaultTime: sc.default_route_time,
              totalTimeMinutes: sc.default_route_time + tts,
            };
          })
        );
      })
      .catch((err) => {
        console.error("Failed to load route config:", err);
        setError("Failed to load route configuration. Please try again later.");
      });
  }, []);

  const handleChoice = async (label) => {
    const scenario = scenarios[scenarioIndex];
    const defaultTime = scenario.defaultTime;

    try {
      await fetch("/api/log-choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          scenarioIndex,
          choice: label,
          tts: scenario.tts,
          defaultTime,
        }),
      });

      if (scenarioIndex + 1 >= scenarios.length) {
        router.push("/thank-you");
      } else {
        setScenarioIndex((prev) => prev + 1);
        setSelectedLabel("default");
      }
    } catch (err) {
      console.error("Error sending choice:", err);
      alert("Failed to log choice. Please try again.");
    }
  };

  const { consentText, scenarioText, instructions } = routeConfig || {};
  const currentScenario = scenarios[scenarioIndex];
  const defaultTime = currentScenario?.defaultTime;
  const bounds = useMemo(() => {
    if (!currentScenario) return null;
    const pts = [currentScenario.start, currentScenario.end];
    if (currentScenario.middle) pts.push(currentScenario.middle);
    return L.latLngBounds(pts);
  }, [currentScenario]);

  if (error) return <div>{error}</div>;
  if (!routeConfig || scenarios.length === 0 || !bounds)
    return <div>Loading route data...</div>;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {consentGiven && !showOnboarding && (
        <ProgressBar currentStep={scenarioIndex} totalSteps={scenarios.length} />
      )}
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [50, 50], maxZoom: 15 }}
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
        <Routing
          from={currentScenario.start}
          to={currentScenario.end}
          middle={currentScenario.middle}
          totalTimeMinutes={currentScenario.totalTimeMinutes}
          defaultTimeMinutes={defaultTime}
          selectedLabel={selectedLabel}
          setSelectedLabel={setSelectedLabel}
          consentGiven={consentGiven}
          setMapPoints={setMapPoints}
          setRoutes={setRoutes}
          scenarioLabel={currentScenario.label}
        />
      </MapContainer>

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

      {!consentGiven && (
        <ConsentModal
          consentText={consentText}
          checkboxChecked={checkboxChecked}
          setCheckboxChecked={setCheckboxChecked}
          onSubmit={() => {
            setConsentGiven(true);
            setShowOnboarding(true);
          }}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          step={onboardingStep}
          instructions={instructions}
          onNext={() => setOnboardingStep((prev) => prev + 1)}
          onBack={() => setOnboardingStep((prev) => prev - 1)}
          onSkip={() => {
            setShowOnboarding(false);
            setOnboardingStep(0);
          }}
          onFinish={() => {
            setShowOnboarding(false);
            setOnboardingStep(0);
          }}
        />
      )}

      {consentGiven && !showOnboarding && (
        <ScenarioPanel
          label={currentScenario.label}
          description={currentScenario.description}
          selectedLabel={selectedLabel}
          onToggle={() =>
            setSelectedLabel(
              selectedLabel === currentScenario.label ? "default" : currentScenario.label
            )
          }
          onSubmit={() => handleChoice(selectedLabel)}
          scenarioNumber={scenarioIndex + 1}
          totalScenarios={scenarios.length}
          defaultTime={defaultTime}
          alternativeTime={currentScenario.totalTimeMinutes}
          scenarioText={scenarioText}
        />
      )}
    </div>
  );
};

export default MapRoute;
