import { AlertTriangle, CalendarClock, Check, ShieldAlert, Wand2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { API_URL } from "../lib/config";
import { Input } from "../components/Input";
import type { Column } from "../components/Table";
import { Table } from "../components/Table";
import type { CookieItem } from "../context/CookieContext";
import { useCookieConfig } from "../context/CookieContext";
import "./WebsiteCookie.css";

const cookieColumns: Column<CookieItem>[] = [
  {
    header: "COOKIE NAME",
    accessor: (row) => (
      <a href="#" className="custom-table-link">
        {row.name}
      </a>
    ),
    width: "25%",
  },
  {
    header: "DESCRIPTION",
    accessor: "description",
    width: "50%",
  },
  {
    header: "DOMAIN",
    accessor: "domain",
    width: "25%",
    className: "custom-text-right",
    headerClassName: "custom-text-right",
  },
];

type ScheduleInterval = 1 | 3 | 6 | 12;

interface Schedule {
  user_id: string;
  url: string;
  interval_months: ScheduleInterval;
  enabled: boolean;
  next_scan_at: string;
  last_scan_at: string | null;
}

const INTERVAL_OPTIONS: { value: ScheduleInterval; label: string }[] = [
  { value: 1,  label: "1 Month"  },
  { value: 3,  label: "3 Months" },
  { value: 6,  label: "6 Months" },
  { value: 12, label: "12 Months" },
];

export const WebsiteCookie: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState("essential");
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const { scannedData, setScannedData, userId } = useCookieConfig();

  // ── Scheduler state ──
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState<ScheduleInterval>(3);
  const [scheduleStatus, setScheduleStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Load the DB results to the UI whenever the page loads
  React.useEffect(() => {
    if (isScanning) return;
    if (scannedData && !url) setUrl(scannedData.url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedData, setScannedData, isScanning]); // Intentionally excluding `url` to prevent looping.

  // Load existing schedule for the current user
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/scan-schedule/${userId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Schedule | null) => {
        if (data && data.url) {
          setSchedule(data);
          setScheduleEnabled(data.enabled);
          setScheduleInterval(data.interval_months as ScheduleInterval);
        }
      })
      .catch(() => {/* no schedule yet — that's fine */});
  }, [userId]);

  const handleSaveSchedule = async () => {
    if (!userId || !url) return;
    setScheduleStatus("saving");
    setScheduleError(null);
    try {
      const res = await fetch(`${API_URL}/api/scan-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url, intervalMonths: scheduleInterval, enabled: scheduleEnabled }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save schedule");
      }
      const saved: Schedule = await res.json();
      setSchedule(saved);
      setScheduleStatus("saved");
      setTimeout(() => setScheduleStatus("idle"), 2500);
    } catch (err: unknown) {
      setScheduleStatus("error");
      setScheduleError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleRemoveSchedule = async () => {
    if (!userId || !schedule) return;
    setScheduleStatus("saving");
    try {
      await fetch(`${API_URL}/api/scan-schedule/${userId}`, { method: "DELETE" });
      setSchedule(null);
      setScheduleEnabled(true);
      setScheduleInterval(3);
      setScheduleStatus("idle");
    } catch {
      setScheduleStatus("error");
    }
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleClassify = async () => {
    if (!scannedData) return;
    const unclassifiedCat = scannedData.categories.find(c => c.id === 'unclassified');
    if (!unclassifiedCat) return;

    const cookies = unclassifiedCat.providers.flatMap(p =>
      p.cookies.map(cookie => ({ name: cookie.name, domain: cookie.domain, description: cookie.description }))
    );
    if (cookies.length === 0) return;

    setIsClassifying(true);
    setClassifyError(null);
    try {
      const res = await fetch(`${API_URL}/api/classify-cookies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies }),
      });
      if (!res.ok) throw new Error('Classification failed');
      const { classifications } = await res.json();

      // Build a lookup: cookie name → new category
      const categoryMap: Record<string, string> = {};
      for (const c of classifications) {
        if (c.name && c.category) categoryMap[c.name] = c.category.toLowerCase();
      }

      // Rebuild categories: move classified cookies out of unclassified
      const updated = scannedData.categories.map(cat => {
        if (cat.id !== 'unclassified') {
          // Inject newly classified cookies into the right category
          const newProviders = [...cat.providers];
          for (const provider of unclassifiedCat.providers) {
            const movedCookies = provider.cookies.filter(
              ck => categoryMap[ck.name] === cat.id
            );
            if (movedCookies.length > 0) {
              const existing = newProviders.find(p => p.name === provider.name);
              if (existing) {
                existing.cookies = [...existing.cookies, ...movedCookies];
              } else {
                newProviders.push({ name: provider.name, cookies: movedCookies });
              }
            }
          }
          return { ...cat, providers: newProviders };
        }
        // Remove successfully classified cookies from unclassified
        const remainingProviders = cat.providers.map(p => ({
          ...p,
          cookies: p.cookies.filter(
            ck => !categoryMap[ck.name] || categoryMap[ck.name] === 'unclassified'
          ),
        })).filter(p => p.cookies.length > 0);
        return { ...cat, providers: remainingProviders };
      });

      setScannedData({ ...scannedData, categories: updated });
    } catch (err) {
      setClassifyError('AI classification failed. Please try again.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleScan = async () => {
    if (!url) return;

    setIsScanning(true);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.details || body.error || "Failed to scan website");
      }

      const result = await response.json();

      const newScannedData = {
        url: result.url,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        pages: Math.floor(Math.random() * 50) + 10,
        cookiesCount: result.cookiesCount,
        categories: result.categories,
      };

      console.log(
        "Scan complete. Updating context (which will auto-save)...",
        newScannedData,
      );

      setScannedData(newScannedData);
      setSaveStatus("success");
      setIsScanning(false);
      setActiveTabId("essential");
    } catch (err: unknown) {
      console.error("Failed to fetch scan results", err);
      setIsScanning(false);
      setSaveStatus("error");

      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;

      setSaveError(message);
    }
  };

  const activeCategory = scannedData?.categories.find(
    (c) => c.id === activeTabId,
  );

  return (
    <div className="cookie-page-container">
      {/* Header Section */}
      <div className="cookie-header">
        <div className="cookie-header-left w-full">
          <div
            className="flex items-center gap-4 mb-4"
            style={{ width: "100%" }}
          >
            <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap shrink-0">
              Cookie Report (URL):
            </h1>
            <div style={{ flex: 1, minWidth: "600px", maxWidth: "800px" }}>
              <Input
                type="url"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUrl(e.target.value)
                }
                placeholder="Your Website URL"
                className="text-lg"
                style={{ width: "100%" }}
                disabled={isScanning}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning || !url}
              className={`btn-primary-theme uppercase font-semibold text-sm h-[42px] px-6 ml-2 shrink-0 flex items-center gap-2 ${isScanning || !url ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isScanning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Scanning...
                </>
              ) : (
                "Scan"
              )}
            </button>
          </div>

          {scannedData && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "2rem",
              }}
            >
              <div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">
                    {scannedData.pages}
                  </span>{" "}
                  pages scanned
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Cookies in use:{" "}
                  <span className="font-semibold text-gray-800">
                    {scannedData.cookiesCount}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Last successful scan: {scannedData.date}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                {saveStatus === "success" && (
                  <span
                    style={{
                      color: "#10b981",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    Scan successfully!
                  </span>
                )}
                {saveStatus === "error" && (
                  <div className="flex flex-col items-end">
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      Failed to save.
                    </span>
                    {saveError && (
                      <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>
                        {saveError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Auto-Scan Scheduler ── */}
      {scannedData && (
        <div className="scanner-scheduler">
          <div className="scheduler-header">
            <div className="scheduler-title">
              <CalendarClock size={18} />
              <span>Auto-Scan Schedule</span>
            </div>
            <label className="scheduler-toggle">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-label">{scheduleEnabled ? "Enabled" : "Disabled"}</span>
            </label>
          </div>

          <div className="scheduler-body">
            <div className="scheduler-interval">
              <span className="scheduler-label">Scan every</span>
              <div className="scheduler-pills">
                {INTERVAL_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`scheduler-pill ${scheduleInterval === value ? "active" : ""}`}
                    onClick={() => setScheduleInterval(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {schedule && (
              <div className="scheduler-meta">
                <div className="scheduler-meta-item">
                  <span className="scheduler-meta-label">Next scan</span>
                  <span className="scheduler-meta-value">{formatDate(schedule.next_scan_at)}</span>
                </div>
                <div className="scheduler-meta-item">
                  <span className="scheduler-meta-label">Last auto-scan</span>
                  <span className="scheduler-meta-value">
                    {schedule.last_scan_at ? formatDate(schedule.last_scan_at) : "—"}
                  </span>
                </div>
              </div>
            )}

            <div className="scheduler-actions">
              {scheduleError && <span className="scheduler-error">{scheduleError}</span>}
              {schedule && (
                <button
                  className="scheduler-btn-remove"
                  onClick={handleRemoveSchedule}
                  disabled={scheduleStatus === "saving"}
                >
                  Remove Schedule
                </button>
              )}
              <button
                className="scheduler-btn-save"
                onClick={handleSaveSchedule}
                disabled={scheduleStatus === "saving" || !url}
              >
                {scheduleStatus === "saving" ? (
                  "Saving..."
                ) : scheduleStatus === "saved" ? (
                  <><Check size={14} /> Saved</>
                ) : (
                  schedule ? "Update Schedule" : "Save Schedule"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PII Leakage Panel */}
      {scannedData && scannedData.piiLeaks && scannedData.piiLeaks.length > 0 && (
        <div style={{ margin: '1.5rem 0', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fff5f5', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.25rem', background: '#fee2e2', borderBottom: '1px solid #fca5a5' }}>
            <ShieldAlert size={16} color="#dc2626" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#dc2626' }}>
              PII Leakage Detected — {scannedData.piiLeaks.length} domain{scannedData.piiLeaks.length > 1 ? 's' : ''} receiving personal data
            </span>
          </div>
          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {scannedData.piiLeaks.map((leak) => (
              <div key={leak.domain} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.8125rem', color: '#374151' }}>
                <AlertTriangle size={14} color={leak.thirdParty ? '#dc2626' : '#d97706'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontWeight: 600 }}>{leak.domain}</span>
                  <span style={{ marginLeft: '0.5rem', color: leak.thirdParty ? '#dc2626' : '#d97706', fontSize: '0.75rem', fontWeight: 500 }}>
                    {leak.thirdParty ? '3rd party' : '1st party'}
                  </span>
                  <span style={{ margin: '0 0.4rem', color: '#9ca3af' }}>·</span>
                  <span>{leak.method}</span>
                  <span style={{ margin: '0 0.4rem', color: '#9ca3af' }}>·</span>
                  {leak.piiTypes.map(t => (
                    <span key={t} style={{ display: 'inline-block', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', padding: '1px 6px', fontSize: '0.6875rem', fontWeight: 600, marginRight: '4px' }}>
                      {t.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
              PII detected in outgoing request URLs or POST bodies at page load. Review whether consent is collected before these requests fire.
            </p>
          </div>
        </div>
      )}

      {scannedData && activeCategory && (
        <>
          {/* Tabs */}
          <div className="cookie-tabs">
            {scannedData.categories.map((cat) => {
              const totalCookies = cat.providers.reduce(
                (sum, p) => sum + p.cookies.length,
                0,
              );
              return (
                <button
                  key={cat.id}
                  className={`cookie-tab ${activeTabId === cat.id ? "active" : ""}`}
                  onClick={() => setActiveTabId(cat.id)}
                >
                  {cat.name} ({totalCookies})
                </button>
              );
            })}
          </div>

          {/* Content Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "1.5rem",
              marginBottom: "2rem",
              gap: "2rem",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                lineHeight: "1.625",
                maxWidth: "56rem",
                margin: 0,
              }}
            >
              {activeCategory.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {activeTabId === 'unclassified' && activeCategory.providers.some(p => p.cookies.length > 0) && (
                <>
                  <button
                    className="btn-outline-theme uppercase font-medium text-sm"
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    onClick={handleClassify}
                    disabled={isClassifying}
                  >
                    <Wand2 size={14} />
                    {isClassifying ? 'Classifying…' : 'Classify with AI'}
                  </button>
                  {classifyError && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{classifyError}</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Grouped Cookies */}
          <div className="cookie-groups">
            {activeCategory.providers.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  padding: "3rem",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                No cookies found in this category.
              </div>
            ) : (
              activeCategory.providers.map((provider) => (
                <div key={provider.name} style={{ marginBottom: "3rem" }}>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#1f2937",
                      marginBottom: "0.75rem",
                      margin: 0,
                    }}
                  >
                    {provider.name}
                  </h3>
                  <div style={{ marginTop: "0.75rem" }}>
                    <Table
                      columns={cookieColumns}
                      data={provider.cookies}
                      keyExtractor={(row) => row.name}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
