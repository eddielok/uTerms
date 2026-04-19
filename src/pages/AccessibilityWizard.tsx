import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePrefillFromStorage } from '../hooks/usePrefillFromStorage';
import { useNavigate, useParams } from 'react-router-dom';
import { AiPrefillButton } from '../components/AiPrefillButton';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import {
  ALL_TECHNOLOGIES,
  ALL_TESTING_APPROACHES,
  DEFAULT_ACCESSIBILITY_ANSWERS,
  generateAccessibilityStatement,
  type AccessibilityAnswers,
  type ComplianceStatus,
  type ConformanceLevel,
  type KnownIssue,
  type Sector,
  type StandardReferenced,
  type WCAGVersion,
} from '../utils/generateAccessibilityStatement';
import './PrivacyPolicyWizard.css';

const STEPS = [
  { title: 'Organisation & Website', description: 'Your organisation name, website details, and jurisdiction' },
  { title: 'Compliance Status', description: 'Which standard you are assessed against and your current level' },
  { title: 'Known Issues', description: 'Document known accessibility barriers and exemptions' },
  { title: 'Technical Information', description: 'Technologies relied on and how you tested the site' },
  { title: 'Feedback & Contact', description: 'How users can report accessibility issues' },
  { title: 'Enforcement & Generate', description: 'Complaints procedure, dates, and final details' },
];

const COUNTRIES = [
  'United Kingdom',
  'Germany',
  'Austria',
  'United States',
  'Australia',
  'Canada',
  'France',
  'Netherlands',
  'Ireland',
  'Singapore',
  'Other',
];

