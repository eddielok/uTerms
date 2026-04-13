import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiPrefillButton } from "../components/AiPrefillButton";
import { useCookieConfig } from "../context/CookieContext";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_EULA_ANSWERS,
  generateEULA,
  type EULAAnswers,
} from "../utils/generateEULA";
import "./PrivacyPolicyWizard.css";

const STEPS = [
  {
    title: "App & Publisher Info",
    description: "Tell us about your application and company",
  },
  {
    title: "Licence Grant",
    description: "Define the scope of the licence you are granting",
  },
  {
    title: "Restrictions",
    description: "What users are not permitted to do with the Software",
  },
  {
    title: "IP & Third-Party Components",
    description: "Intellectual property and embedded libraries",
  },
  {
    title: "Updates, Support & Privacy",
    description: "How updates, support, and data collection work",
  },
  {
    title: "Termination & Liability",
    description: "When the licence ends and limits on your liability",
  },
  {
    title: "Governing Law & Generate",
    description: "Jurisdiction, dispute resolution, and final details",
  },
];

const PLATFORMS = [
  "Windows",
  "macOS",
  "Linux",
  "iOS",
  "Android",
  "Web",
  "Other",
];

const COUNTRIES = [
  "England and Wales",
  "Scotland",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Singapore",
  "India",
  "Other",
];

