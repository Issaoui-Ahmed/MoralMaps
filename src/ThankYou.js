"use client";

import React, { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";
import { withBasePath } from "./utils/basePath";

const computeScenarioCount = (cfg) => {
  if (!cfg) return 0;
  if (Array.isArray(cfg.scenarios)) {
    return cfg.scenarios.length;
  }

  if (cfg.scenarios && typeof cfg.scenarios === "object") {
    const total = Object.keys(cfg.scenarios).length;
    const desired =
      typeof cfg?.settings?.number_of_scenarios === "number"
        ? cfg.settings.number_of_scenarios
        : total;
    return Math.min(desired, total);
  }

  return 0;
};

const ThankYou = () => {
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

  const [config, setConfig] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [totalSteps, setTotalSteps] = useState(1);

  useEffect(() => {
    fetch(withBasePath("/api/route-endpoints"))
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        const initial = {};
        (data.survey || []).forEach(field => {
          initial[field.name] = field.type === "multiselect" ? [] : "";
        });
        setResponses(initial);
        const count = computeScenarioCount(data);
        setTotalSteps(Math.max(1, count + 1));
      })
      .catch((err) => {
        console.error("Failed to load survey config:", err);
        setError("Failed to load survey questions.");
      });
  }, []);

  const handleChange = (name, value) => {
    setResponses(prev => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelectValue = (name, option) => {
    setResponses(prev => {
      const current = Array.isArray(prev[name]) ? prev[name] : [];
      const next = current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option];
      return { ...prev, [name]: next };
    });
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const res = await fetch(withBasePath("/api/log-survey"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, responses }),
      });

      const payloadText = await res.text();
      const payload = (() => { try { return JSON.parse(payloadText); } catch { return {}; } })();

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not submit survey. Please try again.");
    }
  };


  const currentStep = Math.max(totalSteps - 1, 0);

  if (submitted) {
    return (
      <div className="relative min-h-screen w-full bg-gray-50">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="flex min-h-screen items-center justify-center p-4">
          <p className="text-2xl font-semibold text-gray-800">
            Thank you for your feedback!
          </p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="relative min-h-screen w-full bg-gray-50">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-50">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex w-full max-w-lg flex-col rounded-lg bg-white p-8 shadow-lg">
          <div className="flex-1 overflow-y-auto pr-1">
            {(config.survey || []).map((field) => (
              <div key={field.name} className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {field.name}
              </label>
              {field.type === "select" ? (
                (field.options || []).length ? (
                  <select
                    value={responses[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {(field.options || []).map((opt, idx) => (
                      <option key={`${field.name}-${idx}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500">No options available.</p>
                )
              ) : field.type === "multiselect" ? (
                (field.options || []).length ? (
                  <div className="space-y-2">
                    {(field.options || []).map((opt, idx) => {
                      const selectedValues = Array.isArray(responses[field.name]) ? responses[field.name] : [];
                      const checked = selectedValues.includes(opt);
                      return (
                        <label key={`${field.name}-${idx}`} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMultiSelectValue(field.name, opt)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No options available.</p>
                )
              ) : (
                <input
                  type={field.type}
                  value={responses[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-center">
            <img
              src="/branding/craiedl_logo.png"
              alt="Craiedl logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