export const AccessibilityWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AccessibilityAnswers>(DEFAULT_ACCESSIBILITY_ANSWERS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  usePrefillFromStorage('uterms_prefill_accessibility', setAnswers, isEditing);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from('accessibility_statement')
          .select('title, answers')
          .eq('id', id)
          .single();
        if (data) {
          setAnswers({ ...DEFAULT_ACCESSIBILITY_ANSWERS, ...data.answers, policyTitle: data.title });
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof AccessibilityAnswers>(key: K, value: AccessibilityAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'technologiesReliedOn' | 'testingApproaches', item: string) => {
    setAnswers(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item] };
    });
  };

  const updateIssue = (index: number, field: keyof KnownIssue, value: string) => {
    setAnswers(prev => {
      const issues = prev.knownIssues.map((issue, i) =>
        i === index ? { ...issue, [field]: value } : issue
      );
      return { ...prev, knownIssues: issues };
    });
  };

  const addIssue = () => {
    setAnswers(prev => ({
      ...prev,
      knownIssues: [...prev.knownIssues, { title: '', description: '', workaround: '' }],
    }));
  };

  const removeIssue = (index: number) => {
    setAnswers(prev => ({
      ...prev,
      knownIssues: prev.knownIssues.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const generated = generateAccessibilityStatement(answers);
      const payload = {
        user_id: userId,
        title: answers.policyTitle || 'Accessibility Statement',
        answers,
        generated,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };
      if (isEditing && id) {
        await supabase.from('accessibility_statement').update(payload).eq('id', id);
        navigate(`/accessibility-statement/${id}/preview`);
      } else {
        const { data } = await supabase
          .from('accessibility_statement')
          .insert(payload)
          .select('id')
          .single();
        if (data) navigate(`/accessibility-statement/${data.id}/preview`);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="wizard-loading">Loading...</div>;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="wizard-fields">
            <AiPrefillButton
              policyType="accessibility"
              websiteUrl={answers.websiteUrl}
              onUrlChange={(url) => set('websiteUrl', url)}
              onResult={(analysis) => setAnswers((prev) => ({ ...prev, ...analysis }))}
            />
            <div className="wizard-field">
              <label>Organisation Name <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme Ltd"
                value={answers.organisationName}
                onChange={e => set('organisationName', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website / App Name <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme Customer Portal"
                value={answers.websiteName}
                onChange={e => set('websiteName', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website URL</label>
              <input
                type="url"
                className="wizard-input"
                placeholder="https://yourwebsite.com"
                value={answers.websiteUrl}
                onChange={e => set('websiteUrl', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Sector</label>
              <select
                className="wizard-select"
                value={answers.sector}
                onChange={e => set('sector', e.target.value as Sector)}
              >
                <option value="public">Public sector / Government</option>
                <option value="private">Private sector / Commercial</option>
                <option value="non-profit">Non-profit / Charity</option>
                <option value="education">Education</option>
              </select>
              {answers.sector === 'public' && (
                <p className="wizard-hint" style={{ color: '#b45309' }}>
                  Public sector bodies are legally required to publish an accessibility statement under the Public Sector Bodies Accessibility Regulations 2018 (UK) or equivalent.
                </p>
              )}
            </div>
            <div className="wizard-field">
              <label>Country / Jurisdiction</label>
              <select
                className="wizard-select"
                value={answers.country}
                onChange={e => set('country', e.target.value)}
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="wizard-hint">Used to determine the correct enforcement authority and legal references.</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Accessibility Standard Referenced</label>
              <select
                className="wizard-select"
                value={answers.standardReferenced}
                onChange={e => set('standardReferenced', e.target.value as StandardReferenced)}
              >
                <option value="wcag">WCAG — Web Content Accessibility Guidelines (most common)</option>
                <option value="en301549">EN 301 549 (EU standard — incorporates WCAG)</option>
                <option value="section508">Section 508 (US federal / government)</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="wizard-field">
                <label>WCAG Version</label>
                <select
                  className="wizard-select"
                  value={answers.wcagVersion}
                  onChange={e => set('wcagVersion', e.target.value as WCAGVersion)}
                >
                  <option value="2.1">WCAG 2.1 (widely adopted)</option>
                  <option value="2.2">WCAG 2.2 (latest, Oct 2023)</option>
                </select>
              </div>
              <div className="wizard-field">
                <label>Conformance Level</label>
                <select
                  className="wizard-select"
                  value={answers.conformanceLevel}
                  onChange={e => set('conformanceLevel', e.target.value as ConformanceLevel)}
                >
                  <option value="A">Level A (minimum)</option>
                  <option value="AA">Level AA (recommended — legal standard)</option>
                  <option value="AAA">Level AAA (highest)</option>
                </select>
                <p className="wizard-hint">AA is the level required by most accessibility regulations.</p>
              </div>
            </div>
            <div className="wizard-field">
              <label>Compliance Status <span className="req">*</span></label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {([
                  { value: 'fully', label: 'Fully compliant', hint: 'All pages meet the standard.' },
                  { value: 'partially', label: 'Partially compliant', hint: 'Most of the site meets the standard, with some known issues.' },
                  { value: 'non', label: 'Not compliant', hint: 'The site does not yet meet the standard.' },
                ] as { value: ComplianceStatus; label: string; hint: string }[]).map(opt => (
                  <label key={opt.value} className="wizard-checkbox-item">
                    <input
                      type="radio"
                      name="complianceStatus"
                      value={opt.value}
                      checked={answers.complianceStatus === opt.value}
                      onChange={() => set('complianceStatus', opt.value)}
                    />
                    <span>
                      <strong>{opt.label}</strong>
                      <span style={{ color: '#6b7280', display: 'block', fontSize: '0.8125rem' }}>{opt.hint}</span>
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
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasKnownIssues}
                  onChange={e => set('hasKnownIssues', e.target.checked)}
                />
                <span>There are known accessibility issues we want to document</span>
              </label>
            </div>

            {answers.hasKnownIssues && (
              <div style={{ marginTop: '0.75rem' }}>
                <p className="wizard-hint">Document each known issue. Be specific — describe the barrier, which WCAG criterion it fails, and any available workaround.</p>
                {answers.knownIssues.map((issue, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>Issue {i + 1}</strong>
                      {answers.knownIssues.length > 1 && (
                        <button type="button" className="pm-btn-icon danger" onClick={() => removeIssue(i)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="wizard-field">
                      <label>Issue title</label>
                      <input
                        type="text"
                        className="wizard-input"
                        placeholder="e.g. Images missing alt text on product pages"
                        value={issue.title}
                        onChange={e => updateIssue(i, 'title', e.target.value)}
                      />
                    </div>
                    <div className="wizard-field">
                      <label>Description</label>
                      <textarea
                        className="wizard-textarea"
                        rows={2}
                        placeholder="e.g. Some product images do not have descriptive alternative text, which fails WCAG 2.1 success criterion 1.1.1 (Non-text Content)."
                        value={issue.description}
                        onChange={e => updateIssue(i, 'description', e.target.value)}
                      />
                    </div>
                    <div className="wizard-field">
                      <label>Workaround (optional)</label>
                      <input
                        type="text"
                        className="wizard-input"
                        placeholder="e.g. Contact us and we will provide a text description of any product."
                        value={issue.workaround}
                        onChange={e => updateIssue(i, 'workaround', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="wizard-btn-secondary" onClick={addIssue}>
                  <Plus size={14} /> Add Another Issue
                </button>
              </div>
            )}

            <div className="wizard-checkboxes" style={{ marginTop: '1rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.claimsDisproportionateBurden}
                  onChange={e => set('claimsDisproportionateBurden', e.target.checked)}
                />
                <span>
                  We are claiming a disproportionate burden exemption for some content{' '}
                  <span style={{ color: '#6b7280' }}>— requires documented justification</span>
                </span>
              </label>
            </div>

            {answers.claimsDisproportionateBurden && (
              <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                <label>Justification <span className="req">*</span></label>
                <textarea
                  className="wizard-textarea"
                  rows={3}
                  placeholder="e.g. Fixing the accessibility of our legacy document archive would require a complete rebuild at an estimated cost of £X, which is disproportionate relative to the estimated benefit given the low usage of this section."
                  value={answers.disproportionateBurdenJustification}
                  onChange={e => set('disproportionateBurdenJustification', e.target.value)}
                />
              </div>
            )}

            <div className="wizard-checkboxes" style={{ marginTop: '0.75rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasOutOfScopeContent}
                  onChange={e => set('hasOutOfScopeContent', e.target.checked)}
                />
                <span>
                  The site contains content that is out of scope of the regulations{' '}
                  <span style={{ color: '#6b7280' }}>(e.g. third-party content, pre-2019 archived documents, live video)</span>
                </span>
              </label>
            </div>

            {answers.hasOutOfScopeContent && (
              <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                <label>Description of out-of-scope content</label>
                <textarea
                  className="wizard-textarea"
                  rows={2}
                  placeholder="e.g. PDFs published before 23 September 2019 that have not been substantially revised, and live video streams."
                  value={answers.outOfScopeDescription}
                  onChange={e => set('outOfScopeDescription', e.target.value)}
                />
              </div>
            )}

            {!answers.hasKnownIssues && !answers.claimsDisproportionateBurden && !answers.hasOutOfScopeContent && (
              <p className="wizard-hint" style={{ marginTop: '0.75rem' }}>
                The Non-accessible Content section will be omitted. Only select &ldquo;Fully compliant&rdquo; in Step 2 if this is accurate.
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Technologies relied on for accessibility</label>
              <p className="wizard-hint">Select all technologies used on your website that accessibility depends on.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                {ALL_TECHNOLOGIES.map(tech => (
                  <label key={tech} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.technologiesReliedOn.includes(tech)}
                      onChange={() => toggleArrayItem('technologiesReliedOn', tech)}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{tech}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="wizard-field" style={{ marginTop: '1rem' }}>
              <label>How was accessibility tested?</label>
              <p className="wizard-hint">Select all approaches used.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {ALL_TESTING_APPROACHES.map(approach => (
                  <label key={approach.id} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.testingApproaches.includes(approach.id)}
                      onChange={() => toggleArrayItem('testingApproaches', approach.id)}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{approach.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Contact Name / Team <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Accessibility Team or Jane Smith"
                value={answers.contactName}
                onChange={e => set('contactName', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Contact Email <span className="req">*</span></label>
              <input
                type="email"
                className="wizard-input"
                placeholder="e.g. accessibility@yourorganisation.com"
                value={answers.contactEmail}
                onChange={e => set('contactEmail', e.target.value)}
              />
              <p className="wizard-hint">Use a dedicated accessibility email address if possible.</p>
            </div>
            <div className="wizard-field">
              <label>Contact Phone (optional)</label>
              <input
                type="tel"
                className="wizard-input"
                placeholder="e.g. +44 20 7946 0000"
                value={answers.contactPhone}
                onChange={e => set('contactPhone', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Response time commitment (working days)</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. 5"
                value={answers.responseTimeDays}
                onChange={e => set('responseTimeDays', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Feedback process description (optional)</label>
              <textarea
                className="wizard-textarea"
                rows={3}
                placeholder="e.g. Please use the email address below to report any accessibility issues you encounter on this website. We will acknowledge your message and work to address the issue as quickly as possible."
                value={answers.feedbackProcess}
                onChange={e => set('feedbackProcess', e.target.value)}
              />
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
                  checked={answers.includeFormalComplaints}
                  onChange={e => set('includeFormalComplaints', e.target.checked)}
                />
                <span>
                  Include a formal complaints / escalation section{' '}
                  <span style={{ color: '#6b7280' }}>— automatically included for public sector</span>
                </span>
              </label>
            </div>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '0.75rem 1rem', marginTop: '0.75rem', fontSize: '0.875rem', color: '#0c4a6e' }}>
              <strong>Enforcement body for {answers.country}:</strong> Based on your jurisdiction, the enforcement section will reference the appropriate authority automatically.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div className="wizard-field">
                <label>Date statement was prepared <span className="req">*</span></label>
                <input
                  type="date"
                  className="wizard-input"
                  value={answers.datePrepared}
                  onChange={e => set('datePrepared', e.target.value)}
                />
              </div>
              <div className="wizard-field">
                <label>Date last reviewed</label>
                <input
                  type="date"
                  className="wizard-input"
                  value={answers.dateLastReviewed}
                  onChange={e => set('dateLastReviewed', e.target.value)}
                />
              </div>
            </div>

            <div className="wizard-field">
              <label>Document title</label>
              <input
                type="text"
                className="wizard-input"
                value={answers.policyTitle}
                onChange={e => set('policyTitle', e.target.value)}
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
        <button className="wizard-back-btn" onClick={() => navigate('/accessibility-statement')}>
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? 'Edit Accessibility Statement' : 'Create Accessibility Statement'}</h1>
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
          <span className="wizard-step-badge">Step {step + 1} of {STEPS.length}</span>
          <h2>{STEPS[step].title}</h2>
          <p className="wizard-step-desc">{STEPS[step].description}</p>
        </div>

        {renderStep()}

        <div className="wizard-nav">
          <button
            className="wizard-btn-secondary"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button className="wizard-btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                className="btn-generate"
                onClick={handleGenerate}
                disabled={isSaving || !answers.organisationName || !answers.contactEmail}
              >
                <Sparkles size={16} />
                {isSaving ? 'Generating...' : 'Generate Accessibility Statement'}
              </button>
              {saveError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>{saveError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
