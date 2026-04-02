import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookieConfig } from "../context/CookieContext";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";

const POLICY_DEFS = [
  { table: "privacy_policies", label: "Privacy Policy", path: "/policy-management" },
  { table: "cookie_policies", label: "Cookie Policy", path: "/cookie-policy" },
  { table: "terms_of_service", label: "Terms of Service", path: "/terms-of-service" },
  { table: "eula", label: "EULA", path: "/eula" },
  { table: "return_policy", label: "Return Policy", path: "/return-policy" },
  { table: "disclaimer", label: "Disclaimer", path: "/disclaimer" },
  { table: "shipping_policy", label: "Shipping Policy", path: "/shipping-policy" },
  { table: "acceptable_use_policy", label: "Acceptable Use Policy", path: "/acceptable-use-policy" },
  { table: "impressum", label: "Impressum", path: "/impressum" },
  { table: "accessibility_statement", label: "Accessibility Statement", path: "/accessibility-statement" },
];

interface PolicyInfo {
  table: string;
  label: string;
  path: string;
  id: string | null;
  title: string | null;
  updated_at: string | null;
}

interface ConsentRecord {
  consent_data: Record<string, boolean>;
  created_at: string;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className={`dash-stat-card dash-stat-${color}`}>
      <p className="dash-stat-label">{label}</p>
      <p className="dash-stat-value">{value}</p>
      <p className="dash-stat-sub" title={sub}>{sub}</p>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const { scannedData, bannerConfig, userId } = useCookieConfig();
  const navigate = useNavigate();

