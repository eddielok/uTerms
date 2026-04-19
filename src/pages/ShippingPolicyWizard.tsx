import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePrefillFromStorage } from '../hooks/usePrefillFromStorage';
import { useNavigate, useParams } from 'react-router-dom';
import { AiPrefillButton } from '../components/AiPrefillButton';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_SHIPPING_POLICY_ANSWERS,
  generateShippingPolicy,
  type ShippingPolicyAnswers,
} from '../utils/generateShippingPolicy';
import './PrivacyPolicyWizard.css';

const STEPS = [
  { title: 'Business Info', description: 'Tell us about your business' },
  { title: 'Shipping Destinations', description: 'Where do you ship to?' },
  { title: 'Shipping Methods & Costs', description: 'Delivery options and pricing' },
  { title: 'Processing & Dispatch', description: 'How quickly do you ship?' },
  { title: 'Carriers & Tracking', description: 'Who delivers your orders?' },
  { title: 'Special Cases', description: 'Lost packages, damages, and exceptions' },
  { title: 'Contact & Generate', description: 'Final details and generate your policy' },
];

const COUNTRIES = [
  'United Kingdom', 'England and Wales', 'Scotland', 'United States', 'Canada',
  'Australia', 'Germany', 'France', 'Netherlands', 'Singapore', 'India', 'Other',
];

const BUSINESS_TYPES = [
  'E-commerce Store', 'Dropshipper', 'Marketplace Seller', 'Subscription Box', 'Handmade / Craft', 'Other',
];

const CURRENCIES = [
  'GBP (£)', 'USD ($)', 'EUR (€)', 'CAD ($)', 'AUD ($)', 'SGD ($)', 'INR (₹)', 'Other',
];

const CARRIER_OPTIONS = [
  'Royal Mail', 'DHL', 'FedEx', 'UPS', 'Evri (Hermes)', 'DPD', 'USPS',
  'Australia Post', 'Canada Post', 'Deutsche Post', 'La Poste',
];

const PROCESSING_TIME_OPTIONS = [
  'Same day', '1–2', '2–3', '3–5', '5–7',
];

