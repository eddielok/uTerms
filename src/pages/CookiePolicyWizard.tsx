import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCookieConfig } from "../context/CookieContext";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_COOKIE_ANSWERS,
  generateCookiePolicy,
  type CookiePolicyAnswers,
  type SpecificCookie,
} from "../utils/generateCookiePolicy";
import "./PrivacyPolicyWizard.css";

const STEPS = [
  { title: "Website Info", description: "Tell us about your website" },
  {
    title: "Cookie Types",
    description: "Which categories of cookies do you use?",
  },
  {
    title: "Third-Party Providers",
    description: "Which external services set cookies on your site?",
  },
  {
    title: "Consent & Control",
    description: "How do you obtain and manage cookie consent?",
  },
  {
    title: "Compliance",
    description: "Which regulations apply to your website?",
  },
  {
    title: "Contact & Generate",
    description: "Provide contact details and generate your policy",
  },
];

const ANALYTICS_PROVIDERS = [
  "Google Analytics",
  "Google Tag Manager",
  "Hotjar",
  "Mixpanel",
  "Segment",
  "Other",
];
const MARKETING_PROVIDERS = [
  "Meta Pixel",
  "Facebook",
  "LinkedIn",
  "Twitter/X",
  "TikTok",
  "Pinterest",
  "HubSpot",
  "Other",
];
const SOCIAL_PROVIDERS = [
  "Facebook",
  "Twitter/X",
  "LinkedIn",
  "Pinterest",
  "Snapchat",
  "TikTok",
  "Other",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Singapore",
  "India",
  "Other",
];

const WEBSITE_TYPES = [
  { value: "website", label: "General Website" },
  { value: "saas", label: "SaaS / Web App" },
  { value: "ecommerce", label: "E-Commerce Store" },
  { value: "blog", label: "Blog / Content Site" },
  { value: "portfolio", label: "Portfolio / Personal Site" },
  { value: "other", label: "Other" },
];

