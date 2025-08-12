import React from "react";

const ScenarioPanel = ({
  scenarioIndex,
  totalScenarios,
  label,
  description,
  selectedLabel,
  onToggle,
  onSubmit,
}) => {
  return (
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
      <h2 style={{ marginTop: 0 }}>Scenario {scenarioIndex + 1} of {totalScenarios}</h2>
      <p>Select a route to proceed.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span>{label}</span>
          {description && (
            <span style={{ fontSize: "13px", color: "#666" }}>{description}</span>
          )}
          <div
            onClick={onToggle}
            style={{
              width: "50px",
              height: "28px",
              borderRadius: "14px",
              backgroundColor: selectedLabel === label ? "#202124" : "#ccc",
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
                left: selectedLabel === label ? "24px" : "2px",
                transition: "left 0.3s ease",
              }}
            />
          </div>
        </label>
        <button
          onClick={onSubmit}
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
          ✅ Select & Continue
        </button>
      </div>
    </div>
  );
};

export default ScenarioPanel;