export const ShippingPolicyWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ShippingPolicyAnswers>(DEFAULT_SHIPPING_POLICY_ANSWERS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  usePrefillFromStorage('uterms_prefill_shipping_policy', setAnswers, isEditing);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from('shipping_policy')
          .select('answers')
          .eq('id', id)
          .single();
        if (data) setAnswers({ ...DEFAULT_SHIPPING_POLICY_ANSWERS, ...data.answers });
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof ShippingPolicyAnswers>(key: K, value: ShippingPolicyAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCarrier = (carrier: string) => {
    setAnswers((prev) => ({
      ...prev,
      carriers: prev.carriers.includes(carrier)
        ? prev.carriers.filter((c) => c !== carrier)
        : [...prev.carriers, carrier],
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const generated = generateShippingPolicy(answers);
      const payload = {
        user_id: userId,
        title: answers.policyTitle || 'Shipping Policy',
        answers,
        generated,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };
      if (isEditing && id) {
        await supabase.from('shipping_policy').update(payload).eq('id', id);
        navigate(`/shipping-policy/${id}/preview`);
      } else {
        const { data } = await supabase.from('shipping_policy').insert(payload).select('id').single();
        if (data) navigate(`/shipping-policy/${data.id}/preview`);
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
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
              policyType="shipping_policy"
              websiteUrl={answers.websiteUrl}
              onUrlChange={(url) => set('websiteUrl', url)}
              onResult={(analysis) => setAnswers((prev) => ({ ...prev, ...analysis }))}
            />
            <div className="wizard-field">
              <label>Company / Store Name <span className="req">*</span></label>
              <input type="text" className="wizard-input" placeholder="e.g. Acme Store" value={answers.companyName} onChange={(e) => set('companyName', e.target.value)} />
            </div>
            <div className="wizard-field">
              <label>Website URL</label>
              <input type="url" className="wizard-input" placeholder="https://yourstore.com" value={answers.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} />
            </div>
            <div className="wizard-field">
              <label>Business Type</label>
              <select className="wizard-select" value={answers.businessType} onChange={(e) => set('businessType', e.target.value)}>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="wizard-field">
              <label>Country you ship from</label>
              <select className="wizard-select" value={answers.country} onChange={(e) => set('country', e.target.value)}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Do you ship internationally?</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="intl" checked={!answers.shipsInternationally} onChange={() => set('shipsInternationally', false)} />
                  <span>Domestic only — I only ship within {answers.country}</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="intl" checked={answers.shipsInternationally} onChange={() => set('shipsInternationally', true)} />
                  <span>Yes — I ship internationally</span>
                </label>
              </div>
            </div>

            {answers.shipsInternationally && (
              <div className="wizard-field">
                <label>International coverage</label>
                <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                  {[
                    { value: 'worldwide', label: 'Worldwide' },
                    { value: 'europe', label: 'Europe only' },
                    { value: 'north-america', label: 'North America only (US & Canada)' },
                    { value: 'asia-pacific', label: 'Asia-Pacific only' },
                    { value: 'custom', label: 'Custom — I will describe the regions' },
                  ].map(({ value, label }) => (
                    <label key={value} className="wizard-checkbox-item">
                      <input
                        type="radio"
                        name="coverage"
                        checked={answers.internationalCoverage === value}
                        onChange={() => set('internationalCoverage', value as ShippingPolicyAnswers['internationalCoverage'])}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {answers.internationalCoverage === 'custom' && (
                  <textarea
                    className="wizard-textarea"
                    style={{ marginTop: '0.5rem' }}
                    rows={2}
                    placeholder="e.g. Europe, United States, Australia and New Zealand"
                    value={answers.customCoverageDescription}
                    onChange={(e) => set('customCoverageDescription', e.target.value)}
                  />
                )}
              </div>
            )}

            <div className="wizard-field">
              <label>Countries / regions you do NOT ship to <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                className="wizard-textarea"
                rows={2}
                placeholder="e.g. Russia, Belarus, North Korea"
                value={answers.excludedCountries}
                onChange={(e) => set('excludedCountries', e.target.value)}
              />
            </div>

            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input type="checkbox" checked={answers.acceptsPOBox} onChange={(e) => set('acceptsPOBox', e.target.checked)} />
                <span>We accept deliveries to PO Box addresses</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Currency</label>
              <select className="wizard-select" style={{ width: 'auto' }} value={answers.currency} onChange={(e) => set('currency', e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {[
              {
                toggle: 'offersFreeShipping' as const,
                label: 'Free Shipping',
                thresholdKey: 'freeShippingThreshold' as const,
                thresholdLabel: 'Minimum order value for free shipping',
                costKey: null,
                daysKey: null,
              },
              {
                toggle: 'offersStandard' as const,
                label: 'Standard Delivery',
                thresholdKey: null,
                costKey: 'standardCost' as const,
                daysKey: 'standardDays' as const,
              },
              {
                toggle: 'offersExpress' as const,
                label: 'Express / Expedited Delivery',
                thresholdKey: null,
                costKey: 'expressCost' as const,
                daysKey: 'expressDays' as const,
              },
              {
                toggle: 'offersOvernight' as const,
                label: 'Next-Day / Overnight Delivery',
                thresholdKey: null,
                costKey: 'overnightCost' as const,
                daysKey: 'overnightDays' as const,
              },
            ].map(({ toggle, label, thresholdKey, costKey, daysKey }) => (
              <div key={toggle} className="wizard-field" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
                <label className="wizard-checkbox-item" style={{ marginBottom: '0.5rem' }}>
                  <input type="checkbox" checked={answers[toggle] as boolean} onChange={(e) => set(toggle, e.target.checked)} />
                  <strong>{label}</strong>
                </label>
                {answers[toggle] && (
                  <div style={{ paddingLeft: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {thresholdKey && (
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <label style={{ fontSize: '0.8125rem', color: '#374151' }}>Min. order value</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <input type="text" className="wizard-input" style={{ width: '90px' }} placeholder="50.00" value={answers[thresholdKey]} onChange={(e) => set(thresholdKey, e.target.value)} />
                        </div>
                      </div>
                    )}
                    {costKey && (
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <label style={{ fontSize: '0.8125rem', color: '#374151' }}>Shipping cost</label>
                        <input type="text" className="wizard-input" style={{ marginTop: '0.25rem', width: '90px' }} placeholder="3.99" value={answers[costKey]} onChange={(e) => set(costKey, e.target.value)} />
                      </div>
                    )}
                    {daysKey && (
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <label style={{ fontSize: '0.8125rem', color: '#374151' }}>Delivery time (business days)</label>
                        <input type="text" className="wizard-input" style={{ marginTop: '0.25rem', width: '90px' }} placeholder="3–5" value={answers[daysKey]} onChange={(e) => set(daysKey, e.target.value)} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="wizard-checkboxes" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
              <label className="wizard-checkbox-item">
                <input type="checkbox" checked={answers.offersClickAndCollect} onChange={(e) => set('offersClickAndCollect', e.target.checked)} />
                <span>Click &amp; Collect / In-store pickup</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Order processing time</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <select
                  className="wizard-select"
                  style={{ width: 'auto' }}
                  value={PROCESSING_TIME_OPTIONS.includes(answers.processingTime) ? answers.processingTime : 'custom'}
                  onChange={(e) => { if (e.target.value !== 'custom') set('processingTime', e.target.value); }}
                >
                  {PROCESSING_TIME_OPTIONS.map((o) => <option key={o} value={o}>{o} business day{o === 'Same day' ? '' : 's'}</option>)}
                  <option value="custom">Custom</option>
                </select>
                <input type="text" className="wizard-input" style={{ width: '120px' }} placeholder="e.g. 1–3" value={answers.processingTime} onChange={(e) => set('processingTime', e.target.value)} />
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>business days</span>
              </div>
            </div>

            <div className="wizard-field">
              <label>Same-day dispatch cut-off time <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
              <input type="text" className="wizard-input" placeholder="e.g. 14:00" style={{ width: '120px' }} value={answers.cutoffTime} onChange={(e) => set('cutoffTime', e.target.value)} />
              <p className="wizard-hint">Orders placed before this time begin processing the same day.</p>
            </div>

            <div className="wizard-field">
              <label>Dispatch days</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {[
                  { value: 'mon-fri', label: 'Monday – Friday (excluding public holidays)' },
                  { value: 'mon-sat', label: 'Monday – Saturday (excluding public holidays)' },
                  { value: 'everyday', label: '7 days a week (excluding public holidays)' },
                ].map(({ value, label }) => (
                  <label key={value} className="wizard-checkbox-item">
                    <input type="radio" name="dispatchDays" checked={answers.dispatchDays === value} onChange={() => set('dispatchDays', value as ShippingPolicyAnswers['dispatchDays'])} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="wizard-checkboxes" style={{ marginTop: '0.25rem' }}>
              <label className="wizard-checkbox-item">
                <input type="checkbox" checked={answers.peakPeriodWarning} onChange={(e) => set('peakPeriodWarning', e.target.checked)} />
                <span>Add peak period warning <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>(Christmas, Black Friday — delays may occur)</span></span>
              </label>
              <label className="wizard-checkbox-item">
                <input type="checkbox" checked={answers.handlesPreorders} onChange={(e) => set('handlesPreorders', e.target.checked)} />
                <span>We sell pre-orders or back-ordered items</span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Shipping carriers</label>
              <p className="wizard-hint">Select all you use.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                {CARRIER_OPTIONS.map((carrier) => (
                  <label key={carrier} className="wizard-checkbox-item">
                    <input type="checkbox" checked={answers.carriers.includes(carrier)} onChange={() => toggleCarrier(carrier)} />
                    <span style={{ fontSize: '0.875rem' }}>{carrier}</span>
                  </label>
                ))}
              </div>
              <div className="wizard-field" style={{ marginTop: '0.75rem' }}>
                <label>Other carrier <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
                <input type="text" className="wizard-input" placeholder="e.g. Yodel" value={answers.otherCarrier} onChange={(e) => set('otherCarrier', e.target.value)} />
              </div>
            </div>

            <div className="wizard-field" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
              <label className="wizard-checkbox-item" style={{ marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={answers.providesTracking} onChange={(e) => set('providesTracking', e.target.checked)} />
                <strong>Provide order tracking</strong>
              </label>
              {answers.providesTracking && (
                <div style={{ paddingLeft: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#374151' }}>Notify customers via</label>
                  <div className="wizard-checkboxes" style={{ marginTop: '0.25rem' }}>
                    {[
                      { value: 'email', label: 'Email only' },
                      { value: 'sms', label: 'SMS only' },
                      { value: 'both', label: 'Email and SMS' },
                    ].map(({ value, label }) => (
                      <label key={value} className="wizard-checkbox-item">
                        <input type="radio" name="trackingNotif" checked={answers.trackingNotification === value} onChange={() => set('trackingNotification', value as ShippingPolicyAnswers['trackingNotification'])} />
                        <span style={{ fontSize: '0.875rem' }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-checkboxes" style={{ marginTop: '0.25rem' }}>
              <label className="wizard-checkbox-item">
                <input type="checkbox" checked={answers.requiresSignature} onChange={(e) => set('requiresSignature', e.target.checked)} />
                <span>Some deliveries require a signature on receipt</span>
              </label>
              <label className="wizard-checkbox-item">
                <input type="checkbox" checked={answers.remoteAreaSurcharge} onChange={(e) => set('remoteAreaSurcharge', e.target.checked)} />
                <span>Remote or rural area surcharge may apply</span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Lost or missing packages</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="lostPolicy" checked={answers.lostPackagePolicy === 'either'} onChange={() => set('lostPackagePolicy', 'either')} />
                  <span>Customer's choice of full refund or replacement <span style={{ color: '#6b7280' }}>(recommended)</span></span>
                </label>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="lostPolicy" checked={answers.lostPackagePolicy === 'refund'} onChange={() => set('lostPackagePolicy', 'refund')} />
                  <span>Full refund</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="lostPolicy" checked={answers.lostPackagePolicy === 'replacement'} onChange={() => set('lostPackagePolicy', 'replacement')} />
                  <span>Replacement shipment only</span>
                </label>
              </div>
            </div>

            <div className="wizard-field">
              <label>Damaged in transit</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="damagedPolicy" checked={answers.damagedPolicy === 'either'} onChange={() => set('damagedPolicy', 'either')} />
                  <span>Customer's choice of full refund or replacement <span style={{ color: '#6b7280' }}>(recommended)</span></span>
                </label>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="damagedPolicy" checked={answers.damagedPolicy === 'refund'} onChange={() => set('damagedPolicy', 'refund')} />
                  <span>Full refund</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input type="radio" name="damagedPolicy" checked={answers.damagedPolicy === 'replacement'} onChange={() => set('damagedPolicy', 'replacement')} />
                  <span>Replacement item only</span>
                </label>
              </div>
            </div>

            <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
              <label className="wizard-checkbox-item">
                <input type="checkbox" checked={answers.handleUndeliverable} onChange={(e) => set('handleUndeliverable', e.target.checked)} />
                <span>Include undeliverable / returned packages section</span>
              </label>
              {answers.shipsInternationally && (
                <label className="wizard-checkbox-item">
                  <input type="checkbox" checked={answers.customerPaysCustoms} onChange={(e) => set('customerPaysCustoms', e.target.checked)} />
                  <span>Customer is responsible for customs duties and import taxes</span>
                </label>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Contact Email <span className="req">*</span></label>
              <input type="email" className="wizard-input" placeholder="support@yourstore.com" value={answers.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
            </div>
            <div className="wizard-field">
              <label>Effective Date</label>
              <input type="date" className="wizard-input" value={answers.effectiveDate} onChange={(e) => set('effectiveDate', e.target.value)} />
            </div>
            <div className="wizard-field">
              <label>Document Title</label>
              <input type="text" className="wizard-input" value={answers.policyTitle} onChange={(e) => set('policyTitle', e.target.value)} />
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
        <button className="wizard-back-btn" onClick={() => navigate('/shipping-policy')}>
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? 'Edit Shipping Policy' : 'Create Shipping Policy'}</h1>
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
          <div className="wizard-progress-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
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
          <button className="wizard-btn-secondary" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ArrowLeft size={16} /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button className="wizard-btn-primary" onClick={() => setStep((s) => s + 1)}>
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
                {isSaving ? 'Generating...' : 'Generate Shipping Policy'}
              </button>
              {saveError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>{saveError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
