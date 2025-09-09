import React, { useEffect, useState } from "react";

const API_URL = "/api/route-endpoints";

export default function TextsEditor() {
  const [consentText, setConsentText] = useState("");
  const [scenarioText, setScenarioText] = useState({ line1: "", line2: "", line3: "" });
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
        setScenarioText(data.scenarioText || { line1: "", line2: "", line3: "" });
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ consentText, scenarioText }),
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
        setScenarioText(data.scenarioText || { line1: "", line2: "", line3: "" });
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
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Scenario text</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Line 1</label>
          <input
            type="text"
            value={scenarioText.line1 || ""}
            onChange={(e) => setScenarioText((s) => ({ ...s, line1: e.target.value }))}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Line 2</label>
          <input
            type="text"
            value={scenarioText.line2 || ""}
            onChange={(e) => setScenarioText((s) => ({ ...s, line2: e.target.value }))}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Line 3</label>
          <input
            type="text"
            value={scenarioText.line3 || ""}
            onChange={(e) => setScenarioText((s) => ({ ...s, line3: e.target.value }))}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
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

