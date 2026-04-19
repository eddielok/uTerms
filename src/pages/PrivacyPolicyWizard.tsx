import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePrefillFromStorage } from "../hooks/usePrefillFromStorage";
import { useNavigate, useParams } from "react-router-dom";
import { AiPrefillButton } from "../components/AiPrefillButton";
import { useCookieConfig } from "../context/CookieContext";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_ANSWERS,
  generatePrivacyPolicy,
  type WizardAnswers,
  type ScannedCategory,
  type ScannedProvider,
  type ScannedCookie,
} from "../utils/generatePrivacyPolicy";
import "./PrivacyPolicyWizard.css";

const STEPS = [
  { title: "Business Information", description: "Tell us about your business" },
  {
    title: "Data You Collect",
    description: "What personal information do you collect from users?",
  },
  {
    title: "Why You Collect It",
    description: "For what purposes do you use this data?",
  },
  {
    title: "Third-Party Sharing",
    description: "Do you share data with other companies?",
  },
  {
    title: "User Rights",
    description: "What privacy rights do you grant your users?",
  },
  {
    title: "Cookies & Tracking",
    description: "How do you use cookies on your website?",
  },
  {
    title: "Contact & Generate",
    description: "Provide contact details and generate your policy",
  },
];

const COOKIE_TYPE_OPTIONS = [
  "Essential",
  "Functional",
  "Analytics",
  "Marketing",
  "Social Media",
  "Unclassified",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "England and Wales",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Singapore",
  "India",
  "Other",
];

