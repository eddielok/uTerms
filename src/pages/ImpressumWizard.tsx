import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_IMPRESSUM_ANSWERS,
  generateImpressum,
  type EntityType,
  type ImpressumAnswers,
  type OutputLanguage,
  type OperatingCountry,
} from '../utils/generateImpressum';
import './PrivacyPolicyWizard.css';

const STEPS = [
  { title: 'Entity & Location', description: 'Legal entity type, operating country, and output language' },
  { title: 'Address & Registration', description: 'Registered address, commercial register, and tax details' },
  { title: 'Contact Details', description: 'Phone, email, and website' },
  { title: 'Responsible Persons', description: 'Managing directors and editorial responsibility' },
  { title: 'Professional & Regulatory', description: 'Regulated professions and supervisory authority' },
  { title: 'Dispute Resolution & Generate', description: 'ODR, consumer dispute, and final details' },
];

const ENTITY_TYPES: { value: EntityType; label: string; hint?: string }[] = [
  { value: 'individual', label: 'Private Individual' },
  { value: 'sole-trader', label: 'Sole Trader (Einzelunternehmen)' },
  { value: 'freelancer', label: 'Freelancer (Freiberufler)' },
  { value: 'gbr', label: 'GbR (Civil Law Partnership)' },
  { value: 'gmbh', label: 'GmbH', hint: 'Requires Handelsregister entry' },
  { value: 'ug', label: 'UG (haftungsbeschränkt)', hint: 'Requires Handelsregister entry' },
  { value: 'ag', label: 'AG (Stock Corporation)', hint: 'Requires Handelsregister entry' },
  { value: 'ohg', label: 'OHG (General Partnership)' },
  { value: 'kg', label: 'KG / GmbH & Co. KG' },
  { value: 'ev', label: 'e.V. (Registered Association)' },
  { value: 'other', label: 'Other' },
];

const REGISTERED_ENTITIES: EntityType[] = ['gmbh', 'ug', 'ag', 'ohg', 'kg'];
const NEEDS_REPRESENTATIVE: EntityType[] = ['gmbh', 'ug', 'ag', 'ohg', 'kg', 'ev'];

const COUNTRIES_DE = [
  'Deutschland', 'Österreich', 'Schweiz', 'United Kingdom', 'United States',
  'France', 'Netherlands', 'Singapore', 'Other',
];

