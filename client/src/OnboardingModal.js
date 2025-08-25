// src/OnboardingModal.js

import React, { useState } from "react";

const ExampleToggle = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div
      role="switch"
      aria-checked={enabled}
      onClick={() => setEnabled((prev) => !prev)}
      style={{
        width: "50px",
        height: "28px",
        borderRadius: "14px",
        backgroundColor: enabled ? "#202124" : "#ccc",
        position: "relative",
        margin: "12px auto 0",
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
          left: enabled ? "24px" : "2px",
          transition: "left 0.3s ease",
        }}
      />
    </div>
  );
};

const ExampleButton = () => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={() => setPressed(true)}
      style={{
        padding: "10px 12px",
        backgroundColor: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontWeight: "bold",
        marginTop: "8px",
        cursor: "pointer",
      }}
    >
      {pressed ? "Clicked!" : "✅ Select & Continue"}
    </button>
  );
};

const OnboardingModal = ({ step, onNext, onBack, onSkip, onFinish }) => {
  const steps = [
    {
      title: "Welcome",
      content: (
        <>
          <p style={{ margin: "0 0 12px" }}>
            We'll guide you through a few quick route choices.
          </p>
          <p style={{ margin: 0 }}>
            Each scenario compares a <strong>default</strong> path with an
            alternative. Pick the route you'd take today.
          </p>
        </>
      ),
    },
    {
      title: "Compare routes",
      content: (
        <>
          <h3 style={{ margin: "0 0 12px", fontSize: "1rem" }}>
            Use this switch in the panel to preview the alternative route before
            deciding:
          </h3>
          <ExampleToggle />
        </>
      ),
    },
    {
      title: "Submit your choice",
      content: (
        <>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: "1rem",
              color: "#1452EE",
              fontWeight: 500,
            }}
          >
            When you're ready, press the button below:
          </h3>
          <ExampleButton />
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
        color: "#333",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          maxWidth: "480px",
          width: "100%",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "16px",
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          {steps[step].title}
        </h2>
        <div style={{ marginBottom: "24px", lineHeight: 1.6, fontSize: "1rem" }}>
          {steps[step].content}
        </div>

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
            Skip
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

export default OnboardingModal;
