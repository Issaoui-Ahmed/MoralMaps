"use client";

import React, { useEffect, useState, useMemo, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RoutesEditor from "./RoutesEditor";
import SurveyEditor from "./SurveyEditor";

// ---- Config context
const ConfigContext = createContext(null);
export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within <AdminApp>");
  return ctx;
};

const API_URL = "http://localhost:5000/api/route-endpoints";

export default function AdminApp() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Load on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Warn on unload if dirty
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = ""; // required for Chrome
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Failed to load config (${res.status})`);
      const data = await res.json();
      setConfig(data);
      setError("");
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setError("");
    try {
      // Send only the fields that the admin UI is allowed to modify
      const { start, end, routes, numberOfScenarios } = config || {};
      const payload = {};
      if (start !== undefined) payload.start = start;
      if (end !== undefined) payload.end = end;
      if (routes !== undefined) payload.routes = routes;
      if (numberOfScenarios !== undefined)
        payload.numberOfScenarios = numberOfScenarios;

      const res = await fetch(API_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
      // Re-fetch to confirm what the server persisted
      await fetchConfig();
      setDirty(false);
      setLastSavedAt(new Date());
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const discard = async () => {
    await fetchConfig();
    setDirty(false);
  };

  const ctxValue = useMemo(() => ({ config, setConfig, setDirty }), [config]);
  const router = useRouter();
  const pathname = usePathname();
  const section = pathname.split("/").pop();

  useEffect(() => {
    if (!section || (section !== "routes" && section !== "survey")) {
      router.replace("/admin/routes");
    }
  }, [section, router]);

  const linkClass = (slug) =>
    `px-2 py-1 rounded ${section === slug ? "bg-white border" : "hover:underline"}`;

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading…</div>;

  return (
    <ConfigContext.Provider value={ctxValue}>
      <header className="flex items-center justify-between p-4 border-b bg-gray-50">
        <nav className="flex gap-4">
          <Link href="/admin/routes" className={linkClass("routes")}>Routes</Link>
          <Link href="/admin/survey" className={linkClass("survey")}>Survey</Link>
        </nav>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Unsaved changes</span>}
          {lastSavedAt && !dirty && (
            <span className="text-xs text-gray-500">Last saved: {lastSavedAt.toLocaleString()}</span>
          )}
          <button onClick={discard} className="border px-3 py-1 rounded">Discard</button>
          <button onClick={save} disabled={!dirty || saving} className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>
      {error && (
        <div className="m-4 border rounded p-3 text-sm bg-red-50 border-red-200 text-red-800">{error}</div>
      )}
      <main className="p-4">
        {section === "routes" && <RoutesEditor />}
        {section === "survey" && <SurveyEditor />}
      </main>
    </ConfigContext.Provider>
  );
}