export const CookiePolicyWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId, scannedData } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CookiePolicyAnswers>(
    DEFAULT_COOKIE_ANSWERS,
  );
  const [policyTitle, setPolicyTitle] = useState("Cookie Policy");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  // Load existing policy when editing
  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from("cookie_policies")
          .select("title, answers")
          .eq("id", id)
          .single();
        if (data) {
          setPolicyTitle(data.title);
          setAnswers({ ...DEFAULT_COOKIE_ANSWERS, ...data.answers });
        }
        setIsLoading(false);
      })();
    } else {
      // Auto-fill from scanned data
      if (scannedData) {
        const hasAnalytics = scannedData.categories.some(
          (c) =>
            c.id === "analytics" &&
            c.providers.some((p) => p.cookies.length > 0),
        );
        const hasMarketing = scannedData.categories.some(
          (c) =>
            c.id === "marketing" &&
            c.providers.some((p) => p.cookies.length > 0),
        );
        const hasFunctional = scannedData.categories.some(
          (c) =>
            c.id === "functional" &&
            c.providers.some((p) => p.cookies.length > 0),
        );
        const hasSocial = scannedData.categories.some(
          (c) =>
            c.id === "social" && c.providers.some((p) => p.cookies.length > 0),
        );
        // Build specific cookie list from scan results
        const specificCookies: SpecificCookie[] = [];
        for (const category of scannedData.categories) {
          for (const provider of category.providers) {
            for (const cookie of provider.cookies) {
              specificCookies.push({
                name: cookie.name || "",
                provider: provider.name || cookie.domain || "",
                category: category.name,
                purpose: cookie.description || "",
                duration: cookie.expiration || "Session",
                partyType: "First-party",
              });
            }
          }
        }

        setAnswers((prev) => ({
          ...prev,
          websiteUrl: prev.websiteUrl || scannedData.url || "",
          usesAnalytics: hasAnalytics,
          usesMarketing: hasMarketing,
          usesFunctional: hasFunctional,
          usesSocial: hasSocial,
          specificCookies:
            specificCookies.length > 0 ? specificCookies : prev.specificCookies,
        }));
      }
      setIsLoading(false);
    }
  }, [id, isEditing, scannedData]);

  const set = <K extends keyof CookiePolicyAnswers>(
    key: K,
    value: CookiePolicyAnswers[K],
  ) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArray = (
    key: "analyticsProviders" | "marketingProviders" | "socialProviders",
    value: string,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const addCookieRow = () => {
    setAnswers((prev) => ({
      ...prev,
      specificCookies: [
        ...prev.specificCookies,
        {
          name: "",
          provider: "",
          category: "Essential",
          purpose: "",
          duration: "Session",
          partyType: "First-party",
        },
      ],
    }));
  };

  const updateCookieRow = (
    index: number,
    field: keyof SpecificCookie,
    value: string,
  ) => {
    setAnswers((prev) => {
      const updated = [...prev.specificCookies];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, specificCookies: updated };
    });
  };

  const removeCookieRow = (index: number) => {
    setAnswers((prev) => ({
      ...prev,
      specificCookies: prev.specificCookies.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const generated = generateCookiePolicy(answers);
      const payload = {
        user_id: userId,
        title: policyTitle,
        answers,
        generated,
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await supabase.from("cookie_policies").update(payload).eq("id", id);
        navigate(`/cookie-policy/${id}/preview`);
      } else {
        const { data } = await supabase
          .from("cookie_policies")
          .insert(payload)
          .select("id")
          .single();
        if (data) navigate(`/cookie-policy/${data.id}/preview`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="wizard-loading">Loading policy...</div>;
  }

  return (
    <div className="wizard-container">
      {/* Header */}
      <div className="wizard-header">
        <button
          className="wizard-back-btn"
          onClick={() => navigate("/cookie-policy")}
        >
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? "Edit Cookie Policy" : "Create Cookie Policy"}</h1>
      </div>

      {/* Step Progress */}
      <div className="wizard-progress">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`wizard-step-dot ${i === step ? "active" : ""} ${i < step ? "completed" : ""}`}
            onClick={() => setStep(i)}
            title={s.title}
          >
            {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
          </button>
        ))}
        <div className="wizard-progress-bar">
          <div
            className="wizard-progress-fill"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Card */}
      <div className="wizard-card">
        <div className="wizard-step-header">
          <span className="wizard-step-badge">
            Step {step + 1} of {STEPS.length}
          </span>
          <h2>{STEPS[step].title}</h2>
          <p className="wizard-step-desc">{STEPS[step].description}</p>
        </div>

        <div className="wizard-step-body">
          {/* Step 1: Website Info */}
          {step === 0 && (
            <div className="wizard-fields">
              <div className="wizard-field">
                <label>Policy Title</label>
                <input
                  type="text"
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  placeholder="Cookie Policy"
                />
              </div>
              <div className="wizard-row">
                <div className="wizard-field">
                  <label>
                    Website / Business Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={answers.websiteName}
                    onChange={(e) => set("websiteName", e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="wizard-field">
                  <label>
                    Website URL <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    value={answers.websiteUrl}
                    onChange={(e) => set("websiteUrl", e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
              <div className="wizard-row">
                <div className="wizard-field">
                  <label>Website Type</label>
                  <select
                    value={answers.websiteType}
                    onChange={(e) => set("websiteType", e.target.value)}
                  >
                    {WEBSITE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="wizard-field">
                  <label>Primary Country / Jurisdiction</label>
                  <select
                    value={answers.country}
                    onChange={(e) => set("country", e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Cookie Types */}
          {step === 1 && (
            <div className="wizard-fields">
              <p
                className="wizard-step-desc"
                style={{ marginBottom: "0.5rem" }}
              >
                Select all categories of cookies used on your website. Essential
                cookies are always required.
              </p>
              <div className="wizard-toggles">
                <div className="wizard-toggle-field">
                  <div>
                    <strong>Essential / Strictly Necessary</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Required for the website to function (login, cart,
                      security). Cannot be disabled.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.usesEssential}
                      onChange={(e) => set("usesEssential", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="wizard-toggle-field">
                  <div>
                    <strong>Functional</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Remember user preferences like language, theme, or saved
                      settings.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.usesFunctional}
                      onChange={(e) => set("usesFunctional", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="wizard-toggle-field">
                  <div>
                    <strong>Analytics / Performance</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Collect usage data to help improve the website (e.g.
                      Google Analytics).
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.usesAnalytics}
                      onChange={(e) => set("usesAnalytics", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="wizard-toggle-field">
                  <div>
                    <strong>Marketing / Advertising</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Track visitors across websites to show personalised ads
                      (e.g. Meta Pixel).
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.usesMarketing}
                      onChange={(e) => set("usesMarketing", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="wizard-toggle-field">
                  <div>
                    <strong>Social Media</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Enable social sharing buttons or embedded social content.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.usesSocial}
                      onChange={(e) => set("usesSocial", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="wizard-field">
                <label>Default cookie retention period</label>
                <select
                  value={answers.cookieDuration}
                  onChange={(e) => set("cookieDuration", e.target.value)}
                >
                  <option value="30 days">30 days</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                  <option value="24 months">24 months</option>
                </select>
              </div>

              {/* Specific Cookie Table */}
              <div className="wizard-field">
                <label>
                  Specific Cookies{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      color: "#6b7280",
                      fontSize: "0.8rem",
                    }}
                  >
                    — required by GDPR &amp; ePrivacy Directive
                  </span>
                </label>
                <p
                  className="wizard-field-hint"
                  style={{ marginBottom: "0.75rem" }}
                >
                  List each cookie by name. GDPR transparency obligations
                  require you to disclose the exact cookie names, not just
                  categories.
                  {answers.specificCookies.length > 0 && scannedData
                    ? " Pre-populated from your last scan — review and correct as needed."
                    : " Add your cookies manually below."}
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {[
                          "Cookie Name",
                          "Provider",
                          "Category",
                          "Purpose",
                          "Duration",
                          "Type",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "0.5rem 0.6rem",
                              border: "1px solid #e5e7eb",
                              fontWeight: 600,
                              color: "#374151",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {answers.specificCookies.map((cookie, i) => (
                        <tr key={i}>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem",
                            }}
                          >
                            <input
                              type="text"
                              value={cookie.name}
                              onChange={(e) =>
                                updateCookieRow(i, "name", e.target.value)
                              }
                              placeholder="_ga"
                              style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                fontSize: "0.8rem",
                                fontFamily: "ui-monospace, monospace",
                                padding: "0.25rem 0.4rem",
                                background: "transparent",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem",
                            }}
                          >
                            <input
                              type="text"
                              value={cookie.provider}
                              onChange={(e) =>
                                updateCookieRow(i, "provider", e.target.value)
                              }
                              placeholder="Google Analytics"
                              style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                fontSize: "0.8rem",
                                padding: "0.25rem 0.4rem",
                                background: "transparent",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem",
                            }}
                          >
                            <select
                              value={cookie.category}
                              onChange={(e) =>
                                updateCookieRow(i, "category", e.target.value)
                              }
                              style={{
                                border: "none",
                                outline: "none",
                                fontSize: "0.8rem",
                                padding: "0.25rem 0.4rem",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                            >
                              <option>Essential</option>
                              <option>Functional</option>
                              <option>Analytics</option>
                              <option>Marketing</option>
                              <option>Social</option>
                            </select>
                          </td>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem",
                            }}
                          >
                            <input
                              type="text"
                              value={cookie.purpose}
                              onChange={(e) =>
                                updateCookieRow(i, "purpose", e.target.value)
                              }
                              placeholder="Used to distinguish users"
                              style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                fontSize: "0.8rem",
                                padding: "0.25rem 0.4rem",
                                background: "transparent",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem",
                            }}
                          >
                            <input
                              type="text"
                              value={cookie.duration}
                              onChange={(e) =>
                                updateCookieRow(i, "duration", e.target.value)
                              }
                              placeholder="2 years"
                              style={{
                                width: "7rem",
                                border: "none",
                                outline: "none",
                                fontSize: "0.8rem",
                                padding: "0.25rem 0.4rem",
                                background: "transparent",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem",
                            }}
                          >
                            <select
                              value={cookie.partyType}
                              onChange={(e) =>
                                updateCookieRow(i, "partyType", e.target.value)
                              }
                              style={{
                                border: "none",
                                outline: "none",
                                fontSize: "0.8rem",
                                padding: "0.25rem 0.4rem",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                            >
                              <option>First-party</option>
                              <option>Third-party</option>
                            </select>
                          </td>
                          <td
                            style={{
                              border: "1px solid #e5e7eb",
                              padding: "0.25rem",
                              textAlign: "center",
                            }}
                          >
                            <button
                              onClick={() => removeCookieRow(i)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#ef4444",
                                fontSize: "1rem",
                                lineHeight: 1,
                                padding: "0.25rem",
                              }}
                              title="Remove row"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addCookieRow}
                  style={{
                    marginTop: "0.6rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.8125rem",
                    color: "#374151",
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    padding: "0.35rem 0.75rem",
                    cursor: "pointer",
                  }}
                >
                  + Add cookie
                </button>
                {answers.specificCookies.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#b45309",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "6px",
                      padding: "0.6rem 0.875rem",
                      marginTop: "0.6rem",
                    }}
                  >
                    No cookies listed. GDPR requires you to name each cookie by
                    its exact identifier (e.g.{" "}
                    <code
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      _ga
                    </code>
                    ,{" "}
                    <code
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      csrf_token
                    </code>
                    ). Run a website scan first to auto-populate this table, or
                    add cookies manually.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Third-Party Providers */}
          {step === 2 && (
            <div className="wizard-fields">
              {answers.usesAnalytics && (
                <div className="wizard-field">
                  <label>Analytics / Performance Providers</label>
                  <div className="wizard-checkboxes">
                    {ANALYTICS_PROVIDERS.map((p) => (
                      <label key={p} className="wizard-checkbox-item">
                        <input
                          type="checkbox"
                          checked={answers.analyticsProviders.includes(p)}
                          onChange={() => toggleArray("analyticsProviders", p)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {answers.usesMarketing && (
                <div className="wizard-field">
                  <label>Marketing / Advertising Providers</label>
                  <div className="wizard-checkboxes">
                    {MARKETING_PROVIDERS.map((p) => (
                      <label key={p} className="wizard-checkbox-item">
                        <input
                          type="checkbox"
                          checked={answers.marketingProviders.includes(p)}
                          onChange={() => toggleArray("marketingProviders", p)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {answers.usesSocial && (
                <div className="wizard-field">
                  <label>Social Media Providers</label>
                  <div className="wizard-checkboxes">
                    {SOCIAL_PROVIDERS.map((p) => (
                      <label key={p} className="wizard-checkbox-item">
                        <input
                          type="checkbox"
                          checked={answers.socialProviders.includes(p)}
                          onChange={() => toggleArray("socialProviders", p)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {!answers.usesAnalytics &&
                !answers.usesMarketing &&
                !answers.usesSocial && (
                  <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    No third-party provider categories selected. Go back to Step
                    2 to enable Analytics, Marketing, or Social cookies.
                  </p>
                )}
              <div className="wizard-field">
                <label>Other third-party services (optional)</label>
                <input
                  type="text"
                  value={answers.otherProviders}
                  onChange={(e) => set("otherProviders", e.target.value)}
                  placeholder="e.g. Intercom, Zendesk, Stripe"
                />
                <p className="wizard-field-hint">
                  Comma-separated list of any other services not listed above.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Consent & Control */}
          {step === 3 && (
            <div className="wizard-fields">
              <div className="wizard-field">
                <label>Consent Mechanism</label>
                <select
                  value={answers.consentMechanism}
                  onChange={(e) => set("consentMechanism", e.target.value)}
                >
                  <option value="banner">
                    Cookie consent banner (opt-in / opt-out)
                  </option>
                  <option value="opt-in">
                    Explicit opt-in only (no cookies until consent)
                  </option>
                  <option value="implied">
                    Implied consent (continued use = consent)
                  </option>
                </select>
                <p className="wizard-field-hint">
                  GDPR and ePrivacy require explicit opt-in for non-essential
                  cookies. We recommend using a cookie consent banner.
                </p>
              </div>
              <div className="wizard-field">
                <label>How can users manage or withdraw consent?</label>
                <select
                  value={answers.optOutMethod}
                  onChange={(e) => set("optOutMethod", e.target.value)}
                >
                  <option value="banner">
                    Via the cookie consent banner / settings link
                  </option>
                  <option value="browser">Via browser settings only</option>
                  <option value="both">Both banner and browser settings</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Compliance */}
          {step === 4 && (
            <div className="wizard-fields">
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Select the regulations that apply to your website. This
                determines which sections are included in your policy.
              </p>
              <div className="wizard-toggles">
                <div className="wizard-toggle-field">
                  <div>
                    <strong>GDPR / UK GDPR</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Applies if you have visitors from the EU or UK. Requires
                      explicit consent for non-essential cookies.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.gdprApplies}
                      onChange={(e) => set("gdprApplies", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="wizard-toggle-field">
                  <div>
                    <strong>CCPA / CPRA (California)</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Applies to businesses serving California residents.
                      Requires a "Do Not Sell or Share" option.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.ccpaApplies}
                      onChange={(e) => set("ccpaApplies", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="wizard-toggle-field">
                  <div>
                    <strong>ePrivacy Directive</strong>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      EU regulation that specifically governs cookies and
                      electronic communications.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={answers.eprivacyApplies}
                      onChange={(e) => set("eprivacyApplies", e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              {/* CCPA sell/share questions — only shown when CCPA is enabled */}
              {answers.ccpaApplies && (
                <>
                  <div
                    style={{
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: "1.25rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: "0.25rem",
                      }}
                    >
                      CCPA / CPRA — Notice at Collection
                    </p>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#6b7280",
                        marginBottom: "1rem",
                      }}
                    >
                      California law requires you to explicitly state whether
                      you &ldquo;Sell&rdquo; or &ldquo;Share&rdquo; personal
                      information collected via cookies. These have specific
                      legal definitions under the CPRA.
                    </p>
                  </div>
                  <div className="wizard-toggles">
                    <div className="wizard-toggle-field">
                      <div>
                        <strong>
                          We &ldquo;Sell&rdquo; personal information via cookies
                        </strong>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "#6b7280",
                            margin: 0,
                          }}
                        >
                          Disclosing cookie data to a third party for monetary
                          or other valuable consideration (not a common practice
                          for most websites).
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={answers.sellsData}
                          onChange={(e) => set("sellsData", e.target.checked)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                    <div className="wizard-toggle-field">
                      <div>
                        <strong>
                          We &ldquo;Share&rdquo; personal information for
                          cross-context behavioral advertising
                        </strong>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "#6b7280",
                            margin: 0,
                          }}
                        >
                          Sharing cookie data with ad platforms (e.g. Meta
                          Pixel, Google Ads) so they can serve targeted ads.
                          Enable this if you use marketing or advertising
                          cookies.
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={answers.sharesData}
                          onChange={(e) => set("sharesData", e.target.checked)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>
                  {answers.usesMarketing && !answers.sharesData && (
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#b45309",
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: "6px",
                        padding: "0.6rem 0.875rem",
                        margin: "0.5rem 0 0",
                      }}
                    >
                      You have marketing cookies enabled but &ldquo;Share&rdquo;
                      is off. Most marketing cookies (Meta Pixel, Google Ads)
                      constitute &ldquo;Sharing&rdquo; under CPRA. Consider
                      enabling this.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 6: Contact & Generate */}
          {step === 5 && (
            <div className="wizard-fields">
              <div className="wizard-field">
                <label>
                  Privacy / Cookie Contact Email{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={answers.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  placeholder="privacy@yourcompany.com"
                />
              </div>
              <div className="wizard-field">
                <label>Effective Date</label>
                <input
                  type="date"
                  value={answers.effectiveDate}
                  onChange={(e) => set("effectiveDate", e.target.value)}
                />
              </div>

              <div className="wizard-generate-preview">
                <div className="wizard-generate-icon">
                  <Sparkles size={24} />
                </div>
                <p>
                  Your cookie policy is ready to generate based on your answers.
                </p>
                <button
                  className="btn-generate"
                  onClick={handleGenerate}
                  disabled={
                    isSaving || !answers.websiteName || !answers.contactEmail
                  }
                >
                  {isSaving
                    ? "Generating..."
                    : isEditing
                      ? "Regenerate Policy"
                      : "Generate Cookie Policy"}
                </button>
                {(!answers.websiteName || !answers.contactEmail) && (
                  <p className="wizard-validation-note">
                    Please fill in your website name (Step 1) and contact email
                    before generating.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="wizard-nav">
          <button
            className="wizard-btn-secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 && (
            <button
              className="wizard-btn-primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
