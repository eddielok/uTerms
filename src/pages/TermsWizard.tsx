import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiPrefillButton } from "../components/AiPrefillButton";
import { useCookieConfig } from "../context/CookieContext";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_TOS_ANSWERS,
  generateTermsOfService,
  type ToSAnswers,
} from "../utils/generateTermsOfService";
import "./PrivacyPolicyWizard.css";

const STEPS = [
  { title: "Business Info", description: "Tell us about your business" },
  { title: "Services & Accounts", description: "Describe your service and user accounts" },
  { title: "Payments & Subscriptions", description: "Billing terms and refund policy" },
  { title: "User-Generated Content", description: "How you handle content created by users" },
  { title: "Intellectual Property", description: "Ownership and prohibited uses" },
  { title: "Liability & Disclaimers", description: "Legal protections for your business" },
  { title: "Governing Law & Generate", description: "Jurisdiction, dispute resolution, and final details" },
];

const BUSINESS_TYPES = [
  { value: "saas", label: "SaaS / Web App" },
  { value: "ecommerce", label: "E-Commerce Store" },
  { value: "marketplace", label: "Online Marketplace" },
  { value: "blog", label: "Blog / Content Site" },
  { value: "app", label: "Mobile / Desktop App" },
  { value: "other", label: "Other" },
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

const DEFAULT_PROHIBITED_USES_OPTIONS = [
  "Use the service for any unlawful purpose or in violation of these Terms",
  "Attempt to gain unauthorized access to any part of the service or its related systems",
  "Transmit any viruses, malware, or other harmful or disruptive code",
  "Harass, abuse, threaten, or harm any other user or third party",
  "Scrape, crawl, or otherwise extract data from the service without our written consent",
  "Resell, sublicense, or otherwise commercialize the service without our written consent",
  "Take any action that imposes an unreasonable or disproportionately large load on our infrastructure, servers, or network resources",
];

export const TermsWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  // Apply localStorage prefill from Policy Scan (new policies only)
  useEffect(() => {
    if (!isEditing) {
      try {
        const stored = localStorage.getItem('uterms_prefill_terms_of_service');
        if (stored) setAnswers(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ToSAnswers>(DEFAULT_TOS_ANSWERS);
  const [policyTitle, setPolicyTitle] = useState("Terms of Service");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from("terms_of_service")
          .select("title, answers")
          .eq("id", id)
          .single();
        if (data) {
          setPolicyTitle(data.title);
          setAnswers({ ...DEFAULT_TOS_ANSWERS, ...data.answers });
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof ToSAnswers>(key: K, value: ToSAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleProhibitedUse = (use: string) => {
    setAnswers((prev) => ({
      ...prev,
      prohibitedUses: prev.prohibitedUses.includes(use)
        ? prev.prohibitedUses.filter((u) => u !== use)
        : [...prev.prohibitedUses, use],
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const generated = generateTermsOfService(answers);
      const payload = {
        user_id: userId,
        title: policyTitle,
        answers,
        generated,
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await supabase.from("terms_of_service").update(payload).eq("id", id);
        navigate(`/terms-of-service/${id}/preview`);
      } else {
        const { data } = await supabase
          .from("terms_of_service")
          .insert(payload)
          .select("id")
          .single();
        if (data) navigate(`/terms-of-service/${data.id}/preview`);
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
              policyType="terms_of_service"
              websiteUrl={answers.websiteUrl}
              onUrlChange={(url) => set("websiteUrl", url)}
              onResult={(analysis) => setAnswers((prev) => ({ ...prev, ...analysis }))}
            />
            <div className="wizard-field">
              <label>Company / Business Name <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme Ltd"
                value={answers.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website URL <span className="req">*</span></label>
              <input
                type="url"
                className="wizard-input"
                placeholder="https://yourwebsite.com"
                value={answers.websiteUrl}
                onChange={(e) => set("websiteUrl", e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Business Type</label>
              <select
                className="wizard-select"
                value={answers.businessType}
                onChange={(e) => set("businessType", e.target.value)}
              >
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>{bt.label}</option>
                ))}
              </select>
            </div>
            <div className="wizard-field">
              <label>Country / Jurisdiction</label>
              <select
                className="wizard-select"
                value={answers.country}
                onChange={(e) => set("country", e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Describe your service (optional)</label>
              <textarea
                className="wizard-textarea"
                placeholder="e.g. a platform for managing customer relationships and automating sales workflows"
                value={answers.serviceDescription}
                onChange={(e) => set("serviceDescription", e.target.value)}
                rows={3}
              />
            </div>
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasThirdPartyFinancialData}
                  onChange={(e) => set("hasThirdPartyFinancialData", e.target.checked)}
                />
                <span>
                  The service integrates or displays third-party financial data{" "}
                  <span style={{ color: "#6b7280" }}>
                    — adds a financial data disclaimer (GDPR Art. 5(1)(d) accuracy + CCPA)
                  </span>
                </span>
              </label>
            </div>
            <div className="wizard-field">
              <label>Minimum age requirement</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. 13"
                value={answers.minimumAge}
                onChange={(e) => set("minimumAge", e.target.value)}
              />
              <p className="wizard-hint">Leave blank to omit age restriction clause.</p>
            </div>
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.requiresAccount}
                  onChange={(e) => set("requiresAccount", e.target.checked)}
                />
                <span>Users must register an account to use the service</span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.canTerminateAccounts}
                  onChange={(e) => set("canTerminateAccounts", e.target.checked)}
                />
                <span>We can suspend or terminate user accounts</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-fields">
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.isPaid}
                  onChange={(e) => set("isPaid", e.target.checked)}
                />
                <span>The service (or some features) requires payment</span>
              </label>
              {answers.isPaid && (
                <>
                  <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={answers.isSubscription}
                      onChange={(e) => set("isSubscription", e.target.checked)}
                    />
                    <span>Billed on a recurring subscription basis</span>
                  </label>
                  {answers.isSubscription && (
                    <>
                      <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                        <input
                          type="checkbox"
                          checked={answers.hasAutoRenewal}
                          onChange={(e) => set("hasAutoRenewal", e.target.checked)}
                        />
                        <span>Subscriptions auto-renew unless cancelled</span>
                      </label>
                      <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                        <label>Cancellation notice period (optional)</label>
                        <input
                          type="text"
                          className="wizard-input"
                          placeholder="e.g. 7 — leave blank if no notice required"
                          value={answers.cancellationNoticeDays}
                          onChange={(e) => set("cancellationNoticeDays", e.target.value)}
                        />
                        <p className="wizard-hint">Number of days' notice required before the next renewal date.</p>
                      </div>
                      <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                        <label>After cancellation, access to paid features is:</label>
                        <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                          <label className="wizard-checkbox-item">
                            <input
                              type="radio"
                              name="cancellationAccess"
                              value="end-of-period"
                              checked={answers.cancellationAccess === 'end-of-period'}
                              onChange={() => set("cancellationAccess", 'end-of-period')}
                            />
                            <span>Retained until end of current billing period <span style={{ color: '#6b7280' }}>(most common)</span></span>
                          </label>
                          <label className="wizard-checkbox-item">
                            <input
                              type="radio"
                              name="cancellationAccess"
                              value="immediate"
                              checked={answers.cancellationAccess === 'immediate'}
                              onChange={() => set("cancellationAccess", 'immediate')}
                            />
                            <span>Cut off immediately upon cancellation</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={answers.hasRefundPolicy}
                      onChange={(e) => set("hasRefundPolicy", e.target.checked)}
                    />
                    <span>We offer refunds within a set period</span>
                  </label>
                  {answers.hasRefundPolicy && (
                    <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                      <label>Refund period</label>
                      <input
                        type="text"
                        className="wizard-input"
                        placeholder="e.g. 14 days"
                        value={answers.refundPeriod}
                        onChange={(e) => set("refundPeriod", e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            {!answers.isPaid && (
              <p className="wizard-hint">This section will be omitted from your Terms since the service is free.</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="wizard-fields">
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.allowsUGC}
                  onChange={(e) => set("allowsUGC", e.target.checked)}
                />
                <span>Users can post, upload, or submit content (User-Generated Content)</span>
              </label>
              {answers.allowsUGC && (
                <>
                  <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={answers.ugcLicenceGrant}
                      onChange={(e) => set("ugcLicenceGrant", e.target.checked)}
                    />
                    <span>Users grant us a licence to use their content for operating the service</span>
                  </label>
                  <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={answers.dmcaCompliant}
                      onChange={(e) => set("dmcaCompliant", e.target.checked)}
                    />
                    <span>Include DMCA / copyright takedown procedure</span>
                  </label>
                </>
              )}
            </div>
            {!answers.allowsUGC && (
              <p className="wizard-hint">The UGC section will be omitted from your Terms.</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="wizard-fields">
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.usersOwnContent}
                  onChange={(e) => set("usersOwnContent", e.target.checked)}
                />
                <span>Users retain ownership of content they create</span>
              </label>
            </div>
            <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasThirdPartyIntegrations}
                  onChange={(e) => set("hasThirdPartyIntegrations", e.target.checked)}
                />
                <span>
                  The service integrates with or links to third-party APIs or services (e.g. banks, financial data providers){" "}
                  <span style={{ color: "#6b7280" }}>— adds a Third-Party Services section (GDPR Art. 13/14 + CCPA)</span>
                </span>
              </label>
            </div>
            <div className="wizard-field" style={{ marginTop: '1rem' }}>
              <label>Prohibited uses</label>
              <p className="wizard-hint">Select all that apply. Leave all unchecked to use the default set.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {DEFAULT_PROHIBITED_USES_OPTIONS.map((use) => (
                  <label key={use} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.prohibitedUses.includes(use)}
                      onChange={() => toggleProhibitedUse(use)}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{use}</span>
                  </label>
                ))}
              </div>
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
                  checked={answers.disclaimsWarranties}
                  onChange={(e) => set("disclaimsWarranties", e.target.checked)}
                />
                <span>Disclaim all warranties (service provided "as is")</span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.limitationOfLiability}
                  onChange={(e) => set("limitationOfLiability", e.target.checked)}
                />
                <span>Include limitation of liability clause</span>
              </label>
              {answers.limitationOfLiability && (
                <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <label>Liability cap (optional)</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. fees paid in the last 12 months"
                    value={answers.liabilityCap}
                    onChange={(e) => set("liabilityCap", e.target.value)}
                  />
                  <p className="wizard-hint">Leave blank for no specified cap.</p>
                </div>
              )}
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.requiresIndemnification}
                  onChange={(e) => set("requiresIndemnification", e.target.checked)}
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
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="wizard-field">
              <label>Dispute resolution</label>
              <select
                className="wizard-select"
                value={answers.disputeResolution}
                onChange={(e) => set("disputeResolution", e.target.value)}
              >
                <option value="courts">Exclusive court jurisdiction</option>
                <option value="arbitration">Binding arbitration</option>
                <option value="negotiation">Informal negotiation first</option>
              </select>
            </div>
            <div className="wizard-field">
              <label>Contact email <span className="req">*</span></label>
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
      {/* Header */}
      <div className="wizard-header">
        <button
          className="wizard-back-btn"
          onClick={() => navigate("/terms-of-service")}
        >
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? "Edit Terms of Service" : "Create Terms of Service"}</h1>
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

        {renderStep()}

        {/* Navigation */}
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
              disabled={isSaving || !answers.companyName || !answers.contactEmail}
            >
              <Sparkles size={16} />
              {isSaving ? "Generating..." : "Generate Terms of Service"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