export const EULAWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  // Apply localStorage prefill from Policy Scan (new policies only)
  useEffect(() => {
    if (!isEditing) {
      try {
        const stored = localStorage.getItem('uterms_prefill_eula');
        if (stored) setAnswers(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<EULAAnswers>(DEFAULT_EULA_ANSWERS);
  const [policyTitle, setPolicyTitle] = useState("End User License Agreement");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from("eula")
          .select("title, answers")
          .eq("id", id)
          .single();
        if (data) {
          setPolicyTitle(data.title);
          setAnswers({ ...DEFAULT_EULA_ANSWERS, ...data.answers });
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof EULAAnswers>(key: K, value: EULAAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const togglePlatform = (platform: string) => {
    setAnswers((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const generated = generateEULA(answers);
      const payload = {
        user_id: userId,
        title: policyTitle,
        answers,
        generated,
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await supabase.from("eula").update(payload).eq("id", id);
        navigate(`/eula/${id}/preview`);
      } else {
        const { data } = await supabase
          .from("eula")
          .insert(payload)
          .select("id")
          .single();
        if (data) navigate(`/eula/${data.id}/preview`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="wizard-loading">Loading...</div>;
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="wizard-fields">
            <AiPrefillButton
              policyType="eula"
              websiteUrl={answers.websiteUrl}
              onUrlChange={(url) => set("websiteUrl", url)}
              onResult={(analysis) => setAnswers((prev) => ({ ...prev, ...analysis }))}
            />
            <div className="wizard-field">
              <label>
                Application Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. MyApp"
                value={answers.appName}
                onChange={(e) => set("appName", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>
                Company / Publisher Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme Ltd"
                value={answers.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>App Version (optional)</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. 2.1.0"
                value={answers.appVersion}
                onChange={(e) => set("appVersion", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website URL</label>
              <input
                type="url"
                className="wizard-input"
                placeholder="https://yourwebsite.com"
                value={answers.websiteUrl}
                onChange={(e) => set("websiteUrl", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Supported Platforms</label>
              <div
                className="wizard-checkboxes"
                style={{ marginTop: "0.25rem" }}
              >
                {PLATFORMS.map((p) => (
                  <label key={p} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.platforms.includes(p)}
                      onChange={() => togglePlatform(p)}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="wizard-field">
              <label>Country / Jurisdiction</label>
              <select
                className="wizard-select"
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
        );

      case 1:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Licence Type</label>
              <div
                className="wizard-checkboxes"
                style={{ marginTop: "0.25rem" }}
              >
                {[
                  { value: "personal", label: "Personal use only" },
                  { value: "commercial", label: "Commercial use" },
                  { value: "both", label: "Personal and commercial use" },
                ].map((opt) => (
                  <label key={opt.value} className="wizard-checkbox-item">
                    <input
                      type="radio"
                      name="licenseType"
                      value={opt.value}
                      checked={answers.licenseType === opt.value}
                      onChange={() =>
                        set(
                          "licenseType",
                          opt.value as EULAAnswers["licenseType"],
                        )
                      }
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.isNonExclusive}
                  onChange={(e) => set("isNonExclusive", e.target.checked)}
                />
                <span>
                  Non-exclusive licence{" "}
                  <span style={{ color: "#6b7280" }}>
                    (standard — user does not get sole rights)
                  </span>
                </span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.isNonTransferable}
                  onChange={(e) => set("isNonTransferable", e.target.checked)}
                />
                <span>
                  Non-transferable licence{" "}
                  <span style={{ color: "#6b7280" }}>
                    (user cannot assign the licence to another person)
                  </span>
                </span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.allowsMultipleDevices}
                  onChange={(e) =>
                    set("allowsMultipleDevices", e.target.checked)
                  }
                />
                <span>Allow installation on unlimited devices</span>
              </label>
              {!answers.allowsMultipleDevices && (
                <div
                  className="wizard-field"
                  style={{ paddingLeft: "1.5rem", marginTop: "0.25rem" }}
                >
                  <label>Maximum number of devices</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. 1"
                    value={answers.numberOfDevices}
                    onChange={(e) => set("numberOfDevices", e.target.value)}
                  />
                </div>
              )}
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.allowsFamilySharing}
                  onChange={(e) => set("allowsFamilySharing", e.target.checked)}
                />
                <span>
                  Allow family sharing (e.g. Apple Family Sharing, Google Play
                  Family Library)
                </span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Prohibited activities</label>
              <p className="wizard-hint" style={{ marginTop: 0 }}>
                Select all that apply. Standard restrictions are always
                included.
              </p>
              <div
                className="wizard-checkboxes"
                style={{ marginTop: "0.5rem" }}
              >
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.prohibitsReverseEngineering}
                    onChange={(e) =>
                      set("prohibitsReverseEngineering", e.target.checked)
                    }
                  />
                  <span>Reverse engineer or disassemble the Software</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.prohibitsDecompilation}
                    onChange={(e) =>
                      set("prohibitsDecompilation", e.target.checked)
                    }
                  />
                  <span>
                    Decompile or translate the Software into human-readable form
                  </span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.prohibitsRedistribution}
                    onChange={(e) =>
                      set("prohibitsRedistribution", e.target.checked)
                    }
                  />
                  <span>
                    Copy, distribute, publish, or sublicense the Software to
                    third parties
                  </span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.prohibitsRenting}
                    onChange={(e) => set("prohibitsRenting", e.target.checked)}
                  />
                  <span>
                    Rent, lease, or lend the Software for compensation
                  </span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.prohibitsModification}
                    onChange={(e) =>
                      set("prohibitsModification", e.target.checked)
                    }
                  />
                  <span>
                    Modify, adapt, or create derivative works based on the
                    Software
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-fields">
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasThirdPartyComponents}
                  onChange={(e) =>
                    set("hasThirdPartyComponents", e.target.checked)
                  }
                />
                <span>
                  The Software includes third-party open-source or licensed
                  components
                </span>
              </label>
              {answers.hasThirdPartyComponents && (
                <div
                  className="wizard-field"
                  style={{ paddingLeft: "1.5rem", marginTop: "0.25rem" }}
                >
                  <label>Description (optional)</label>
                  <textarea
                    className="wizard-textarea"
                    placeholder="e.g. This Software uses OpenSSL (Apache License 2.0) and React (MIT License). Licence notices are included in the NOTICES file distributed with the Software."
                    value={answers.thirdPartyComponentsDescription}
                    onChange={(e) =>
                      set("thirdPartyComponentsDescription", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              )}
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasInAppPurchases}
                  onChange={(e) => set("hasInAppPurchases", e.target.checked)}
                />
                <span>The Software offers In-App Purchases</span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasUserGeneratedContent}
                  onChange={(e) =>
                    set("hasUserGeneratedContent", e.target.checked)
                  }
                />
                <span>
                  Users can create or submit content within the Software
                </span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-fields">
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.providesUpdates}
                  onChange={(e) => set("providesUpdates", e.target.checked)}
                />
                <span>
                  We provide updates, patches, or new versions of the Software
                </span>
              </label>
              {answers.providesUpdates && (
                <label
                  className="wizard-checkbox-item"
                  style={{ paddingLeft: "1.5rem" }}
                >
                  <input
                    type="checkbox"
                    checked={answers.updatesAreAutomatic}
                    onChange={(e) =>
                      set("updatesAreAutomatic", e.target.checked)
                    }
                  />
                  <span>Updates are installed automatically</span>
                </label>
              )}
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.providesSupport}
                  onChange={(e) => set("providesSupport", e.target.checked)}
                />
                <span>We provide technical support for the Software</span>
              </label>
              {answers.providesSupport && (
                <div
                  className="wizard-field"
                  style={{ paddingLeft: "1.5rem", marginTop: "0.25rem" }}
                >
                  <label>Support email</label>
                  <input
                    type="email"
                    className="wizard-input"
                    placeholder="support@yourcompany.com"
                    value={answers.supportEmail}
                    onChange={(e) => set("supportEmail", e.target.value)}
                  />
                </div>
              )}
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.collectsData}
                  onChange={(e) => set("collectsData", e.target.checked)}
                />
                <span>
                  The Software collects or processes personal data from users
                </span>
              </label>
              {answers.collectsData && (
                <div
                  className="wizard-field"
                  style={{ paddingLeft: "1.5rem", marginTop: "0.25rem" }}
                >
                  <label>Privacy Policy URL (optional)</label>
                  <input
                    type="url"
                    className="wizard-input"
                    placeholder="https://yourwebsite.com/privacy-policy"
                    value={answers.privacyPolicyUrl}
                    onChange={(e) => set("privacyPolicyUrl", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-fields">
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.terminationForBreach}
                  onChange={(e) =>
                    set("terminationForBreach", e.target.checked)
                  }
                />
                <span>
                  Licence terminates automatically if user breaches this
                  Agreement
                </span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.userCanTerminate}
                  onChange={(e) => set("userCanTerminate", e.target.checked)}
                />
                <span>
                  User can terminate the licence at any time by uninstalling the
                  Software
                </span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.disclaimsWarranties}
                  onChange={(e) => set("disclaimsWarranties", e.target.checked)}
                />
                <span>
                  Disclaim all warranties (Software provided &ldquo;as
                  is&rdquo;)
                </span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.limitationOfLiability}
                  onChange={(e) =>
                    set("limitationOfLiability", e.target.checked)
                  }
                />
                <span>Include limitation of liability clause</span>
              </label>
              {answers.limitationOfLiability && (
                <div
                  className="wizard-field"
                  style={{ paddingLeft: "1.5rem", marginTop: "0.25rem" }}
                >
                  <label>Liability cap (optional)</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. the amount paid for the Software in the twelve months preceding the claim"
                    value={answers.liabilityCap}
                    onChange={(e) => set("liabilityCap", e.target.value)}
                  />
                </div>
              )}
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.requiresIndemnification}
                  onChange={(e) =>
                    set("requiresIndemnification", e.target.checked)
                  }
                />
                <span>Require users to indemnify the company</span>
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Governing law (jurisdiction)</label>
              <select
                className="wizard-select"
                value={answers.governingLaw}
                onChange={(e) => set("governingLaw", e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="wizard-field">
              <label>Dispute resolution</label>
              <select
                className="wizard-select"
                value={answers.disputeResolution}
                onChange={(e) =>
                  set(
                    "disputeResolution",
                    e.target.value as EULAAnswers["disputeResolution"],
                  )
                }
              >
                <option value="courts">Exclusive court jurisdiction</option>
                <option value="arbitration">Binding arbitration</option>
                <option value="negotiation">Informal negotiation first</option>
              </select>
            </div>
            <div className="wizard-field">
              <label>
                Contact email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="wizard-input"
                placeholder="legal@yourcompany.com"
                value={answers.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Effective date</label>
              <input
                type="date"
                className="wizard-input"
                value={answers.effectiveDate}
                onChange={(e) => set("effectiveDate", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Document title</label>
              <input
                type="text"
                className="wizard-input"
                value={policyTitle}
                onChange={(e) => setPolicyTitle(e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <button className="wizard-back-btn" onClick={() => navigate("/eula")}>
          <ArrowLeft size={16} /> Back to EULAs
        </button>
        <h1>{isEditing ? "Edit EULA" : "Create EULA"}</h1>
      </div>

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

      <div className="wizard-card">
        <div className="wizard-step-header">
          <span className="wizard-step-badge">
            Step {step + 1} of {STEPS.length}
          </span>
          <h2>{STEPS[step].title}</h2>
          <p className="wizard-step-desc">{STEPS[step].description}</p>
        </div>

        {renderStep()}

        <div className="wizard-nav">
          <button
            className="wizard-btn-secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button
              className="wizard-btn-primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={
                isSaving ||
                !answers.appName ||
                !answers.companyName ||
                !answers.contactEmail
              }
            >
              <Sparkles size={16} />
              {isSaving ? "Generating..." : "Generate EULA"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
