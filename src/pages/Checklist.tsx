import {
  AlertTriangle,
  Check,
  CheckCircle,
  Code,
  Copy,
  Loader2,
  Settings,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookieConfig } from "../context/CookieContext";
import { API_URL, APP_URL } from "../lib/config";
import { supabase } from "../lib/supabase";
import "./Checklist.css";

interface GCMCheck {
  id: string;
  label: string;
  description: string;
  pass: boolean | null;
  required: boolean;
}

interface GCMResult {
  url: string;
  scannedAt: string;
  status: "compliant" | "partial" | "non_compliant" | "not_applicable";
  passCount: number;
  totalChecks: number;
  checks: GCMCheck[];
}


interface ChecklistItemProps {
  step: number;
  title: string;
  description: React.ReactNode;
  metadata?: string;
  status: "done" | "action";
  actionIcon?: "settings" | "code" | "copy";
  actionLabel?: string;
  onActionClick?: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  step,
  title,
  description,
  metadata,
  status,
  actionIcon,
  actionLabel,
  onActionClick,
}) => {
  return (
    <div className="checklist-item">
      <div className="checklist-content">
        <h3 className="checklist-title">
          Step {step}: {title}
        </h3>
        <div className="checklist-description">{description}</div>
        {metadata && <div className="checklist-metadata">{metadata}</div>}
      </div>
      <div className="checklist-action-container">
        {status === "done" ? (
          <div className="checklist-status-done">
            <Check size={18} strokeWidth={3} />
            <span>DONE</span>
          </div>
        ) : (
          <button className="checklist-button" onClick={onActionClick}>
            {actionIcon === "settings" && <Settings size={18} />}
            {actionIcon === "code" && <Code size={18} />}
            {actionIcon === "copy" && <Copy size={18} />}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const Checklist: React.FC = () => {
  const navigate = useNavigate();
  const { scannedData, bannerConfig, userId } = useCookieConfig();
  const [copied, setCopied] = useState(false);
  const [copiedPref, setCopiedPref] = useState(false);
  const hasScan = !!scannedData;

  const [gcmUrl, setGcmUrl] = useState("");
  const [gcmScanning, setGcmScanning] = useState(false);
  const [gcmResult, setGcmResult] = useState<GCMResult | null>(null);
  const [gcmError, setGcmError] = useState<string | null>(null);

  useEffect(() => {
    if (!gcmUrl && scannedData?.url) {
      setGcmUrl(scannedData.url);
    }
  }, [scannedData]);

  useEffect(() => {
    if (!userId) return;
    const loadGcmResult = async () => {
      const { data } = await supabase
        .from("gcm_scan_results")
        .select("url, status, pass_count, total_checks, checks, scanned_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        const result: GCMResult = {
          url: data.url,
          status: data.status,
          passCount: data.pass_count,
          totalChecks: data.total_checks,
          checks: data.checks,
          scannedAt: data.scanned_at,
        };
        setGcmResult(result);
        setGcmUrl(data.url);
      }
    };
    loadGcmResult();
  }, [userId]);

  const handleGcmScan = async () => {
    if (!gcmUrl.trim()) return;
    setGcmScanning(true);
    setGcmError(null);
    try {
      const response = await fetch(`${API_URL}/api/gcm-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: gcmUrl.trim() }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Backend returned ${response.status} (non-JSON). Restart the server: node server/index.js`,
        );
      }
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.details || data.error || "Scan failed");
      setGcmResult(data);
      if (userId) {
        await supabase.from("gcm_scan_results").upsert(
          {
            user_id: userId,
            url: data.url,
            status: data.status,
            pass_count: data.passCount,
            total_checks: data.totalChecks,
            checks: data.checks,
            scanned_at: data.scannedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setGcmError(
          `Cannot reach backend at ${API_URL}. Make sure the server is running: node server/index.js`,
        );
      } else {
        setGcmError(err.message || "Failed to scan");
      }
    } finally {
      setGcmScanning(false);
    }
  };

  const handleCopy = () => {
    const scriptText = `<script src="${APP_URL}/uterms-embed.js?id=${userId || "YOUR_USER_ID"}&mode=auto&api=${API_URL}"></script>`;
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPref = () => {
    const prefText = `<a href="#" class="uterms-preferences">Consent Preferences</a>`;
    navigator.clipboard.writeText(prefText);
    setCopiedPref(true);
    setTimeout(() => setCopiedPref(false), 2000);
  };

  return (
    <div className="checklist-page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
          Cookie Consent Setup
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
          Follow these steps to make your website compliant with GDPR, CCPA, and Google Consent Mode v2.
          Complete each step in order — scanning your website first unlocks the embed snippets below.
        </p>
      </div>
      <div className="checklist-container">
        <ChecklistItem
          step={1}
          title="Scan your website"
          description={
            hasScan ? (
              <div className="checklist-status-row">
                <span className="status-badge success">
                  <Check size={14} />
                </span>
                <span>{scannedData.pages} pages scanned</span>
              </div>
            ) : (
              "To get started, scan your website to your account."
            )
          }
          metadata={
            hasScan ? `Last successful scan: ${scannedData.date}` : undefined
          }
          status={hasScan ? "done" : "action"}
          actionIcon="settings"
          actionLabel="SCAN NOW"
          onActionClick={() => navigate("/consent-management/scanner")}
        />

        <ChecklistItem
          step={2}
          title="Configure Cookie Banner"
          description={
            bannerConfig.isConfigured ? (
              <div className="checklist-status-row">
                <span className="status-badge success">
                  <Check size={14} />
                </span>
                <span>Banner configured</span>
                <button
                  className="checklist-link border-none bg-transparent cursor-pointer p-0"
                  onClick={() =>
                    navigate("/consent-management/banner-settings")
                  }
                >
                  Edit settings
                </button>
              </div>
            ) : (
              "Customize your cookie banner from default settings to match your website's branding and user experience."
            )
          }
          status={bannerConfig.isConfigured ? "done" : "action"}
          actionIcon="settings"
          actionLabel="CUSTOMIZE"
          onActionClick={() => navigate("/consent-management/banner-settings")}
        />

        <ChecklistItem
          step={3}
          title="Embed Cookie Banner"
          description={
            hasScan ? (
              <>
                <p style={{ margin: "0 0 0.75rem 0" }}>
                  Paste this snippet into every page of your website, just before the closing{" "}
                  <code>&lt;/body&gt;</code> tag. The banner will appear automatically on first visit.
                </p>
                <div className="checklist-code-snippet">
                  <div className="code-snippet-header">
                    <span className="code-snippet-title">CODE SNIPPET</span>
                  </div>
                  <div className="code-snippet-content">
                    {`<script src="${APP_URL}/uterms-embed.js?id=${userId || "YOUR_USER_ID"}&mode=auto&api=${API_URL}"></script>`}
                  </div>
                </div>
                <p style={{ margin: "0.75rem 0 0.25rem 0", fontSize: "0.85rem", color: "#6b7280" }}>
                  <strong style={{ color: "#374151" }}>mode=auto</strong> — automatically blocks third-party scripts (analytics, marketing) until the visitor gives consent. To opt a script into blocking, replace its{" "}
                  <code>src</code> with <code>data-src</code> and add a <code>data-category</code>:
                </p>
                <div className="checklist-code-snippet">
                  <div className="code-snippet-header">
                    <span className="code-snippet-title">EXAMPLE — BLOCKING A SCRIPT</span>
                  </div>
                  <div className="code-snippet-content">{`<!-- Before -->\n<script src="https://www.googletagmanager.com/gtag/js"></script>\n\n<!-- After (blocked until visitor consents to analytics) -->\n<script data-src="https://www.googletagmanager.com/gtag/js" data-category="analytics"></script>`}</div>
                </div>

                <p style={{ margin: "1rem 0 0.25rem 0", fontSize: "0.85rem", color: "#6b7280" }}>
                  <strong style={{ color: "#374151" }}>Multi-language</strong> — the banner automatically detects each visitor's browser language. To force a specific language, add <code>lang=</code> to the script URL:
                </p>
                <div className="checklist-code-snippet">
                  <div className="code-snippet-header">
                    <span className="code-snippet-title">EXAMPLE — FORCE A LANGUAGE</span>
                  </div>
                  <div className="code-snippet-content">{`<script src="${APP_URL}/uterms-embed.js?id=${userId || "YOUR_USER_ID"}&mode=auto&api=${API_URL}&lang=zh-TW"></script>`}</div>
                </div>
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#9ca3af", lineHeight: 1.6 }}>
                  Supported languages:{" "}
                  {[
                    ["en", "English"],
                    ["zh-CN", "简体中文"],
                    ["zh-TW", "繁體中文"],
                    ["fr", "Français"],
                    ["de", "Deutsch"],
                    ["es", "Español"],
                    ["pt-BR", "Português (BR)"],
                    ["ja", "日本語"],
                    ["ms", "Bahasa Melayu"],
                  ].map(([code, label], i, arr) => (
                    <span key={code}>
                      <code>{code}</code> {label}{i < arr.length - 1 ? " · " : ""}
                    </span>
                  ))}
                </p>
              </>
            ) : (
              "Generate an embedded script to install the consent banner on your website. Please scan your website first."
            )
          }
          status="action"
          actionIcon={hasScan ? "copy" : "settings"}
          actionLabel={hasScan ? (copied ? "COPIED" : "COPY") : "SCAN"}
          onActionClick={
            hasScan ? handleCopy : () => navigate("/consent-management/scanner")
          }
        />

        <ChecklistItem
          step={4}
          title="Embed Consent Preference"
          description={
            hasScan ? (
              <>
                <div>
                  Allow visitors to change their consent preference anytime.
                </div>
                <div className="checklist-code-snippet mt-4">
                  <div className="code-snippet-header">
                    <span className="code-snippet-title">CODE SNIPPET</span>
                  </div>
                  <div className="code-snippet-content">
                    {`<a href="#" class="uterms-preferences">Consent Preferences</a>`}
                  </div>
                </div>
              </>
            ) : (
              "Allow visitors to change their consent preference anytime. Please scan your website first."
            )
          }
          status="action"
          actionIcon={hasScan ? "copy" : "settings"}
          actionLabel={hasScan ? (copiedPref ? "COPIED" : "COPY") : "SCAN"}
          onActionClick={
            hasScan
              ? handleCopyPref
              : () => navigate("/consent-management/scanner")
          }
        />

        {/* Step 5: GCM Compliance */}
        <div className="checklist-item">
          <div className="checklist-content">
            <h3 className="checklist-title">
              Step 5: Scan your website for GCM compliance
            </h3>
            <div className="checklist-description">
              Google Consent Mode v2 (GCM v2) is required by Google for all
              advertisers using Google Ads or Analytics. Enter your website URL
              to check compliance.
            </div>

            <div className="gcm-input-row">
              <input
                className="gcm-url-input"
                type="url"
                placeholder="https://yourwebsite.com"
                value={gcmUrl}
                onChange={(e) => setGcmUrl(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !gcmScanning && handleGcmScan()
                }
                disabled={gcmScanning}
              />
            </div>

            {gcmError && <p className="gcm-error">{gcmError}</p>}

            {gcmResult && !gcmScanning && (
              <div className="gcm-results">
                <div className="gcm-checks">
                  {gcmResult.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`gcm-check-item ${check.pass === true ? "pass" : check.pass === false ? "fail" : "unknown"}`}
                    >
                      <span className="gcm-check-icon">
                        {check.pass === true ? (
                          <CheckCircle size={15} />
                        ) : check.pass === false ? (
                          <XCircle size={15} />
                        ) : (
                          <AlertTriangle size={15} />
                        )}
                      </span>
                      <div className="gcm-check-text">
                        <span className="gcm-check-label">{check.label}</span>
                        <span className="gcm-check-desc">
                          {check.description}
                        </span>
                      </div>
                      {!check.required && (
                        <span className="gcm-optional-badge">optional</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="gcm-scan-meta">
                  Last scanned: <strong>{gcmResult.url}</strong> —{" "}
                  {new Date(gcmResult.scannedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="checklist-action-container">
            {gcmScanning ? (
              <div className="gcm-status-badge gcm-status-scanning">
                <Loader2 size={16} className="gcm-spin" />
                <span>SCANNING</span>
              </div>
            ) : gcmResult ? (
              <div className="gcm-action-col">
                <div
                  className={`gcm-status-badge gcm-status-${gcmResult.status}`}
                >
                  {gcmResult.status === "compliant" && (
                    <>
                      <Check size={16} />
                      <span>COMPLIANT</span>
                    </>
                  )}
                  {gcmResult.status === "partial" && (
                    <>
                      <AlertTriangle size={16} />
                      <span>PARTIAL</span>
                    </>
                  )}
                  {gcmResult.status === "non_compliant" && (
                    <>
                      <XCircle size={16} />
                      <span>NOT COMPLIANT</span>
                    </>
                  )}
                  {gcmResult.status === "not_applicable" && (
                    <>
                      <AlertTriangle size={16} />
                      <span>NO GTM FOUND</span>
                    </>
                  )}
                </div>
                <button
                  className="checklist-button gcm-scan-again-btn"
                  onClick={handleGcmScan}
                  disabled={!gcmUrl.trim()}
                >
                  <Settings size={18} />
                  <span>SCAN AGAIN</span>
                </button>
              </div>
            ) : (
              <button
                className="checklist-button"
                onClick={handleGcmScan}
                disabled={!gcmUrl.trim()}
              >
                <Settings size={18} />
                <span>SCAN</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