export const PrivacyPolicyWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId, scannedData } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(DEFAULT_ANSWERS);
  const [policyTitle, setPolicyTitle] = useState("Privacy Policy");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  usePrefillFromStorage('uterms_prefill_privacy_policy', setAnswers, isEditing);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isCookieListExpanded, setIsCookieListExpanded] = useState(false);

  // Load existing policy when editing
  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from("privacy_policies")
          .select("title, answers")
          .eq("id", id)
          .single();
        if (data) {
          setPolicyTitle(data.title);
          setAnswers({ ...DEFAULT_ANSWERS, ...data.answers });
        }
        setIsLoading(false);
      })();
    } else {
      // Auto-fill from scanned data for new policies
      if (scannedData) {
        // Collect types
        const typesFound: string[] = [];
        const hasEssential = scannedData.categories.some(
          (c) =>
            c.id === "essential" &&
            c.providers.some((p) => p.cookies.length > 0),
        );
        const hasFunctional = scannedData.categories.some(
          (c) =>
            c.id === "functional" &&
            c.providers.some((p) => p.cookies.length > 0),
        );
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
        const hasSocial = scannedData.categories.some(
          (c) =>
            c.id === "social" && c.providers.some((p) => p.cookies.length > 0),
        );
        const hasUnclassified = scannedData.categories.some(
          (c) =>
            (c.id === "unclassified" || c.name === "Unclassified") &&
            c.providers.some((p) => p.cookies.length > 0),
        );

        if (hasEssential) typesFound.push("Essential");
        if (hasFunctional) typesFound.push("Functional");
        if (hasAnalytics) typesFound.push("Analytics");
        if (hasMarketing) typesFound.push("Marketing");
        if (hasSocial) typesFound.push("Social Media");
        if (hasUnclassified) {
          typesFound.push("Unclassified");
        }

        setAnswers((prev) => ({
          ...prev,
          websiteUrl: prev.websiteUrl || scannedData.url || "",
          usesCookies: scannedData.cookiesCount > 0,
          cookieTypes:
            typesFound.length > 0 ? typesFound : DEFAULT_ANSWERS.cookieTypes,
          cookiePolicyUrl:
            prev.cookiePolicyUrl ||
            (scannedData.url ? `${scannedData.url}/cookie-policy` : ""),
          scannedCookies: scannedData, // Save the full scan data
        }));
      } else {
        setIsLoading(false);
      }
    }
  }, [id, isEditing, scannedData]);

  const set = <K extends keyof WizardAnswers>(
    key: K,
    value: WizardAnswers[K],
  ) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCookieType = (type: string) => {
    setAnswers((prev) => ({
      ...prev,
      cookieTypes: prev.cookieTypes.includes(type)
        ? prev.cookieTypes.filter((t) => t !== type)
        : [...prev.cookieTypes, type],
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const generated = generatePrivacyPolicy(answers);
      const payload = {
        user_id: userId,
        title: policyTitle,
        answers,
        generated,
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await supabase.from("privacy_policies").update(payload).eq("id", id);
        navigate(`/policy-management/${id}/preview`);
      } else {
        const { data } = await supabase
          .from("privacy_policies")
          .insert(payload)
          .select("id")
          .single();
        if (data) navigate(`/policy-management/${data.id}/preview`);
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
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
          onClick={() => navigate("/policy-management")}
        >
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? "Edit Privacy Policy" : "Create Privacy Policy"}</h1>
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
          {/* Step 1: Business Info */}
          {step === 0 && (
            <div className="wizard-fields">
              <AiPrefillButton
                policyType="privacy_policy"
                websiteUrl={answers.websiteUrl}
                onUrlChange={(url) => set("websiteUrl", url)}
                onResult={(analysis) => setAnswers((prev) => ({
                  ...prev,
                  ...analysis,
                  scannedCookies: prev.scannedCookies,
                  cookieTypes: (analysis.cookieTypes as string[])?.length > 0
                    ? analysis.cookieTypes as string[]
                    : prev.cookieTypes,
                }))}
              />

              {step === 0 && (
                <div className="wizard-field">
                  <label>Policy Title</label>
                  <input
                    type="text"
                    value={policyTitle}
                    onChange={(e) => setPolicyTitle(e.target.value)}
                    placeholder="e.g. Privacy Policy"
                  />
                </div>
              )}
              <div className="wizard-field">
                <label>
                  Company / Website Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={answers.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="wizard-row">
                <div className="wizard-field">
                  <label>Country</label>
                  <select
                    value={answers.country}
                    onChange={(e) => set("country", e.target.value)}
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="wizard-field">
                  <label>State / Province</label>
                  <input
                    type="text"
                    value={answers.state}
                    onChange={(e) => set("state", e.target.value)}
                    placeholder="e.g. California"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Data Collection */}
          {step === 1 && (
            <div className="wizard-fields">
              <p className="wizard-field-hint">
                Select all types of personal data you collect from users:
              </p>
              <div className="wizard-checkboxes">
                {(
                  [
                    ["collectsName", "Full name"],
                    ["collectsEmail", "Email address"],
                    ["collectsPhone", "Phone number"],
                    ["collectsAddress", "Physical address"],
                    ["collectsPayment", "Payment / billing information"],
                    ["collectsDeviceInfo", "Device & browser information"],
                    ["collectsUsageData", "Usage & interaction data"],
                    ["collectsLocation", "Location data"],
                  ] as [keyof WizardAnswers, string][]
                ).map(([key, label]) => (
                  <label key={key} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers[key] as boolean}
                      onChange={(e) => set(key, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Purpose */}
          {step === 2 && (
            <div className="wizard-fields">
              <p className="wizard-field-hint">
                Why do you collect and use this personal data?
              </p>
              <div className="wizard-checkboxes">
                {(
                  [
                    [
                      "purposeServiceDelivery",
                      "To provide and maintain our services",
                    ],
                    [
                      "purposeMarketing",
                      "To send marketing & promotional communications",
                    ],
                    ["purposeAnalytics", "To analyse and improve our services"],
                    ["purposeLegal", "To comply with legal obligations"],
                    [
                      "purposeSecurity",
                      "To ensure platform security and fraud prevention",
                    ],
                  ] as [keyof WizardAnswers, string][]
                ).map(([key, label]) => (
                  <label key={key} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers[key] as boolean}
                      onChange={(e) => set(key, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Third-Party Sharing */}
          {step === 3 && (
            <div className="wizard-fields">
              <div className="wizard-toggle-field">
                <div>
                  <strong>
                    Do you share personal data with third parties?
                  </strong>
                  <p className="wizard-field-hint">
                    This includes service providers, partners, or vendors.
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
              {answers.sharesData && (
                <div className="wizard-checkboxes mt-4">
                  <p className="wizard-field-hint">Select all that apply:</p>
                  {(
                    [
                      ["sharesWithAdNetworks", "Advertising networks"],
                      ["sharesWithAnalytics", "Analytics providers (e.g. Google Analytics)"],
                      ["sharesWithPaymentProcessors", "Payment processors (e.g. Stripe)"],
                      ["sharesWithSocialMedia", "Social media platforms"],
                      ["sharesWithCloud", "Cloud / hosting providers"],
                    ] as [keyof WizardAnswers, string][]
                  ).map(([key, label]) => (
                    <label key={key} className="wizard-checkbox-item">
                      <input
                        type="checkbox"
                        checked={answers[key] as boolean}
                        onChange={(e) => set(key, e.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                  {answers.sharesWithAnalytics && (
                    <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                      <input
                        type="checkbox"
                        checked={answers.analyticsIpAnonymization}
                        onChange={(e) => set("analyticsIpAnonymization", e.target.checked)}
                      />
                      <span>
                        IP Anonymization enabled{" "}
                        <span style={{ color: "#6b7280", fontWeight: 400 }}>
                          — Google truncates IPs before storage (recommended for GDPR/UK GDPR)
                        </span>
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 5: User Rights */}
          {step === 4 && (
            <div className="wizard-fields">
              <p className="wizard-field-hint">
                Select the rights you grant to your users (GDPR / CCPA):
              </p>
              <div className="wizard-toggles">
                {(
                  [
                    [
                      "rightToAccess",
                      "Right to Access",
                      "Users can request a copy of their data",
                    ],
                    [
                      "rightToDeletion",
                      "Right to Erasure",
                      "Users can request deletion of their data",
                    ],
                    [
                      "rightToPortability",
                      "Right to Portability",
                      "Users can export their data in a portable format",
                    ],
                    [
                      "rightToRestriction",
                      "Right to Restriction",
                      "Users can limit how their data is processed",
                    ],
                    [
                      "rightToOptOut",
                      "Right to Opt-Out",
                      "Users can opt out of data sale or sharing",
                    ],
                  ] as [keyof WizardAnswers, string, string][]
                ).map(([key, label, desc]) => (
                  <div key={key} className="wizard-toggle-field">
                    <div>
                      <strong>{label}</strong>
                      <p className="wizard-field-hint">{desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={answers[key] as boolean}
                        onChange={(e) => set(key, e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Cookies */}
          {step === 5 && (
            <div className="wizard-fields">
              <div className="wizard-toggle-field">
                <div>
                  <strong>Do you use cookies or tracking technologies?</strong>
                  <p className="wizard-field-hint">
                    Includes cookies, pixels, local storage, etc.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={answers.usesCookies}
                    onChange={(e) => set("usesCookies", e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              {answers.usesCookies && (
                <>
                  <div className="wizard-field mt-4">
                    <label>Cookie types you use:</label>
                    <div className="wizard-checkboxes">
                      {COOKIE_TYPE_OPTIONS.map((type) => (
                        <div key={type} className="w-full">
                          <label className="wizard-checkbox-item">
                            <input
                              type="checkbox"
                              checked={answers.cookieTypes.includes(type)}
                              onChange={() => toggleCookieType(type)}
                            />
                            <span>{type}</span>
                          </label>
                          {type === "Unclassified" &&
                            answers.cookieTypes.includes("Unclassified") && (
                              <div className="ml-7 mt-4 mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Unclassified Cookies Description{" "}
                                  <span className="required">*</span>
                                </label>
                                <textarea
                                  className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none"
                                  placeholder="Describe how you use unclassified cookies..."
                                  value={
                                    answers.unclassifiedCookiesDescription || ""
                                  }
                                  onChange={(e) =>
                                    set(
                                      "unclassifiedCookiesDescription",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  rows={3}
                                />
                                {!answers.unclassifiedCookiesDescription && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Description is required for unclassified
                                    cookies.
                                  </p>
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {answers.scannedCookies &&
                    (answers.scannedCookies.cookiesCount ?? 0) > 0 && (
                      <div className="wizard-field mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-800 mb-2">
                          Detected Cookies (
                          {answers.scannedCookies.cookiesCount})
                        </p>

                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-gray-500">
                            We will automatically include a detailed table of
                            these cookies in your policy.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setIsCookieListExpanded(!isCookieListExpanded)
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline ml-4 flex-shrink-0"
                          >
                            {isCookieListExpanded
                              ? "Hide Details"
                              : "Show Details"}
                          </button>
                        </div>

                        {isCookieListExpanded && (
                          <div className="compact-cookie-list-container">
                            {answers.scannedCookies.categories.map(
                              (cat: ScannedCategory) =>
                                cat.providers.some(
                                  (p: ScannedProvider) => p.cookies.length > 0,
                                ) && (
                                  <div
                                    key={cat.id}
                                    className="compact-cookie-category"
                                  >
                                    <h4 className="compact-cookie-category-header">
                                      <span
                                        className={`compact-cookie-dot ${cat.id} ${
                                          ![
                                            "essential",
                                            "functional",
                                            "analytics",
                                            "marketing",
                                            "social",
                                            "unclassified",
                                          ].includes(cat.id)
                                            ? "default"
                                            : ""
                                        }`}
                                      ></span>
                                      {cat.name}
                                    </h4>
                                    <div className="compact-cookie-items">
                                      {cat.providers.map((p: ScannedProvider) =>
                                        p.cookies.map(
                                          (c: ScannedCookie, cookieIndex: number) => (
                                            <div
                                              key={`${c.name}-${cookieIndex}`}
                                              className="compact-cookie-item"
                                            >
                                              <div className="compact-cookie-item-header">
                                                <div className="compact-cookie-name">
                                                  {c.name}
                                                </div>
                                                <div className="compact-cookie-domain">
                                                  {c.domain}
                                                </div>
                                              </div>

                                              <div className="compact-cookie-desc">
                                                {c.description || (
                                                  <span className="compact-cookie-desc-empty">
                                                    No description available
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ),
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ),
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  <div className="wizard-field">
                    <label>Cookie Policy URL (optional)</label>
                    <input
                      type="url"
                      value={answers.cookiePolicyUrl}
                      onChange={(e) => set("cookiePolicyUrl", e.target.value)}
                      placeholder="https://www.example.com/cookie-policy"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 7: Contact & Generate */}
          {step === 6 && (
            <div className="wizard-fields">
              <div className="wizard-field">
                <label>
                  Privacy Contact Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={answers.privacyEmail}
                  onChange={(e) => set("privacyEmail", e.target.value)}
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
              <div className="wizard-field">
                <label>How will you notify users of policy changes?</label>
                <select
                  value={answers.notificationMethod}
                  onChange={(e) => set("notificationMethod", e.target.value)}
                >
                  <option value="website">
                    Post updated policy on the website
                  </option>
                  <option value="email">Email notification</option>
                  <option value="both">Both email and website</option>
                </select>
              </div>

              <div className="wizard-generate-preview">
                <div className="wizard-generate-icon">
                  <Sparkles size={24} />
                </div>
                <p>
                  Your privacy policy is ready to generate based on your
                  answers.
                </p>
                {saveError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>{saveError}</p>}
                <button
                  className="btn-generate"
                  onClick={handleGenerate}
                  disabled={
                    isSaving || !answers.companyName || !answers.privacyEmail
                  }
                >
                  {isSaving
                    ? "Generating..."
                    : isEditing
                      ? "Regenerate Policy"
                      : "Generate Privacy Policy"}
                </button>
                {(!answers.companyName || !answers.privacyEmail) && (
                  <p className="wizard-validation-note">
                    Please fill in your company name (Step 1) and privacy email
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
              disabled={
                step === 5 &&
                answers.cookieTypes.includes("Unclassified") &&
                !answers.unclassifiedCookiesDescription
              }
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
