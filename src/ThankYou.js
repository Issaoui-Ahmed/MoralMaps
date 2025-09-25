"use client";

import React, { useEffect, useState } from "react";
import { withBasePath } from "./utils/basePath";

const ThankYou = () => {
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;


  const [config, setConfig] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

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
      })
      .catch((err) => {
        console.error("Failed to load survey config:", err);
        setError("Failed to load survey questions.");
      });
  }, []);

  const handleChange = (name, value) => {
    setResponses(prev => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelect = (name, option) => {
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


  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-2xl font-semibold text-gray-800">
          Thank you for your feedback!
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">

        {(config.survey || []).map((field) => (
          <div key={field.name} className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {field.name}
            </label>
            {field.type === "select" ? (
              <select
                value={responses[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "multiselect" ? (
              <div className="rounded-md border border-gray-300 px-3 py-2">
                <div className="flex flex-col gap-2">
                  {(field.options || []).length ? (
                    (field.options || []).map((opt) => {
                      const checked = Array.isArray(responses[field.name]) && responses[field.name].includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={checked}
                            onChange={() => toggleMultiSelect(field.name, opt)}
                          />
                          {opt}
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No options configured.</p>
                  )}
                </div>
              </div>
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
    </div>
  );
};

export default ThankYou;
