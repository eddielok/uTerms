import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Key,
  Play,
  RefreshCw,
  Shield,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCookieConfig } from "../context/CookieContext";
import { API_URL as BASE_URL } from "../lib/config";
import { supabase } from "../lib/supabase";
import "./APIDocumentation.css";

interface Module {
  id: string;
  label: string;
  endpoint: string;
  embedEndpoint: string;
  embedScript: string;
  divId: string;
  description: string;
}

const MODULES: Module[] = [
  {
    id: "privacy-policy",
    label: "Privacy Policy",
    endpoint: "/api/policy/:userId",
    embedEndpoint: "/api/embed/policy/:userId",
    embedScript: "uterms-policy-embed.js",
    divId: "uterms-policy",
    description:
      "Returns the most recently published Privacy Policy for the given user.",
  },
  {
    id: "cookie-policy",
    label: "Cookie Policy",
    endpoint: "/api/cookie-policy/:userId",
    embedEndpoint: "/api/embed/cookie-policy/:userId",
    embedScript: "uterms-cookie-embed.js",
    divId: "uterms-cookie-policy",
    description:
      "Returns the most recently published Cookie Policy for the given user.",
  },
  {
    id: "tos",
    label: "Terms of Service",
    endpoint: "/api/tos/:userId",
    embedEndpoint: "/api/embed/tos/:userId",
    embedScript: "uterms-tos-embed.js",
    divId: "uterms-tos",
    description:
      "Returns the most recently published Terms of Service for the given user.",
  },
  {
    id: "eula",
    label: "EULA",
    endpoint: "/api/eula/:userId",
    embedEndpoint: "/api/embed/eula/:userId",
    embedScript: "uterms-eula-embed.js",
    divId: "uterms-eula",
    description:
      "Returns the most recently published End-User Licence Agreement for the given user.",
  },
  {
    id: "return-policy",
    label: "Return Policy",
    endpoint: "/api/return-policy/:userId",
    embedEndpoint: "/api/embed/return-policy/:userId",
    embedScript: "uterms-return-policy-embed.js",
    divId: "uterms-return-policy",
    description:
      "Returns the most recently published Return & Refund Policy for the given user.",
  },
  {
    id: "disclaimer",
    label: "Disclaimer",
    endpoint: "/api/disclaimer/:userId",
    embedEndpoint: "/api/embed/disclaimer/:userId",
    embedScript: "uterms-disclaimer-embed.js",
    divId: "uterms-disclaimer",
    description:
      "Returns the most recently published Disclaimer for the given user.",
  },
  {
    id: "shipping-policy",
    label: "Shipping Policy",
    endpoint: "/api/shipping-policy/:userId",
    embedEndpoint: "/api/embed/shipping-policy/:userId",
    embedScript: "uterms-shipping-embed.js",
    divId: "uterms-shipping-policy",
    description:
      "Returns the most recently published Shipping Policy for the given user.",
  },
  {
    id: "aup",
    label: "Acceptable Use Policy",
    endpoint: "/api/aup/:userId",
    embedEndpoint: "/api/embed/aup/:userId",
    embedScript: "uterms-aup-embed.js",
    divId: "uterms-aup",
    description:
      "Returns the most recently published Acceptable Use Policy for the given user.",
  },
  {
    id: "impressum",
    label: "Impressum",
    endpoint: "/api/impressum/:userId",
    embedEndpoint: "/api/embed/impressum/:userId",
    embedScript: "uterms-impressum-embed.js",
    divId: "uterms-impressum",
    description:
      "Returns the most recently published Impressum for the given user.",
  },
  {
    id: "accessibility",
    label: "Accessibility Statement",
    endpoint: "/api/accessibility/:userId",
    embedEndpoint: "/api/embed/accessibility/:userId",
    embedScript: "uterms-accessibility-embed.js",
    divId: "uterms-accessibility",
    description:
      "Returns the most recently published Accessibility Statement for the given user.",
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function generateApiKey(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return (
    "utk_" +
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

function CopyBtn({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={`code-copy-btn ${className ?? ""}`} onClick={copy}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function TryItBtn({
  endpoint,
  userId,
  apiKey,
}: {
  endpoint: string;
  userId: string;
  apiKey: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const run = async () => {
    if (!userId) {
      setIsError(true);
      setResult("No user ID — please log in.");
      return;
    }
    if (!apiKey) {
      setIsError(true);
      setResult("No API key found. Generate one in the API Key section above.");
      return;
    }
    setLoading(true);
    setResult(null);
    const url = `${BASE_URL}${endpoint.replace(":userId", encodeURIComponent(userId))}`;
    try {
      const res = await fetch(url, { headers: { "X-API-Key": apiKey } });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setIsError(true);
        setResult(
          `Server returned ${res.status} with non-JSON response (${contentType || "unknown content type"}).\nPlease restart the backend: node server/index.js`,
        );
        return;
      }
      const data = await res.json();
      setIsError(!res.ok);
      const display = { ...data };
      if (display.generated)
        display.generated = "[HTML content — truncated for display]";
      setResult(JSON.stringify(display, null, 2));
    } catch (err: any) {
      setIsError(true);
      setResult(
        err.message.includes("fetch")
          ? "Cannot connect to backend. Make sure it is running: node server/index.js"
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="try-it-bar">
        <button className="try-it-btn" onClick={run} disabled={loading}>
          <Play size={12} />
          {loading ? "Fetching…" : "Try it"}
        </button>
      </div>
      {result !== null && (
        <pre className={`try-it-result${isError ? " error" : ""}`}>
          {result}
        </pre>
      )}
    </div>
  );
}

function ModuleSection({
  mod,
  userId,
  apiKey,
}: {
  mod: Module;
  userId: string;
  apiKey: string;
}) {
  const resolvedEndpoint = mod.endpoint.replace(
    ":userId",
    userId || "YOUR_USER_ID",
  );
  const displayKey = apiKey || "YOUR_API_KEY";

  const curlSnippet = `curl -X GET "${BASE_URL}${resolvedEndpoint}" \\\n  -H "X-API-Key: ${displayKey}"`;

  const jsSnippet = `fetch("${BASE_URL}${resolvedEndpoint}", {\n  headers: { "X-API-Key": "${displayKey}" }\n})\n  .then(res => res.json())\n  .then(data => {\n    // Use DOMPurify to prevent XSS before inserting HTML\n    document.getElementById("${mod.divId}").innerHTML = DOMPurify.sanitize(data.generated);\n  });`;

  const embedSnippet = `<!-- No API key needed for embed scripts -->\n<div id="${mod.divId}"></div>\n<script src="${BASE_URL}/${mod.embedScript}?id=${userId || "YOUR_USER_ID"}"></script>`;

  return (
    <div className="api-doc-section" id={mod.id}>
      <h2 className="api-doc-section-title">{mod.label}</h2>

      <div className="api-endpoint-block">
        {/* Authenticated endpoint */}
        <div className="api-endpoint-header">
          <span className="method-badge">GET</span>
          <span className="endpoint-url">
            {mod.endpoint.replace(":userId", "")}
            <span className="param">:userId</span>
          </span>
          <span className="api-key-required-badge">requires X-API-Key</span>
        </div>

        {/* Public embed endpoint */}
        <div
          className="api-endpoint-header"
          style={{ borderTop: "1px solid #e5e7eb" }}
        >
          <span className="method-badge method-badge-public">GET</span>
          <span className="endpoint-url">
            {mod.embedEndpoint.replace(":userId", "")}
            <span className="param">:userId</span>
          </span>
          <span className="endpoint-desc">public — for embed scripts</span>
        </div>

        <div className="api-endpoint-body">
          <p
            className="endpoint-desc"
            style={{ marginBottom: "1rem", color: "#374151" }}
          >
            {mod.description}
          </p>

          {/* Response schema */}
          <p className="api-sub-label">Response fields</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>id</td>
                <td>string (UUID)</td>
                <td>Unique document ID</td>
              </tr>
              <tr>
                <td>title</td>
                <td>string</td>
                <td>Document title</td>
              </tr>
              <tr>
                <td>status</td>
                <td>"published"</td>
                <td>Always "published" — drafts are never returned</td>
              </tr>
              <tr>
                <td>generated</td>
                <td>string (HTML)</td>
                <td>Full document as sanitised HTML</td>
              </tr>
              <tr>
                <td>updated_at</td>
                <td>ISO 8601</td>
                <td>Last modification date</td>
              </tr>
            </tbody>
          </table>

          {/* cURL */}
          <p className="api-sub-label">cURL (authenticated)</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{curlSnippet}</pre>
            <CopyBtn text={curlSnippet} />
          </div>

          {/* JavaScript */}
          <p className="api-sub-label">JavaScript (authenticated)</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{jsSnippet}</pre>
            <CopyBtn text={jsSnippet} />
          </div>

          {/* Embed */}
          <p className="api-sub-label">
            Embed on your website (public — no API key needed)
          </p>
          <div className="code-block-wrapper">
            <pre className="code-block">{embedSnippet}</pre>
            <CopyBtn text={embedSnippet} />
          </div>

          {/* Try it */}
          <p className="api-sub-label" style={{ marginTop: "1.25rem" }}>
            Try authenticated endpoint
          </p>
          <TryItBtn endpoint={mod.endpoint} userId={userId} apiKey={apiKey} />
        </div>
      </div>
    </div>
  );
}

// ─── API Key management section ───────────────────────────────────────────────

function ApiKeySection({ userId }: { userId: string }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    supabase
      .from("api_keys")
      .select("api_key")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.warn("[api_keys] load error:", error.message);
        setApiKey(data?.api_key ?? null);
        setLoading(false);
      });
  }, [userId]);

  const generate = async (confirmed = false) => {
    if (apiKey && !confirmed) {
      setConfirmRegen(true);
      return;
    }
    setConfirmRegen(false);
    setGenerating(true);
    setGenError(null);
    const newKey = generateApiKey();
    const { error } = await supabase
      .from("api_keys")
      .upsert({ user_id: userId, api_key: newKey }, { onConflict: "user_id" });
    if (error) {
      console.error("[api_keys] upsert error:", error);
      setGenError(
        error.message ||
          "Failed to save API key. Make sure you have run the Supabase SQL to create the api_keys table.",
      );
    } else {
      setApiKey(newKey);
      setRevealed(true);
    }
    setGenerating(false);
  };

  const copyKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = apiKey
    ? apiKey.slice(0, 8) + "••••••••••••••••••••••••••••••••" + apiKey.slice(-4)
    : null;

  return (
    <div className="api-doc-section" id="api-key">
      <h2 className="api-doc-section-title">API Key</h2>
      <p>
        All direct JSON API calls require an <code>X-API-Key</code> header. Your
        key identifies your account and authorises access to your own published
        documents. Embed scripts (the <code>&lt;script&gt;</code> tag method) do{" "}
        <strong>not</strong> require an API key.
      </p>

      {!userId ? (
        <div className="rate-callout">
          <AlertTriangle size={16} className="rate-callout-icon" />
          <p>Log in to generate an API key.</p>
        </div>
      ) : loading ? (
        <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading…</p>
      ) : (
        <>
          {genError && (
            <div className="rate-callout" style={{ marginBottom: "1rem" }}>
              <AlertTriangle size={16} className="rate-callout-icon" />
              <p>
                <strong>Error:</strong> {genError}
              </p>
            </div>
          )}

          {apiKey ? (
            <div className="api-key-card">
              <div className="api-key-card-header">
                <Key size={16} style={{ color: "#6366f1" }} />
                <span className="api-key-card-label">Your API Key</span>
                <span className="api-key-status-badge">Active</span>
              </div>
              <div className="api-key-value-row">
                <code className="api-key-value">
                  {revealed ? apiKey : maskedKey}
                </code>
                <button
                  className="api-key-icon-btn"
                  onClick={() => setRevealed((v) => !v)}
                  title={revealed ? "Hide" : "Reveal"}
                >
                  {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  className="api-key-icon-btn"
                  onClick={copyKey}
                  title="Copy"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>

              {confirmRegen ? (
                <div className="api-key-regen-warning">
                  <AlertTriangle
                    size={14}
                    style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }}
                  />
                  <span>
                    Regenerating will{" "}
                    <strong>invalidate your current key</strong>. Any
                    integrations using it will break. Continue?
                  </span>
                  <button
                    className="api-key-regen-confirm-btn"
                    onClick={() => generate(true)}
                    disabled={generating}
                  >
                    Yes, regenerate
                  </button>
                  <button
                    className="api-key-cancel-btn"
                    onClick={() => setConfirmRegen(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="api-key-regen-btn"
                  onClick={() => generate(false)}
                  disabled={generating}
                >
                  <RefreshCw size={13} />
                  {generating ? "Regenerating…" : "Regenerate key"}
                </button>
              )}
            </div>
          ) : (
            <div className="api-key-empty">
              <Key
                size={28}
                style={{ color: "#9ca3af", marginBottom: "0.5rem" }}
              />
              <p>You don't have an API key yet.</p>
              <button
                className="api-key-generate-btn"
                onClick={() => generate(false)}
                disabled={generating}
              >
                <Key size={14} />
                {generating ? "Generating…" : "Generate API Key"}
              </button>
              {genError && (
                <p
                  style={{
                    marginTop: "0.75rem",
                    color: "#dc2626",
                    fontSize: "0.8125rem",
                    maxWidth: "380px",
                    textAlign: "center",
                  }}
                >
                  {genError}
                </p>
              )}
            </div>
          )}

          {/* Usage example */}
          {apiKey && (
            <>
              <p className="api-sub-label" style={{ marginTop: "1.5rem" }}>
                How to use
              </p>
              <div className="code-block-wrapper">
                <pre className="code-block">{`# Add to every authenticated API request\ncurl -H "X-API-Key: ${revealed ? apiKey : maskedKey}" https://your-api/...`}</pre>
                <CopyBtn text={`X-API-Key: ${apiKey}`} />
              </div>
              <div className="rate-callout" style={{ marginTop: "0.75rem" }}>
                <Shield
                  size={16}
                  className="rate-callout-icon"
                  style={{ color: "#6366f1" }}
                />
                <p>
                  Keep your API key <strong>secret</strong>. Do not include it
                  in client-side JavaScript, commit it to version control, or
                  embed it in public HTML. Use it only in server-side code or
                  trusted environments.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Cookie Banner & Consent section ─────────────────────────────────────────

function CookieBannerSection({
  userId,
  apiKey,
}: {
  userId: string;
  apiKey: string;
}) {
  const uid = userId || "YOUR_USER_ID";
  const displayKey = apiKey || "YOUR_API_KEY";

  const bannerEmbedSnippet = `<!-- Add before </body> on every page -->\n<script src="${BASE_URL}/uterms-embed.js?id=${uid}"></script>`;

  const bannerGetSnippet = `curl -X GET "${BASE_URL}/api/banner/${uid}"`;

  const consentPostSnippet = `curl -X POST "${BASE_URL}/api/consent" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "user_id": "${uid}",\n    "visitor_id": "VISITOR_UUID",\n    "consent_data": {\n      "essential": true,\n      "analytics": false,\n      "marketing": false\n    },\n    "url": "https://your-website.com/page"\n  }'`;

  const consentJsSnippet = `fetch("${BASE_URL}/api/consent", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    user_id: "${uid}",\n    visitor_id: crypto.randomUUID(),\n    consent_data: { essential: true, analytics: false, marketing: false },\n    url: window.location.href\n  })\n});`;

  const getConsentCurlSnippet = `curl -X GET "${BASE_URL}/api/consent/${uid}?limit=50&offset=0" \\\n  -H "X-API-Key: ${displayKey}"`;

  const getConsentJsSnippet = `fetch("${BASE_URL}/api/consent/${uid}?limit=50&offset=0", {\n  headers: { "X-API-Key": "${displayKey}" }\n})\n  .then(res => res.json())\n  .then(({ records, total }) => {\n    console.log(\`\${total} total records\`);\n    records.forEach(r => console.log(r.visitor_id, r.consent_data));\n  });`;

  return (
    <div className="api-doc-section" id="cookie-banner">
      <h2 className="api-doc-section-title">Cookie Banner &amp; Consent</h2>
      <p>
        These endpoints power the embeddable cookie consent banner. They are{" "}
        <strong>public</strong> — no API key required — because they run inside
        visitor browsers on third-party websites.
      </p>

      {/* ── Banner embed ── */}
      <div className="api-endpoint-block" style={{ marginBottom: "1.25rem" }}>
        <div className="api-endpoint-header">
          <span className="method-badge method-badge-public">EMBED</span>
          <span className="endpoint-url">
            uterms-embed.js<span className="param">?id=:userId</span>
          </span>
          <span className="endpoint-desc">Drop-in cookie consent banner</span>
        </div>
        <div className="api-endpoint-body">
          <p style={{ color: "#374151", marginBottom: "1rem" }}>
            Add one script tag to every page. The banner fetches your cookie
            configuration, renders a consent UI, stores the visitor's choice in
            a cookie, and posts the decision back to{" "}
            <code>POST /api/consent</code> automatically.
          </p>
          <p className="api-sub-label">Embed snippet</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{bannerEmbedSnippet}</pre>
            <CopyBtn text={bannerEmbedSnippet} />
          </div>
        </div>
      </div>

      {/* ── GET /api/banner/:userId ── */}
      <div className="api-endpoint-block" style={{ marginBottom: "1.25rem" }}>
        <div className="api-endpoint-header">
          <span className="method-badge method-badge-public">GET</span>
          <span className="endpoint-url">
            /api/banner/<span className="param">:userId</span>
          </span>
          <span className="endpoint-desc">
            public — returns banner config &amp; scanned cookies
          </span>
        </div>
        <div className="api-endpoint-body">
          <p style={{ color: "#374151", marginBottom: "1rem" }}>
            Returns the banner theme, position, and the full scanned cookie list
            for a user. Used internally by the embed script.
          </p>
          <p className="api-sub-label">Response fields</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>banner_config</td>
                <td>object</td>
                <td>Theme, position, style settings for the consent banner</td>
              </tr>
              <tr>
                <td>scanned_data</td>
                <td>object</td>
                <td>
                  Cookie scan results grouped by category (essential, analytics,
                  marketing, etc.)
                </td>
              </tr>
            </tbody>
          </table>
          <p className="api-sub-label">cURL</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{bannerGetSnippet}</pre>
            <CopyBtn text={bannerGetSnippet} />
          </div>
        </div>
      </div>

      {/* ── POST /api/consent ── */}
      <div className="api-endpoint-block">
        <div className="api-endpoint-header">
          <span
            className="method-badge"
            style={{ background: "#dbeafe", color: "#1e40af" }}
          >
            POST
          </span>
          <span className="endpoint-url">/api/consent</span>
          <span className="endpoint-desc">
            public — log a visitor consent decision
          </span>
        </div>
        <div className="api-endpoint-body">
          <p style={{ color: "#374151", marginBottom: "1rem" }}>
            Records a visitor's consent decision. Called automatically by the
            embed script. You can also call it manually if you build a custom
            consent UI.
          </p>
          <p className="api-sub-label">Request body</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>user_id</td>
                <td>string (UUID)</td>
                <td>Yes</td>
                <td>The banner owner's user ID</td>
              </tr>
              <tr>
                <td>visitor_id</td>
                <td>string (UUID)</td>
                <td>Yes</td>
                <td>
                  Anonymous visitor identifier (generate with{" "}
                  <code>crypto.randomUUID()</code>)
                </td>
              </tr>
              <tr>
                <td>consent_data</td>
                <td>object</td>
                <td>Yes</td>
                <td>
                  Map of category → boolean (e.g.{" "}
                  <code>{'{"analytics":true}'}</code>)
                </td>
              </tr>
              <tr>
                <td>url</td>
                <td>string</td>
                <td>No</td>
                <td>Page URL where consent was given</td>
              </tr>
            </tbody>
          </table>
          <p className="api-sub-label">Response</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>success</td>
                <td>boolean</td>
                <td>
                  <code>true</code> on successful insert
                </td>
              </tr>
            </tbody>
          </table>
          <p className="api-sub-label">cURL</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{consentPostSnippet}</pre>
            <CopyBtn text={consentPostSnippet} />
          </div>
          <p className="api-sub-label">JavaScript</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{consentJsSnippet}</pre>
            <CopyBtn text={consentJsSnippet} />
          </div>
        </div>
      </div>

      {/* ── GET /api/consent/:userId ── */}
      <div className="api-endpoint-block" style={{ marginTop: "1.25rem" }}>
        <div className="api-endpoint-header">
          <span className="method-badge">GET</span>
          <span className="endpoint-url">
            /api/consent/<span className="param">:userId</span>
          </span>
          <span className="api-key-required-badge">requires X-API-Key</span>
        </div>
        <div className="api-endpoint-body">
          <p style={{ color: "#374151", marginBottom: "1rem" }}>
            Returns a paginated list of visitor consent decisions recorded for
            your banner. Supports filtering by date and pagination via query
            parameters.
          </p>

          <p className="api-sub-label">Query parameters</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>limit</td>
                <td>number</td>
                <td>50</td>
                <td>Records per page (max 100)</td>
              </tr>
              <tr>
                <td>offset</td>
                <td>number</td>
                <td>0</td>
                <td>Number of records to skip</td>
              </tr>
              <tr>
                <td>from</td>
                <td>ISO 8601</td>
                <td>—</td>
                <td>Only return records created at or after this timestamp</td>
              </tr>
            </tbody>
          </table>

          <p className="api-sub-label">Response fields</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>records</td>
                <td>array</td>
                <td>Array of consent records (see below)</td>
              </tr>
              <tr>
                <td>total</td>
                <td>number</td>
                <td>Total matching records (for pagination)</td>
              </tr>
              <tr>
                <td>limit</td>
                <td>number</td>
                <td>Applied limit</td>
              </tr>
              <tr>
                <td>offset</td>
                <td>number</td>
                <td>Applied offset</td>
              </tr>
            </tbody>
          </table>

          <p className="api-sub-label">Record fields</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>id</td>
                <td>string (UUID)</td>
                <td>Unique consent record ID</td>
              </tr>
              <tr>
                <td>visitor_id</td>
                <td>string (UUID)</td>
                <td>Anonymous visitor identifier</td>
              </tr>
              <tr>
                <td>consent_data</td>
                <td>object</td>
                <td>Map of category → boolean consent decision</td>
              </tr>
              <tr>
                <td>url</td>
                <td>string</td>
                <td>Page URL where consent was given</td>
              </tr>
              <tr>
                <td>created_at</td>
                <td>ISO 8601</td>
                <td>Timestamp of the consent decision</td>
              </tr>
            </tbody>
          </table>

          <p className="api-sub-label">cURL</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{getConsentCurlSnippet}</pre>
            <CopyBtn text={getConsentCurlSnippet} />
          </div>

          <p className="api-sub-label">JavaScript</p>
          <div className="code-block-wrapper">
            <pre className="code-block">{getConsentJsSnippet}</pre>
            <CopyBtn text={getConsentJsSnippet} />
          </div>

          <p className="api-sub-label" style={{ marginTop: "1.25rem" }}>
            Try it
          </p>
          <TryItBtn
            endpoint="/api/consent/:userId"
            userId={userId}
            apiKey={apiKey}
          />

          <div className="rate-callout" style={{ marginTop: "1rem" }}>
            <AlertTriangle size={16} className="rate-callout-icon" />
            {/* <p>
              If this returns an empty <code>records</code> array, you may need to add a Supabase RLS SELECT policy for the <code>visitor_consent</code> table:
              <br /><br />
              <code>create policy "Owner can read own consent records" on visitor_consent for select using (true);</code>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const NAV_STATIC = [
  { id: "overview", label: "Overview" },
  { id: "your-id", label: "Your API ID" },
  { id: "api-key", label: "API Key" },
  { id: "security", label: "Security" },
  { id: "rate-limits", label: "Rate Limits" },
  { id: "errors", label: "Error Codes" },
];

export const APIDocumentation: React.FC = () => {
  const { userId } = useCookieConfig();
  const [activeSection, setActiveSection] = useState("overview");
  const [idCopied, setIdCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Load API key for use in code snippets and Try It
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("api_keys")
      .select("api_key")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.api_key) setApiKey(data.api_key);
      });
  }, [userId]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyId = async () => {
    if (!userId) return;
    await navigator.clipboard.writeText(userId);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  return (
    <div className="api-doc-layout">
      {/* ── Left nav ── */}
      <nav className="api-doc-nav">
        <p className="api-doc-nav-title">General</p>
        {NAV_STATIC.map((item) => (
          <button
            key={item.id}
            className={`api-doc-nav-item ${activeSection === item.id ? "active" : ""}`}
            onClick={() => scrollTo(item.id)}
          >
            {item.label}
          </button>
        ))}
        <div className="api-doc-nav-divider" />
        <p className="api-doc-nav-title">Endpoints</p>
        <button
          className={`api-doc-nav-item ${activeSection === "cookie-banner" ? "active" : ""}`}
          onClick={() => scrollTo("cookie-banner")}
        >
          Cookie Banner &amp; Consent
        </button>
        <div className="api-doc-nav-divider" />
        <p className="api-doc-nav-title">Policy Documents</p>
        {MODULES.map((mod) => (
          <button
            key={mod.id}
            className={`api-doc-nav-item ${activeSection === mod.id ? "active" : ""}`}
            onClick={() => scrollTo(mod.id)}
          >
            {mod.label}
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      <div className="api-doc-content">
        <h1 className="api-doc-page-title">API Reference</h1>
        <p className="api-doc-page-subtitle">
          Embed any published legal document on your website with two lines of
          HTML, or query the JSON API directly with your API key.
        </p>

        {/* Overview */}
        <div className="api-doc-section" id="overview">
          <h2 className="api-doc-section-title">Overview</h2>
          <p>
            The uTerms API exposes your published legal documents over HTTP. Two
            usage modes:
          </p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Auth</th>
                <th>Path prefix</th>
                <th>Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Embed</strong>
                </td>
                <td>None</td>
                <td>
                  <code>/api/embed/…</code>
                </td>
                <td>Script tags on third-party websites</td>
              </tr>
              <tr>
                <td>
                  <strong>Authenticated API</strong>
                </td>
                <td>
                  <code>X-API-Key</code> header
                </td>
                <td>
                  <code>/api/…</code>
                </td>
                <td>Server-side integrations, custom rendering</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Base URL:</strong> <code>{BASE_URL}</code>
            <br />
            All responses are <code>application/json</code>. Only{" "}
            <code>status = "published"</code> documents are ever returned — only
            published documents are ever returned.
          </p>
        </div>

        {/* Your ID */}
        <div className="api-doc-section" id="your-id">
          <h2 className="api-doc-section-title">Your API ID</h2>
          <p>
            Your <strong>User ID</strong> is required in every API path. All
            code examples below are pre-filled with your ID.
          </p>
          <div className="api-id-card">
            <span className="api-id-label">Your User ID</span>
            <span className="api-id-value">
              {userId || "— not logged in —"}
            </span>
            {userId && (
              <button className="api-id-copy-btn" onClick={copyId}>
                {idCopied ? <Check size={13} /> : <Copy size={13} />}
                {idCopied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </div>

        {/* API Key */}
        <ApiKeySection userId={userId || ""} />

        {/* Security */}
        <div className="api-doc-section" id="security">
          <h2 className="api-doc-section-title">Security</h2>
          <div className="security-grid">
            <div className="security-badge">
              <Key size={16} className="security-badge-icon" />
              <div>
                <div className="security-badge-title">API Key auth</div>
                <div className="security-badge-desc">
                  All direct JSON API calls require <code>X-API-Key</code>. The
                  key is validated against your account and the{" "}
                  <code>:userId</code> in the path must match.
                </div>
              </div>
            </div>
            <div className="security-badge">
              <Shield size={16} className="security-badge-icon" />
              <div>
                <div className="security-badge-title">UUID validation</div>
                <div className="security-badge-desc">
                  Every <code>:userId</code> path parameter is validated against
                  a strict UUID regex before any database query.
                </div>
              </div>
            </div>
            <div className="security-badge">
              <Clock size={16} className="security-badge-icon" />
              <div>
                <div className="security-badge-title">Rate limiting</div>
                <div className="security-badge-desc">
                  100 req / 15 min per IP on all policy endpoints. 5 req / min
                  on scan endpoints.
                </div>
              </div>
            </div>
            <div className="security-badge">
              <Globe size={16} className="security-badge-icon" />
              <div>
                <div className="security-badge-title">Split embed / API</div>
                <div className="security-badge-desc">
                  Embed paths are public (published content only). Authenticated
                  API paths require a valid API key that matches the user ID in
                  the path.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate limits */}
        <div className="api-doc-section" id="rate-limits">
          <h2 className="api-doc-section-title">Rate Limits</h2>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Endpoint group</th>
                <th>Limit</th>
                <th>Window</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>/api/embed/…</code> (public)
                </td>
                <td>100 requests</td>
                <td>15 minutes</td>
              </tr>
              <tr>
                <td>
                  <code>/api/…</code> (authenticated)
                </td>
                <td>100 requests</td>
                <td>15 minutes</td>
              </tr>
              <tr>
                <td>
                  <code>POST /api/scan</code>
                </td>
                <td>5 requests</td>
                <td>1 minute</td>
              </tr>
              <tr>
                <td>
                  <code>POST /api/analyze-policy</code>
                </td>
                <td>5 requests</td>
                <td>1 minute</td>
              </tr>
            </tbody>
          </table>
          <div className="rate-callout">
            <AlertTriangle size={16} className="rate-callout-icon" />
            <p>
              HTTP <strong>429</strong> is returned when a limit is exceeded.
              The response includes <code>RateLimit-*</code> headers for
              backoff.
            </p>
          </div>
        </div>

        {/* Errors */}
        <div className="api-doc-section" id="errors">
          <h2 className="api-doc-section-title">Error Codes</h2>
          <table className="schema-table">
            <thead>
              <tr>
                <th>HTTP status</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>200 OK</td>
                <td>Document found and returned.</td>
              </tr>
              <tr>
                <td>400 Bad Request</td>
                <td>
                  The <code>:userId</code> is not a valid UUID.
                </td>
              </tr>
              <tr>
                <td>401 Unauthorized</td>
                <td>API key missing or invalid.</td>
              </tr>
              <tr>
                <td>403 Forbidden</td>
                <td>
                  API key does not match the <code>:userId</code> in the path.
                </td>
              </tr>
              <tr>
                <td>404 Not Found</td>
                <td>No published document for this user ID.</td>
              </tr>
              <tr>
                <td>429 Too Many Requests</td>
                <td>Rate limit exceeded.</td>
              </tr>
              <tr>
                <td>500 Internal Server Error</td>
                <td>Backend error.</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            All error responses share the shape:{" "}
            <code>{'{"error":"<message>"}'}</code>.
          </p>
        </div>

        {/* Cookie Banner & Consent */}
        <CookieBannerSection userId={userId || ""} apiKey={apiKey} />

        {/* Per-module sections */}
        {MODULES.map((mod) => (
          <ModuleSection
            key={mod.id}
            mod={mod}
            userId={userId || ""}
            apiKey={apiKey}
          />
        ))}
      </div>
    </div>
  );
};
