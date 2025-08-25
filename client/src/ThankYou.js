import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ThankYou = () => {
  const location = useLocation();
const sessionIdFromState = location.state?.sessionId;
const sessionId = sessionIdFromState || localStorage.getItem("sessionId");


  const [config, setConfig] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/route-endpoints")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        const initial = {};
        (data.survey || []).forEach(field => {
          initial[field.name] = "";
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

  const handleSubmit = async () => {
  setError(null);
  try {
    const res = await fetch("http://localhost:5000/api/log-survey", {
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
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px", fontFamily: "sans-serif", color: "#333" }}>
        Thank you for your feedback!
      </div>
    );
  }

  if (!config) {
    return <div style={{ padding: "40px", fontFamily: "sans-serif" }}>Loading survey...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif", padding: "40px 20px", backgroundColor: "#f9f9f9" }}>
      <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxWidth: "500px", width: "100%" }}>
        <h2 style={{ marginTop: 0 }}>Final Survey</h2>

        {(config.survey || []).map(field => (
          <div key={field.name} style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>{field.name}:</label>
            {field.type === "select" ? (
              <select
                value={responses[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
              >
                <option value="" disabled>Select an option</option>
                {(field.options || []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={responses[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
            )}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          style={{ padding: "10px 16px", backgroundColor: "#1452EE", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", width: "100%" }}
        >
          Submit
        </button>

        {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
      </div>
    </div>
  );
};

export default ThankYou;
