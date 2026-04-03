import React, { useState } from "react";
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

export const WebsiteCookie: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState("essential");
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const { scannedData, setScannedData } = useCookieConfig();

  // Load the DB results to the UI whenever the page loads
  React.useEffect(() => {
    // Don't re-fetch from DB while a scan is in progress
    if (isScanning) return;

    const fetchInitialData = async () => {
      // If the global context already supplied the data, sync URL and stop
      if (scannedData) {
        if (!url) setUrl(scannedData.url);
        return;
      }
    };

    fetchInitialData();
  }, [scannedData, setScannedData, isScanning]); // Intentionally excluding `url` to prevent looping.

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
            <button
              className="btn-outline-theme uppercase font-medium text-sm"
              style={{ whiteSpace: "nowrap" }}
            >
              Add a Cookie
            </button>
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
