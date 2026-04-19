import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePrefillFromStorage } from '../hooks/usePrefillFromStorage';
import { useNavigate, useParams } from 'react-router-dom';
import { AiPrefillButton } from '../components/AiPrefillButton';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_DISCLAIMER_ANSWERS,
  generateDisclaimer,
  type DisclaimerAnswers,
} from '../utils/generateDisclaimer';
import './PrivacyPolicyWizard.css';

const STEPS = [
  { title: 'Business Info', description: 'Tell us about your website or business' },
  { title: 'Disclaimer Types', description: 'Select the types of disclaimers that apply' },
  { title: 'Liability & Accuracy', description: 'Set your accuracy and liability positions' },
  { title: 'Professional Advice', description: 'Configure professional advice warnings' },
  { title: 'Affiliate & FTC', description: 'Disclose affiliate relationships and earnings' },
  { title: 'Contact & Generate', description: 'Final details and generate your disclaimer' },
];

const BUSINESS_TYPES = [
  'Blog / Content Website',
  'E-commerce Store',
  'SaaS / Software',
  'Healthcare / Medical',
  'Financial Services',
  'Legal Services',
  'Professional Services',
  'News / Media',
  'Education',
  'Other',
];

const COUNTRIES = [
  'England and Wales',
  'Scotland',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Singapore',
  'India',
  'Other',
];

