import React, { useEffect, useState } from "react";

const API_URL = "/api/route-endpoints";

export default function TextsEditor() {
  const [consentText, setConsentText] = useState("");
  const [scenarioText, setScenarioText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(API_URL, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load config (${r.status})`);
        return r.json();
      })
      .then((data) => {
        setConsentText(data.consentText || "");
        const st = data.scenarioText || { line1: "", line2: "", line3: "" };
        setScenarioText([st.line1, st.line2, st.line3].filter(Boolean).join("\n"));
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const lines = scenarioText.split("\n");
      const scenarioObj = {
        line1: lines[0] || "",
        line2: lines[1] || "",
        line3: lines[2] || "",
      };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ consentText, scenarioText: scenarioObj }),
      });
      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setLoading(true);
    fetch(API_URL, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setConsentText(data.consentText || "");
        const st = data.scenarioText || { line1: "", line2: "", line3: "" };
        setScenarioText([st.line1, st.line2, st.line3].filter(Boolean).join("\n"));
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {error && (
        <div className="border rounded-xl p-3 text-sm bg-red-50 border-red-200 text-red-800">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Consent text</label>
        <textarea
          value={consentText}
          onChange={(e) => setConsentText(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm h-48"
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-1">Scenario text</h2>
        <textarea
          value={scenarioText}
          onChange={(e) => setScenarioText(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm h-32"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={discard} className="px-3 py-1.5 border rounded-xl">Discard</button>
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 rounded-xl text-white bg-indigo-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

