// src/OnboardingModal.js

import React from "react";

const OnboardingModal = ({ step, onNext, onBack, onSkip, onFinish }) => {
  const steps = [
    {
      title: "Welcome!",
      content: (
        <>
          <p>
            In this short task, you will be shown multiple routes from point A to B. One is{" "}
            <strong>default</strong>, and others have their own features.
          </p>
          <p>Your job is to choose the one you would take today.</p>
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
            Click directly on the route or use the toggle panel to choose the one you prefer.
          </p>
        </>
      ),
    },
    {
      title: "Submit your choice",
      content: (
        <>
          <video
            src="/videos/submit-choice.mp4"
            controls
            style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
          />
          <p>
            When you're ready, click the <strong>✅ Go</strong> button to submit.
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

export default OnboardingModal;