export const DisclaimerWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<DisclaimerAnswers>(DEFAULT_DISCLAIMER_ANSWERS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  usePrefillFromStorage('uterms_prefill_disclaimer', setAnswers, isEditing);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from('disclaimer')
          .select('answers')
          .eq('id', id)
          .single();
        if (data) {
          setAnswers({ ...DEFAULT_DISCLAIMER_ANSWERS, ...data.answers });
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof DisclaimerAnswers>(key: K, value: DisclaimerAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const generated = generateDisclaimer(answers);
      const payload = {
        user_id: userId,
        title: answers.policyTitle || 'Disclaimer',
        answers,
        generated,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await supabase.from('disclaimer').update(payload).eq('id', id);
        navigate(`/disclaimer/${id}/preview`);
      } else {
        const { data } = await supabase
          .from('disclaimer')
          .insert(payload)
          .select('id')
          .single();
        if (data) navigate(`/disclaimer/${data.id}/preview`);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="wizard-loading">Loading...</div>;
  }

  const hasProfessionalTypes =
    answers.professionalAdvice || answers.medicalHealth || answers.financialInvestment || answers.legalAdvice;
  const hasAffiliateTypes = answers.affiliateLinks || answers.testimonials;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="wizard-fields">
            <AiPrefillButton
              policyType="disclaimer"
              websiteUrl={answers.websiteUrl}
              onUrlChange={(url) => set('websiteUrl', url)}
              onResult={(analysis) => setAnswers((prev) => ({ ...prev, ...analysis }))}
            />
            <div className="wizard-field">
              <label>Company / Website Name <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme Blog"
                value={answers.companyName}
                onChange={(e) => set('companyName', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website URL</label>
              <input
                type="url"
                className="wizard-input"
                placeholder="https://example.com"
                value={answers.websiteUrl}
                onChange={(e) => set('websiteUrl', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Business / Website Type</label>
              <select
                className="wizard-select"
                value={answers.businessType}
                onChange={(e) => set('businessType', e.target.value)}
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="wizard-field">
              <label>Country / Jurisdiction</label>
              <select
                className="wizard-select"
                value={answers.country}
                onChange={(e) => set('country', e.target.value)}
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
              <label>Which types of disclaimer apply to your website?</label>
              <p className="wizard-hint">Select all that apply. Each type generates a dedicated section in your disclaimer.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.75rem' }}>
                {[
                  {
                    key: 'generalInfo',
                    label: 'General Information',
                    desc: 'Content is for informational purposes only and should not be relied on',
                  },
                  {
                    key: 'professionalAdvice',
                    label: 'Not Professional Advice',
                    desc: 'Content is not a substitute for qualified professional advice',
                  },
                  {
                    key: 'medicalHealth',
                    label: 'Medical / Health',
                    desc: 'Content does not constitute medical advice; consult a doctor',
                  },
                  {
                    key: 'financialInvestment',
                    label: 'Financial / Investment',
                    desc: 'Content is not financial advice; not a regulated financial adviser',
                  },
                  {
                    key: 'legalAdvice',
                    label: 'Legal Advice',
                    desc: 'Content is not legal advice; no attorney-client relationship formed',
                  },
                  {
                    key: 'affiliateLinks',
                    label: 'Affiliate Links & Earnings',
                    desc: 'Site uses affiliate links or earns commissions (FTC / ASA disclosure)',
                  },
                  {
                    key: 'aiContent',
                    label: 'AI-Generated Content',
                    desc: 'Some content may be produced or assisted by AI tools',
                  },
                  {
                    key: 'testimonials',
                    label: 'Testimonials & Results',
                    desc: 'Site features testimonials; individual results may vary',
                  },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="wizard-checkbox-item" style={{ alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      style={{ marginTop: '2px' }}
                      checked={answers[key as keyof DisclaimerAnswers] as boolean}
                      onChange={(e) => set(key as keyof DisclaimerAnswers, e.target.checked)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <span style={{ display: 'block', color: '#6b7280', fontSize: '0.8125rem', marginTop: '1px' }}>{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label style={{ fontWeight: 600 }}>Accuracy & Completeness</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.noAccuracyGuarantee}
                    onChange={(e) => set('noAccuracyGuarantee', e.target.checked)}
                  />
                  <span>No guarantee of accuracy or completeness</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.contentMayBeOutdated}
                    onChange={(e) => set('contentMayBeOutdated', e.target.checked)}
                  />
                  <span>Content may be outdated and is not guaranteed to be current</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.rightToChange}
                    onChange={(e) => set('rightToChange', e.target.checked)}
                  />
                  <span>Reserve the right to change or remove content without notice</span>
                </label>
              </div>
            </div>

            <div className="wizard-field" style={{ marginTop: '1rem' }}>
              <label style={{ fontWeight: 600 }}>External Links</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.externalLinksDisclaimer}
                    onChange={(e) => set('externalLinksDisclaimer', e.target.checked)}
                  />
                  <span>Not responsible for the content or availability of external/third-party links</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.externalSitesOwnPolicies}
                    onChange={(e) => set('externalSitesOwnPolicies', e.target.checked)}
                  />
                  <span>External websites are governed by their own terms and policies</span>
                </label>
              </div>
            </div>

            <div className="wizard-field" style={{ marginTop: '1rem' }}>
              <label style={{ fontWeight: 600 }}>User Risk & Liability</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.userAssumesRisk}
                    onChange={(e) => set('userAssumesRisk', e.target.checked)}
                  />
                  <span>User uses this website and its content at their own risk</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.noLiabilityForDamages}
                    onChange={(e) => set('noLiabilityForDamages', e.target.checked)}
                  />
                  <span>No liability for direct, indirect, or consequential damages arising from use</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-fields">
            {!hasProfessionalTypes && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '8px',
                  padding: '0.875rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#92400e',
                }}
              >
                <strong>No professional disclaimer types selected.</strong> Go back to Step 2 and enable Medical, Financial, Legal, or Professional Advice to configure this step.
              </div>
            )}

            <div className="wizard-field">
              <label>Which professionals should users be directed to consult?</label>
              <p className="wizard-hint">Select all that are relevant to your content.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {[
                  { key: 'recommendDoctor', label: 'Doctor / physician' },
                  { key: 'recommendLawyer', label: 'Lawyer / solicitor' },
                  { key: 'recommendFinancialAdvisor', label: 'Authorised financial adviser' },
                  { key: 'recommendAccountant', label: 'Qualified accountant' },
                  { key: 'recommendMentalHealth', label: 'Licensed mental health professional' },
                ].map(({ key, label }) => (
                  <label key={key} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers[key as keyof DisclaimerAnswers] as boolean}
                      onChange={(e) => set(key as keyof DisclaimerAnswers, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {answers.medicalHealth && (
              <div className="wizard-checkboxes" style={{ marginTop: '0.75rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.emergencyServicesNotice}
                    onChange={(e) => set('emergencyServicesNotice', e.target.checked)}
                  />
                  <span>
                    Include emergency services notice{' '}
                    <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                      — strongly recommended for health/medical content
                    </span>
                  </span>
                </label>
              </div>
            )}

            <div className="wizard-checkboxes" style={{ marginTop: '0.75rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.notLicensedInJurisdiction}
                  onChange={(e) => set('notLicensedInJurisdiction', e.target.checked)}
                />
                <span>
                  Add jurisdiction notice{' '}
                  <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                    — state that we are not licensed in every jurisdiction and regulations vary by location
                  </span>
                </span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-fields">
            {!hasAffiliateTypes && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '8px',
                  padding: '0.875rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#92400e',
                }}
              >
                <strong>No affiliate or testimonial types selected.</strong> Go back to Step 2 and enable Affiliate Links or Testimonials to configure this step.
              </div>
            )}

            {answers.affiliateLinks && (
              <div className="wizard-field">
                <label style={{ fontWeight: 600 }}>Affiliate & Sponsorship</label>
                <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                  <label className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.ftcDisclosure}
                      onChange={(e) => set('ftcDisclosure', e.target.checked)}
                    />
                    <span>
                      Include FTC / ASA disclosure statement{' '}
                      <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                        — required by law in the US and UK for affiliate and sponsored content
                      </span>
                    </span>
                  </label>
                  <label className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.sponsoredContent}
                      onChange={(e) => set('sponsoredContent', e.target.checked)}
                    />
                    <span>Some content may be sponsored or paid for by third parties</span>
                  </label>
                </div>
              </div>
            )}

            <div className="wizard-field" style={{ marginTop: answers.affiliateLinks ? '1rem' : 0 }}>
              <label style={{ fontWeight: 600 }}>Earnings & Results</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.noIncomeGuarantee}
                    onChange={(e) => set('noIncomeGuarantee', e.target.checked)}
                  />
                  <span>No guarantee of income, earnings, or financial results</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.pastResultsNotTypical}
                    onChange={(e) => set('pastResultsNotTypical', e.target.checked)}
                  />
                  <span>Past results are not indicative of future results</span>
                </label>
                {answers.testimonials && (
                  <label className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.testimonialsNotTypical}
                      onChange={(e) => set('testimonialsNotTypical', e.target.checked)}
                    />
                    <span>Testimonials may not be typical; individual results will vary</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Contact Email <span className="req">*</span></label>
              <input
                type="email"
                className="wizard-input"
                placeholder="contact@yourcompany.com"
                value={answers.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Effective Date</label>
              <input
                type="date"
                className="wizard-input"
                value={answers.effectiveDate}
                onChange={(e) => set('effectiveDate', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Document Title</label>
              <input
                type="text"
                className="wizard-input"
                value={answers.policyTitle}
                onChange={(e) => set('policyTitle', e.target.value)}
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
        <button className="wizard-back-btn" onClick={() => navigate('/disclaimer')}>
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? 'Edit Disclaimer' : 'Create Disclaimer'}</h1>
      </div>

      <div className="wizard-progress">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`wizard-step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
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
            <>
              <button
                className="btn-generate"
                onClick={handleGenerate}
                disabled={isSaving || !answers.companyName || !answers.contactEmail}
              >
                <Sparkles size={16} />
                {isSaving ? 'Generating...' : 'Generate Disclaimer'}
              </button>
              {saveError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>{saveError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
