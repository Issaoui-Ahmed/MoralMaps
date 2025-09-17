import React, { useEffect, useState } from "react";
import { withBasePath } from "../utils/basePath";

const API_URL = withBasePath("/api/route-endpoints");

const emptyStep = () => ({ title: "", lines: [""], example: "" });

export default function InstructionsEditor() {
  const [steps, setSteps] = useState([]);
  const [selected, setSelected] = useState(0);
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
        setSteps(Array.isArray(data.instructions) ? data.instructions : []);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStepChange = (idx, patch) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const handleLineChange = (idx, value) => {
    handleStepChange(idx, { lines: value.split("\n") });
  };

  const addStep = () => {
    setSteps((prev) => [...prev, emptyStep()]);
    setSelected(steps.length);
  };

  const deleteStep = (idx) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
    setSelected((s) => (s > idx ? s - 1 : Math.max(0, s - (s === idx ? 1 : 0))));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ instructions: steps }),
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
      .then((data) => setSteps(Array.isArray(data.instructions) ? data.instructions : []))
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading…</div>;

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      <div className="w-64 shrink-0 border rounded-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold">Steps</h2>
          <button onClick={addStep} className="text-sm px-2 py-1 rounded-lg border">Add</button>
        </div>
        <div className="flex-1 overflow-auto">
          {steps.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No steps yet.</div>
          ) : (
            <ul className="divide-y">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className={`px-3 py-2 cursor-pointer ${selected === i ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                  onClick={() => setSelected(i)}
                >
                  <div className="truncate text-sm font-medium">{s.title || `Step ${i + 1}`}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {error && (
          <div className="border rounded-xl p-3 text-sm bg-red-50 border-red-200 text-red-800">{error}</div>
        )}
        {steps[selected] ? (
          <div className="flex-1 overflow-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={steps[selected].title}
                onChange={(e) => handleStepChange(selected, { title: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lines</label>
              <textarea
                value={(steps[selected].lines || []).join("\n")}
                onChange={(e) => handleLineChange(selected, e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Example (optional)</label>
              <input
                type="text"
                value={steps[selected].example || ""}
                onChange={(e) => handleStepChange(selected, { example: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <button
              onClick={() => deleteStep(selected)}
              className="text-sm px-3 py-1 border rounded-lg text-red-600"
            >
              Delete step
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No step selected.</div>
        )}
        <div className="flex justify-end gap-2">
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
    </div>
  );
}

