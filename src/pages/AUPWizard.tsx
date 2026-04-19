import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePrefillFromStorage } from '../hooks/usePrefillFromStorage';
import { useNavigate, useParams } from 'react-router-dom';
import { AiPrefillButton } from '../components/AiPrefillButton';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import {
  ALL_PROHIBITED_ACTIVITIES,
  ALL_PROHIBITED_CONTENT,
  DEFAULT_AUP_ANSWERS,
  generateAUP,
  type AUPAnswers,
} from '../utils/generateAUP';
import './PrivacyPolicyWizard.css';

const STEPS = [
  { title: 'Business Info', description: 'Tell us about your business and platform' },
  { title: 'Platform & Users', description: 'Who uses the platform and how accounts work' },
  { title: 'Prohibited Activities', description: 'What users must never do on your platform' },
  { title: 'Content Standards', description: 'Rules around user-submitted content' },
  { title: 'Enforcement & Consequences', description: 'How violations are handled' },
  { title: 'Legal & Generate', description: 'Jurisdiction, dispute resolution, and final details' },
];

const PLATFORM_TYPES = [
  { value: 'saas', label: 'SaaS / Web Application' },
  { value: 'hosting', label: 'Web Hosting / Cloud Platform' },
  { value: 'community', label: 'Online Community / Forum' },
  { value: 'educational', label: 'Educational Platform' },
  { value: 'corporate', label: 'Corporate / Enterprise Network' },
  { value: 'marketplace', label: 'Online Marketplace' },
  { value: 'social', label: 'Social Network' },
  { value: 'publishing', label: 'Content Publishing Platform' },
  { value: 'other', label: 'Other' },
];