export const ImpressumWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ImpressumAnswers>(DEFAULT_IMPRESSUM_ANSWERS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from('impressum')
          .select('title, answers')
          .eq('id', id)
          .single();
        if (data) {
          setAnswers({ ...DEFAULT_IMPRESSUM_ANSWERS, ...data.answers, policyTitle: data.title });
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof ImpressumAnswers>(key: K, value: ImpressumAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const setRep = (index: number, value: string) => {
    setAnswers(prev => {
      const reps = [...prev.representatives];
      reps[index] = value;
      return { ...prev, representatives: reps };
    });
  };

  const addRep = () => setAnswers(prev => ({ ...prev, representatives: [...prev.representatives, ''] }));

  const removeRep = (index: number) => {
    setAnswers(prev => ({
      ...prev,
      representatives: prev.representatives.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const generated = generateImpressum(answers);
      const payload = {
        user_id: userId,
        title: answers.policyTitle || 'Impressum',
        answers,
        generated,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };
      if (isEditing && id) {
        await supabase.from('impressum').update(payload).eq('id', id);
        navigate(`/impressum/${id}/preview`);
      } else {
        const { data } = await supabase.from('impressum').insert(payload).select('id').single();
        if (data) navigate(`/impressum/${data.id}/preview`);
      }
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
            <div className="wizard-field">
              <label>Legal Entity Type <span className="req">*</span></label>
              <select
                className="wizard-select"
                value={answers.entityType}
                onChange={e => set('entityType', e.target.value as EntityType)}
              >
                {ENTITY_TYPES.map(et => (
                  <option key={et.value} value={et.value}>{et.label}</option>
                ))}
              </select>
              {ENTITY_TYPES.find(et => et.value === answers.entityType)?.hint && (
                <p className="wizard-hint">{ENTITY_TYPES.find(et => et.value === answers.entityType)?.hint}</p>
              )}
            </div>
            <div className="wizard-field">
              <label>Full Legal Name <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme GmbH or Max Mustermann"
                value={answers.companyName}
                onChange={e => set('companyName', e.target.value)}
              />
              <p className="wizard-hint">Use the exact name as registered — including legal suffix (GmbH, e.V., etc.).</p>
            </div>
            <div className="wizard-field">
              <label>Operating Country</label>
              <select
                className="wizard-select"
                value={answers.operatingCountry}
                onChange={e => set('operatingCountry', e.target.value as OperatingCountry)}
              >
                <option value="de">Germany — § 5 TMG / § 18 MStV</option>
                <option value="at">Austria — § 25 MedienG / § 5 ECG</option>
                <option value="ch">Switzerland — Art. 3 UWG</option>
                <option value="other">Other</option>
              </select>
              <p className="wizard-hint">Determines which legal citations appear in the header.</p>
            </div>
            <div className="wizard-field">
              <label>Output Language</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {([
                  { value: 'de', label: 'German only (Deutsch)' },
                  { value: 'en', label: 'English only' },
                  { value: 'both', label: 'Both — German first, then English translation' },
                ] as { value: OutputLanguage; label: string }[]).map(opt => (
                  <label key={opt.value} className="wizard-checkbox-item">
                    <input
                      type="radio"
                      name="language"
                      value={opt.value}
                      checked={answers.language === opt.value}
                      onChange={() => set('language', opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Street &amp; House Number <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Musterstraße 123"
                value={answers.street}
                onChange={e => set('street', e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
              <div className="wizard-field">
                <label>Postcode <span className="req">*</span></label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="e.g. 10115"
                  value={answers.postcode}
                  onChange={e => set('postcode', e.target.value)}
                />
              </div>
              <div className="wizard-field">
                <label>City <span className="req">*</span></label>
                <input
                  type="text"
                  className="wizard-input"
                  placeholder="e.g. Berlin"
                  value={answers.city}
                  onChange={e => set('city', e.target.value)}
                />
              </div>
            </div>
            <div className="wizard-field">
              <label>State / Bundesland (optional)</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Berlin, Bayern, Zürich"
                value={answers.state}
                onChange={e => set('state', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Country</label>
              <select
                className="wizard-select"
                value={answers.country}
                onChange={e => set('country', e.target.value)}
              >
                {COUNTRIES_DE.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {REGISTERED_ENTITIES.includes(answers.entityType) && (
              <>
                <div className="wizard-field" style={{ marginTop: '0.5rem' }}>
                  <label>Registration Court (Registergericht)</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Amtsgericht Berlin (Charlottenburg)"
                    value={answers.registrationCourt}
                    onChange={e => set('registrationCourt', e.target.value)}
                  />
                </div>
                <div className="wizard-field">
                  <label>Registration Number (HRB / HRA)</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. HRB 123456 B"
                    value={answers.registrationNumber}
                    onChange={e => set('registrationNumber', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="wizard-field">
              <label>VAT ID (USt-IdNr.)</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. DE123456789"
                value={answers.vatId}
                onChange={e => set('vatId', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Tax Number (Steuernummer) — if no VAT ID</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. 12/345/67890"
                value={answers.taxNumber}
                onChange={e => set('taxNumber', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Phone Number <span className="req">*</span></label>
              <input
                type="tel"
                className="wizard-input"
                placeholder="e.g. +49 30 123456"
                value={answers.phone}
                onChange={e => set('phone', e.target.value)}
              />
              <p className="wizard-hint">Required by § 5 TMG. Must be reachable — a contact form alone is not sufficient.</p>
            </div>
            <div className="wizard-field">
              <label>Fax Number (optional)</label>
              <input
                type="tel"
                className="wizard-input"
                placeholder="e.g. +49 30 123457"
                value={answers.fax}
                onChange={e => set('fax', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Email Address <span className="req">*</span></label>
              <input
                type="email"
                className="wizard-input"
                placeholder="e.g. info@yourcompany.de"
                value={answers.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website URL</label>
              <input
                type="url"
                className="wizard-input"
                placeholder="https://yourwebsite.de"
                value={answers.websiteUrl}
                onChange={e => set('websiteUrl', e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-fields">
            {NEEDS_REPRESENTATIVE.includes(answers.entityType) && (
              <div className="wizard-field">
                <label>
                  {answers.entityType === 'ev' ? 'Board Members (Vorstand)' : 'Managing Directors (Geschäftsführer)'}
                  {' '}<span className="req">*</span>
                </label>
                <p className="wizard-hint">Add each person's full name on a separate line.</p>
                {answers.representatives.map((rep, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="wizard-input"
                      style={{ flex: 1 }}
                      placeholder="Full name"
                      value={rep}
                      onChange={e => setRep(i, e.target.value)}
                    />
                    {answers.representatives.length > 1 && (
                      <button
                        type="button"
                        className="pm-btn-icon danger"
                        onClick={() => removeRep(i)}
                        style={{ flexShrink: 0 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="wizard-btn-secondary"
                  style={{ marginTop: '0.25rem' }}
                  onClick={addRep}
                >
                  <Plus size={14} /> Add Person
                </button>
              </div>
            )}

            <div className="wizard-checkboxes" style={{ marginTop: '0.75rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasEditorialContent}
                  onChange={e => set('hasEditorialContent', e.target.checked)}
                />
                <span>
                  The website publishes journalistic or editorial content{' '}
                  <span style={{ color: '#6b7280' }}>— requires a named editorial responsible person (§ 18 Abs. 2 MStV)</span>
                </span>
              </label>
            </div>

            {answers.hasEditorialContent && (
              <>
                <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <label>Editorial Responsible Person (full name) <span className="req">*</span></label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Max Mustermann"
                    value={answers.editorialPerson}
                    onChange={e => set('editorialPerson', e.target.value)}
                  />
                </div>
                <div className="wizard-field" style={{ paddingLeft: '1.5rem' }}>
                  <label>Address (if different from company address)</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Musterstraße 1, 10115 Berlin"
                    value={answers.editorialAddress}
                    onChange={e => set('editorialAddress', e.target.value)}
                  />
                </div>
              </>
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
                  checked={answers.isRegulatedProfession}
                  onChange={e => set('isRegulatedProfession', e.target.checked)}
                />
                <span>
                  The operator practises a regulated profession{' '}
                  <span style={{ color: '#6b7280' }}>(e.g. lawyer, doctor, tax advisor, architect, financial advisor)</span>
                </span>
              </label>
            </div>

            {answers.isRegulatedProfession && (
              <>
                <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <label>Professional Title <span className="req">*</span></label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Rechtsanwalt, Steuerberater, Arzt"
                    value={answers.professionalTitle}
                    onChange={e => set('professionalTitle', e.target.value)}
                  />
                </div>
                <div className="wizard-field" style={{ paddingLeft: '1.5rem' }}>
                  <label>Country / State where title was awarded</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Deutschland, Bayern"
                    value={answers.titleAwardedIn}
                    onChange={e => set('titleAwardedIn', e.target.value)}
                  />
                </div>
                <div className="wizard-field" style={{ paddingLeft: '1.5rem' }}>
                  <label>Chamber / Professional Association (Kammer)</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Rechtsanwaltskammer Berlin"
                    value={answers.chamber}
                    onChange={e => set('chamber', e.target.value)}
                  />
                </div>
                <div className="wizard-field" style={{ paddingLeft: '1.5rem' }}>
                  <label>Supervisory Authority (Aufsichtsbehörde)</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Rechtsanwaltskammer Berlin"
                    value={answers.supervisoryAuthority}
                    onChange={e => set('supervisoryAuthority', e.target.value)}
                  />
                </div>
                <div className="wizard-field" style={{ paddingLeft: '1.5rem' }}>
                  <label>Applicable Professional Regulations</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. Bundesrechtsanwaltsordnung (BRAO), Berufsordnung (BORA)"
                    value={answers.professionalRegulations}
                    onChange={e => set('professionalRegulations', e.target.value)}
                  />
                </div>
                <div className="wizard-checkboxes" style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  <label className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.hasInsurance}
                      onChange={e => set('hasInsurance', e.target.checked)}
                    />
                    <span>Include professional liability insurance details</span>
                  </label>
                </div>
                {answers.hasInsurance && (
                  <>
                    <div className="wizard-field" style={{ paddingLeft: '3rem', marginTop: '0.5rem' }}>
                      <label>Insurance Provider</label>
                      <input
                        type="text"
                        className="wizard-input"
                        placeholder="e.g. Allianz Versicherungs-AG"
                        value={answers.insuranceProvider}
                        onChange={e => set('insuranceProvider', e.target.value)}
                      />
                    </div>
                    <div className="wizard-field" style={{ paddingLeft: '3rem' }}>
                      <label>Coverage Area / Geltungsbereich</label>
                      <input
                        type="text"
                        className="wizard-input"
                        placeholder="e.g. Europa, Weltweit"
                        value={answers.insuranceCoverage}
                        onChange={e => set('insuranceCoverage', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {!answers.isRegulatedProfession && (
              <p className="wizard-hint" style={{ marginTop: '0.75rem' }}>
                The professional information section will be omitted from your Impressum.
              </p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="wizard-fields">
            {(answers.operatingCountry === 'de' || answers.operatingCountry === 'at') && (
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#92400e' }}>
                <strong>Mandatory (EU Regulation 524/2013):</strong> The EU ODR link is legally required for all online sellers operating in Germany and Austria. It will always be included regardless of the toggle below.
              </div>
            )}
            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.euODR || answers.operatingCountry === 'de' || answers.operatingCountry === 'at'}
                  disabled={answers.operatingCountry === 'de' || answers.operatingCountry === 'at'}
                  onChange={e => set('euODR', e.target.checked)}
                />
                <span>
                  Link to EU Online Dispute Resolution (ODR) platform{' '}
                  {(answers.operatingCountry === 'de' || answers.operatingCountry === 'at')
                    ? <strong style={{ color: '#b45309' }}> — mandatory under EU Regulation 524/2013</strong>
                    : <span style={{ color: '#6b7280' }}>— required for B2C online shops selling to EU consumers</span>
                  }
                </span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.consumerDisputeParticipation}
                  onChange={e => set('consumerDisputeParticipation', e.target.checked)}
                />
                <span>
                  We participate in consumer arbitration proceedings{' '}
                  <span style={{ color: '#6b7280' }}>— leave unchecked to include the standard opt-out statement</span>
                </span>
              </label>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.includeliabilityDisclaimer}
                  onChange={e => set('includeliabilityDisclaimer', e.target.checked)}
                />
                <span>Include liability disclaimer for content, links, and copyright</span>
              </label>
            </div>

            <div className="wizard-field" style={{ marginTop: '0.75rem' }}>
              <label>Effective Date (Stand)</label>
              <input
                type="date"
                className="wizard-input"
                value={answers.effectiveDate}
                onChange={e => set('effectiveDate', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Document Title</label>
              <input
                type="text"
                className="wizard-input"
                value={answers.policyTitle}
                onChange={e => set('policyTitle', e.target.value)}
              />
              <p className="wizard-hint">Typically "Impressum" or "Impressum / Legal Notice".</p>
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
        <button className="wizard-back-btn" onClick={() => navigate('/impressum')}>
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? 'Edit Impressum' : 'Create Impressum'}</h1>
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
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={isSaving || !answers.companyName || !answers.email}
            >
              <Sparkles size={16} />
              {isSaving ? 'Generating...' : 'Generate Impressum'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