  const [totalConsents, setTotalConsents] = useState<number | null>(null);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [policies, setPolicies] = useState<PolicyInfo[]>([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(true);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchConsents = async () => {
      setIsLoadingConsents(true);
      const { count } = await supabase
        .from("visitor_consent")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      setTotalConsents(count ?? 0);

      const { data } = await supabase
        .from("visitor_consent")
        .select("consent_data, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(500);
      setConsentRecords(data || []);
      setIsLoadingConsents(false);
    };
    fetchConsents();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchPolicies = async () => {
      setIsLoadingPolicies(true);
      const results = await Promise.all(
        POLICY_DEFS.map(async (def) => {
          const { data } = await supabase
            .from(def.table)
            .select("id, title, updated_at")
            .eq("user_id", userId)
            .eq("status", "published")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          return {
            ...def,
            id: data?.id ?? null,
            title: data?.title ?? null,
            updated_at: data?.updated_at ?? null,
          };
        })
      );
      setPolicies(results);
      setIsLoadingPolicies(false);
    };
    fetchPolicies();
  }, [userId]);

  const acceptRate =
    consentRecords.length > 0
      ? Math.round(
          (consentRecords.filter((r) =>
            Object.values(r.consent_data || {}).every((v) => v === true)
          ).length /
            consentRecords.length) *
            100
        )
      : null;

  const categoryStats: Record<string, { accepted: number; total: number }> = {};
  for (const record of consentRecords) {
    for (const [cat, accepted] of Object.entries(record.consent_data || {})) {
      if (!categoryStats[cat]) categoryStats[cat] = { accepted: 0, total: 0 };
      categoryStats[cat].total++;
      if (accepted) categoryStats[cat].accepted++;
    }
  }

  const publishedCount = policies.filter((p) => p.id !== null).length;

  return (
    <div className="dashboard-container container">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl font-bold mb-1">Privacy Operations</h1>
          <p className="text-muted">
            Monitor and manage your organization's compliance status.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stat-grid">
        <StatCard
          label="Total Consents"
          value={isLoadingConsents ? "—" : (totalConsents ?? 0).toLocaleString()}
          sub="All-time visitor consents"
          color="blue"
        />
        <StatCard
          label="Accept Rate"
          value={
            isLoadingConsents
              ? "—"
              : acceptRate !== null
              ? `${acceptRate}%`
              : "N/A"
          }
          sub="Visitors who accepted all"
          color="green"
        />
        <StatCard
          label="Cookies Scanned"
          value={scannedData ? scannedData.cookiesCount.toString() : "—"}
          sub={scannedData ? scannedData.url : "No scan yet"}
          color="purple"
        />
        <StatCard
          label="Published Policies"
          value={
            isLoadingPolicies ? "—" : `${publishedCount} / ${POLICY_DEFS.length}`
          }
          sub="Active policy documents"
          color="orange"
        />
      </div>

      <div className="dash-main-grid">
        {/* Left column */}
        <div className="dash-left">
          {/* Consent by Category */}
          <section className="dash-card">
            <h2 className="dash-card-title">Consent by Category</h2>
            {isLoadingConsents ? (
              <p className="dash-empty">Loading…</p>
            ) : Object.keys(categoryStats).length === 0 ? (
              <p className="dash-empty">No consent data yet.</p>
            ) : (
              <div className="dash-category-list">
                {Object.entries(categoryStats).map(([cat, { accepted, total }]) => {
                  const pct = Math.round((accepted / total) * 100);
                  return (
                    <div key={cat} className="dash-category-item">
                      <div className="dash-category-header">
                        <span className="dash-category-name">{capitalize(cat)}</span>
                        <span className="dash-category-pct">{pct}%</span>
                      </div>
                      <div className="dash-progress-track">
                        <div
                          className="dash-progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="dash-category-sub">
                        {accepted.toLocaleString()} / {total.toLocaleString()} visitors
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Scanned Cookies */}
          <section className="dash-card">
            <h2 className="dash-card-title">Scanned Cookies</h2>
            {!scannedData ? (
              <p className="dash-empty">
                No scan yet.{" "}
                <button
                  className="dash-link"
                  onClick={() => navigate("/consent-management/scanner")}
                >
                  Scan a website
                </button>
              </p>
            ) : (
              <>
                <p className="dash-scan-meta">
                  <strong>{scannedData.url}</strong> &mdash;{" "}
                  {new Date(scannedData.date).toLocaleDateString()}
                </p>
                <div className="dash-cookie-bars">
                  {scannedData.categories.map((cat) => {
                    const count = cat.providers.reduce(
                      (acc, p) => acc + p.cookies.length,
                      0
                    );
                    const maxCount = Math.max(
                      ...scannedData.categories.map((c) =>
                        c.providers.reduce((a, p) => a + p.cookies.length, 0)
                      ),
                      1
                    );
                    return (
                      <div key={cat.id} className="dash-cookie-bar-item">
                        <div className="dash-cookie-bar-header">
                          <span className="dash-cookie-bar-name">{cat.name}</span>
                          <span className="dash-cookie-bar-count">
                            {count} {count === 1 ? "cookie" : "cookies"}
                          </span>
                        </div>
                        <div className="dash-progress-track">
                          <div
                            className="dash-progress-fill dash-progress-cookies"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="dash-right">
          {/* Published Policies */}
          <section className="dash-card">
            <h2 className="dash-card-title">Policy Documents</h2>
            {isLoadingPolicies ? (
              <p className="dash-empty">Loading…</p>
            ) : (
              <div className="dash-policy-list">
                {policies.map((p) => (
                  <div key={p.table} className="dash-policy-item">
                    <div className="dash-policy-left">
                      <span
                        className={`dash-policy-badge ${p.id ? "badge-published" : "badge-unset"}`}
                      >
                        {p.id ? "Published" : "Not set"}
                      </span>
                      <span className="dash-policy-label">{p.label}</span>
                    </div>
                    <div className="dash-policy-right">
                      {p.updated_at && (
                        <span className="dash-policy-date">
                          {new Date(p.updated_at).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        className="dash-link"
                        onClick={() => navigate(p.path)}
                      >
                        {p.id ? "View" : "Create"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Banner Settings */}
          <section className="dash-card">
            <h2 className="dash-card-title">Cookie Banner Settings</h2>
            {!bannerConfig.isConfigured ? (
              <p className="dash-empty">
                Banner not configured.{" "}
                <button
                  className="dash-link"
                  onClick={() => navigate("/consent-management/banner-settings")}
                >
                  Configure
                </button>
              </p>
            ) : (
              <div className="dash-banner-settings">
                <div className="dash-banner-row">
                  <span className="dash-banner-key">Theme</span>
                  <span className="dash-banner-val">
                    <span
                      className="dash-color-swatch"
                      style={{ background: bannerConfig.theme }}
                    />
                    {bannerConfig.theme}
                  </span>
                </div>
                <div className="dash-banner-row">
                  <span className="dash-banner-key">Style</span>
                  <span className="dash-pill">{bannerConfig.styleMode}</span>
                </div>
                <div className="dash-banner-row">
                  <span className="dash-banner-key">Position</span>
                  <span className="dash-pill">{bannerConfig.position}</span>
                </div>
                <div className="dash-banner-row">
                  <span className="dash-banner-key">Size</span>
                  <span className="dash-pill">{bannerConfig.size}</span>
                </div>
                <button
                  className="dash-configure-btn"
                  onClick={() => navigate("/consent-management/banner-settings")}
                >
                  Configure Banner
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