const USER_TYPES = [
  'General public',
  'Registered members',
  'Employees / staff',
  'Students / educators',
  'Business customers / clients',
  'Developers / API users',
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

export const AUPWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AUPAnswers>(DEFAULT_AUP_ANSWERS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  usePrefillFromStorage('uterms_prefill_aup', setAnswers, isEditing);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from('acceptable_use_policy')
          .select('title, answers')
          .eq('id', id)
          .single();
        if (data) {
          setAnswers({ ...DEFAULT_AUP_ANSWERS, ...data.answers, policyTitle: data.title });
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof AUPAnswers>(key: K, value: AUPAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = <K extends keyof AUPAnswers>(key: K, item: string) => {
    setAnswers(prev => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item],
      };
    });
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const generated = generateAUP(answers);
      const payload = {
        user_id: userId,
        title: answers.policyTitle || 'Acceptable Use Policy',
        answers,
        generated,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await supabase.from('acceptable_use_policy').update(payload).eq('id', id);
        navigate(`/acceptable-use-policy/${id}/preview`);
      } else {
        const { data } = await supabase
          .from('acceptable_use_policy')
          .insert(payload)
          .select('id')
          .single();
        if (data) navigate(`/acceptable-use-policy/${data.id}/preview`);
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
              policyType="aup"
              websiteUrl={answers.websiteUrl}
              onUrlChange={(url) => set('websiteUrl', url)}
              onResult={(analysis) => setAnswers((prev) => ({ ...prev, ...analysis }))}
            />
            <div className="wizard-field">
              <label>Company / Business Name <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme Ltd"
                value={answers.companyName}
                onChange={e => set('companyName', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website URL <span className="req">*</span></label>
              <input
                type="url"
                className="wizard-input"
                placeholder="https://yourwebsite.com"
                value={answers.websiteUrl}
                onChange={e => set('websiteUrl', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Platform Type</label>
              <select
                className="wizard-select"
                value={answers.platformType}
                onChange={e => set('platformType', e.target.value)}
              >
                {PLATFORM_TYPES.map(pt => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
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
            </div>
          </div>
        );

      case 1:
        return (
          <div className="wizard-fields">
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.requiresAccount}
                  onChange={e => set('requiresAccount', e.target.checked)}
                />
                <span>Users must register an account to use the platform</span>
              </label>
            </div>
            {answers.requiresAccount && (
              <div className="wizard-field" style={{ paddingLeft: '1.5rem' }}>
                <label>Minimum age requirement</label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="e.g. 13"
                  value={answers.minimumAge}
                  onChange={e => set('minimumAge', e.target.value)}
                />
                <p className="wizard-hint">Leave blank to omit age clause.</p>
              </div>
            )}
            <div className="wizard-field" style={{ marginTop: '0.5rem' }}>
              <label>Who uses the platform?</label>
              <p className="wizard-hint">Select all that apply.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {USER_TYPES.map(ut => (
                  <label key={ut} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.userTypes.includes(ut)}
                      onChange={() => toggleArrayItem('userTypes', ut)}
                    />
                    <span>{ut}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.handlesSensitiveData}
                  onChange={e => set('handlesSensitiveData', e.target.checked)}
                />
                <span>
                  The platform handles sensitive personal data{' '}
                  <span style={{ color: '#6b7280' }}>— adds UK/EU GDPR data handling reminder</span>
                </span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-fields">
            <p className="wizard-hint">Select all prohibited activities that apply to your platform. We recommend selecting all unless you have a specific reason to exclude one.</p>
            <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
              {ALL_PROHIBITED_ACTIVITIES.map(act => (
                <label key={act.id} className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.prohibitedActivities.includes(act.id)}
                    onChange={() => toggleArrayItem('prohibitedActivities', act.id)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{act.label}</span>
                </label>
              ))}
            </div>
            {answers.prohibitedActivities.length === 0 && (
              <p className="wizard-hint" style={{ color: '#f59e0b', marginTop: '0.75rem' }}>
                No activities selected — the full default list will be used.
              </p>
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
                  onChange={e => set('allowsUGC', e.target.checked)}
                />
                <span>Users can post, upload, or submit content (User-Generated Content)</span>
              </label>
            </div>
            {answers.allowsUGC ? (
              <>
                <div className="wizard-field" style={{ marginTop: '0.75rem' }}>
                  <label>Prohibited content types</label>
                  <p className="wizard-hint">Select all content types that are not allowed on your platform.</p>
                  <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                    {ALL_PROHIBITED_CONTENT.map(c => (
                      <label key={c.id} className="wizard-checkbox-item">
                        <input
                          type="checkbox"
                          checked={answers.prohibitedContent.includes(c.id)}
                          onChange={() => toggleArrayItem('prohibitedContent', c.id)}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="wizard-checkboxes" style={{ marginTop: '0.75rem' }}>
                  <label className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.dmcaCompliant}
                      onChange={e => set('dmcaCompliant', e.target.checked)}
                    />
                    <span>
                      Include DMCA / copyright takedown procedure{' '}
                      <span style={{ color: '#6b7280' }}>— required if serving US users</span>
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <p className="wizard-hint" style={{ marginTop: '0.75rem' }}>
                The Content Standards section will be omitted from your policy.
              </p>
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
                  checked={answers.canSuspend}
                  onChange={e => set('canSuspend', e.target.checked)}
                />
                <span>We can suspend or permanently terminate accounts for violations</span>
              </label>
              {answers.canSuspend && (
                <>
                  <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={answers.immediateTermination}
                      onChange={e => set('immediateTermination', e.target.checked)}
                    />
                    <span>
                      Serious violations (e.g. CSAM, hacking) result in immediate termination without notice
                    </span>
                  </label>
                  <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={answers.hasAppealProcess}
                      onChange={e => set('hasAppealProcess', e.target.checked)}
                    />
                    <span>Users can appeal enforcement decisions within 14 days</span>
                  </label>
                </>
              )}
            </div>
            <div className="wizard-checkboxes" style={{ marginTop: '0.75rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.cooperatesWithLawEnforcement}
                  onChange={e => set('cooperatesWithLawEnforcement', e.target.checked)}
                />
                <span>
                  We cooperate with law enforcement and regulatory authorities{' '}
                  <span style={{ color: '#6b7280' }}>— adds a dedicated Law Enforcement section</span>
                </span>
              </label>
              {answers.cooperatesWithLawEnforcement && (
                <label className="wizard-checkbox-item" style={{ paddingLeft: '1.5rem' }}>
                  <input
                    type="checkbox"
                    checked={answers.dataRetentionAfterTermination}
                    onChange={e => set('dataRetentionAfterTermination', e.target.checked)}
                  />
                  <span>We may retain data after account termination to support investigations</span>
                </label>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Governing law (jurisdiction)</label>
              <select
                className="wizard-select"
                value={answers.governingLaw}
                onChange={e => set('governingLaw', e.target.value)}
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="wizard-field">
              <label>Dispute resolution</label>
              <select
                className="wizard-select"
                value={answers.disputeResolution}
                onChange={e => set('disputeResolution', e.target.value as AUPAnswers['disputeResolution'])}
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
                onChange={e => set('contactEmail', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Effective date</label>
              <input
                type="date"
                className="wizard-input"
                value={answers.effectiveDate}
                onChange={e => set('effectiveDate', e.target.value)}
              />
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
        <button className="wizard-back-btn" onClick={() => navigate('/acceptable-use-policy')}>
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? 'Edit Acceptable Use Policy' : 'Create Acceptable Use Policy'}</h1>
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
                disabled={isSaving || !answers.companyName || !answers.contactEmail}
              >
                <Sparkles size={16} />
                {isSaving ? 'Generating...' : 'Generate Acceptable Use Policy'}
              </button>
              {saveError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>{saveError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
