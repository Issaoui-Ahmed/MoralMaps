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
import { buildScenarios } from "./utils/buildScenarios";
import { withBasePath } from "./utils/basePath";

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
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0); // 0 = default
  const [activeAlternativeIndex, setActiveAlternativeIndex] = useState(0);
  const [error, setError] = useState(null);
  const [sessionId] = useState(uuidv4());
  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
  }, [sessionId]);
  const router = useRouter();

  useEffect(() => {
    const scenario = scenarios[scenarioIndex];
    if (!scenario || !Array.isArray(scenario.alternatives)) return;

    const cappedIndex = Math.min(
      Math.max(scenario.preselectedIndex ?? 0, 0),
      Math.max(scenario.alternatives.length - 1, 0)
    );
    setActiveAlternativeIndex(cappedIndex);
  }, [scenarios, scenarioIndex]);

  useEffect(() => {
    fetch(withBasePath("/api/route-endpoints"))
      .then((res) => res.json())
      .then((data) => {
        setRouteConfig(data);
        const builtScenarios = Array.isArray(data.scenarios)
          ? data.scenarios
          : buildScenarios({ scenarios: data.scenarios, settings: data.settings });
        setScenarios(
          builtScenarios.map((sc) => {
            const defaultTime = sc.default_route_time;
            const alternatives = (sc.choice_list || []).map((c) => {
              const rawTts = c?.tts;
              const tts =
                typeof rawTts === "number"
                  ? rawTts
                  : Array.isArray(rawTts)
                  ? rawTts[0] ?? 0
                  : 0;
              const labelCandidate = c?.value_name;
              const label =
                typeof labelCandidate === "string" && labelCandidate.trim() !== ""
                  ? labelCandidate
                  : sc.scenario_name;
              const description =
                typeof c?.description === "string"
                  ? c.description
                  : Array.isArray(c?.description)
                  ? c.description[0] ?? ""
                  : "";
              return {
                middle: c.middle_point,
                tts,
                totalTimeMinutes: defaultTime + tts,
                preselected: c.preselected,
                label,
                description,
              };
            });
            const preIdx = Math.max(
              0,
              alternatives.findIndex((c) => c.preselected)
            );
            return {
              scenarioName: sc.scenario_name,
              start: sc.start,
              end: sc.end,
              defaultTime,
              alternatives,
              preselectedIndex: preIdx,
            };
          })
        );
      })
      .catch((err) => {
        console.error("Failed to load route config:", err);
        setError("Failed to load route configuration. Please try again later.");
      });
  }, []);

  const handleChoice = async () => {
    const scenario = scenarios[scenarioIndex];
    const defaultTime = scenario.defaultTime;
    const tts =
      selectedRouteIndex === 0
        ? 0
        : scenario.alternatives[selectedRouteIndex - 1]?.tts ?? 0;

    try {
      await fetch(withBasePath("/api/log-choice"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          scenarioIndex,
          choice: selectedLabel,
          tts,
          defaultTime,
        }),
      });

      if (scenarioIndex + 1 >= scenarios.length) {
        router.push("/thank-you");
      } else {
        setScenarioIndex((prev) => prev + 1);
        setSelectedLabel("default");
        setSelectedRouteIndex(0);
      }
    } catch (err) {
      console.error("Error sending choice:", err);
      alert("Failed to log choice. Please try again.");
    }
  };

  const { consentText, scenarioText, instructions } = routeConfig || {};
  const currentScenario = scenarios[scenarioIndex];
  const defaultTime = currentScenario?.defaultTime;
  const activeAlternative =
    currentScenario && Array.isArray(currentScenario.alternatives)
      ? currentScenario.alternatives[
          Math.min(
            Math.max(activeAlternativeIndex, 0),
            currentScenario.alternatives.length - 1
          )
        ] ?? null
      : null;
  const panelLabel =
    activeAlternative?.label || currentScenario?.scenarioName || "Alternative";
  const panelDescription = activeAlternative?.description || "";
  const bounds = useMemo(() => {
    if (!currentScenario) return null;
    const pts = [currentScenario.start, currentScenario.end];
    currentScenario.alternatives.forEach((alt) => {
      if (alt.middle) pts.push(alt.middle);
    });
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
          alternatives={currentScenario.alternatives}
          defaultTimeMinutes={defaultTime}
          selectedIndex={selectedRouteIndex}
          setSelectedIndex={(i) => {
            setSelectedRouteIndex(i);
            if (i === 0) {
              setSelectedLabel("default");
            } else {
              const alt = currentScenario.alternatives[i - 1];
              setActiveAlternativeIndex(i - 1);
              setSelectedLabel(alt?.label || "alternative");
            }
          }}
          consentGiven={consentGiven}
          setMapPoints={setMapPoints}
          setRoutes={setRoutes}
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
          label={panelLabel}
          description={panelDescription}
          isSelected={selectedRouteIndex !== 0}
          onToggle={() => {
            if (selectedRouteIndex !== 0) {
              setSelectedLabel("default");
              setSelectedRouteIndex(0);
            } else {
              const alternatives = currentScenario.alternatives || [];
              if (!alternatives.length) return;
              const desiredIndex = Math.min(
                Math.max(activeAlternativeIndex, 0),
                alternatives.length - 1
              );
              const alt = alternatives[desiredIndex];
              setSelectedLabel(alt?.label || "alternative");
              setSelectedRouteIndex(desiredIndex + 1);
            }
          }}
          onSubmit={handleChoice}
          scenarioNumber={scenarioIndex + 1}
          totalScenarios={scenarios.length}
          defaultTime={defaultTime}
          alternativeTime={
            activeAlternative?.totalTimeMinutes ?? defaultTime
          }
          scenarioText={scenarioText}
          alternatives={currentScenario.alternatives}
          activeAlternativeIndex={activeAlternativeIndex}
        />
      )}
    </div>
  );
};

export default MapRoute;
