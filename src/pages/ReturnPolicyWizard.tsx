import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePrefillFromStorage } from '../hooks/usePrefillFromStorage';
import { useNavigate, useParams } from 'react-router-dom';
import { AiPrefillButton } from '../components/AiPrefillButton';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_RETURN_POLICY_ANSWERS,
  generateReturnPolicy,
  type ReturnPolicyAnswers,
} from '../utils/generateReturnPolicy';
import './PrivacyPolicyWizard.css';

const STEPS = [
  { title: 'Business Info', description: 'Tell us about your business' },
  { title: 'Return Window & Eligibility', description: 'When and what customers can return' },
  { title: 'Refund Method & Shipping', description: 'How refunds are issued and who pays shipping' },
  { title: 'Return Process', description: 'How customers initiate a return' },
  { title: 'Special Cases', description: 'Defective items, sale items, gifts, and international returns' },
  { title: 'Contact & Generate', description: 'Contact details and final details' },
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

const RETURN_WINDOW_OPTIONS = ['7', '14', '30', '60', '90'];

export const ReturnPolicyWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ReturnPolicyAnswers>(DEFAULT_RETURN_POLICY_ANSWERS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  usePrefillFromStorage('uterms_prefill_return_policy', setAnswers, isEditing);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      (async () => {
        const { data } = await supabase
          .from('return_policy')
          .select('answers')
          .eq('id', id)
          .single();
        if (data) {
          setAnswers({ ...DEFAULT_RETURN_POLICY_ANSWERS, ...data.answers });
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const set = <K extends keyof ReturnPolicyAnswers>(key: K, value: ReturnPolicyAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleProductType = (type: 'physical' | 'digital' | 'services') => {
    setAnswers((prev) => ({
      ...prev,
      productTypes: prev.productTypes.includes(type)
        ? prev.productTypes.filter((t) => t !== type)
        : [...prev.productTypes, type],
    }));
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const generated = generateReturnPolicy(answers);
      const payload = {
        user_id: userId,
        title: answers.policyTitle || 'Return & Refund Policy',
        answers,
        generated,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await supabase.from('return_policy').update(payload).eq('id', id);
        navigate(`/return-policy/${id}/preview`);
      } else {
        const { data } = await supabase
          .from('return_policy')
          .insert(payload)
          .select('id')
          .single();
        if (data) navigate(`/return-policy/${data.id}/preview`);
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

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="wizard-fields">
            <AiPrefillButton
              policyType="return_policy"
              websiteUrl={answers.websiteUrl}
              onUrlChange={(url) => set('websiteUrl', url)}
              onResult={(analysis) => setAnswers((prev) => ({ ...prev, ...analysis }))}
            />
            <div className="wizard-field">
              <label>Company / Store Name <span className="req">*</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. Acme Store Ltd"
                value={answers.companyName}
                onChange={(e) => set('companyName', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Website URL</label>
              <input
                type="url"
                className="wizard-input"
                placeholder="https://yourstore.com"
                value={answers.websiteUrl}
                onChange={(e) => set('websiteUrl', e.target.value)}
              />
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
            <div className="wizard-field">
              <label>Contact Email <span className="req">*</span></label>
              <input
                type="email"
                className="wizard-input"
                placeholder="returns@yourstore.com"
                value={answers.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>What type of products do you sell?</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {(['physical', 'digital', 'services'] as const).map((type) => (
                  <label key={type} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.productTypes.includes(type)}
                      onChange={() => toggleProductType(type)}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{type === 'physical' ? 'Physical goods' : type === 'digital' ? 'Digital products' : 'Services'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="wizard-field">
              <label>Return window</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <select
                  className="wizard-select"
                  style={{ width: 'auto' }}
                  value={RETURN_WINDOW_OPTIONS.includes(answers.returnWindowDays) ? answers.returnWindowDays : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') set('returnWindowDays', e.target.value);
                  }}
                >
                  {RETURN_WINDOW_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                <input
                  type="text"
                  className="wizard-input"
                  style={{ width: '120px' }}
                  placeholder="e.g. 45"
                  value={answers.returnWindowDays}
                  onChange={(e) => set('returnWindowDays', e.target.value)}
                />
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>days</span>
              </div>
            </div>

            <div className="wizard-field">
              <label>Return window starts from</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="returnWindowStart"
                    value="delivery"
                    checked={answers.returnWindowStart === 'delivery'}
                    onChange={() => set('returnWindowStart', 'delivery')}
                  />
                  <span>Date of delivery <span style={{ color: '#6b7280' }}>(recommended)</span></span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="returnWindowStart"
                    value="purchase"
                    checked={answers.returnWindowStart === 'purchase'}
                    onChange={() => set('returnWindowStart', 'purchase')}
                  />
                  <span>Date of purchase</span>
                </label>
              </div>
            </div>

            <div className="wizard-field">
              <label>Which items are eligible for return?</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="eligibleItems"
                    value="all"
                    checked={answers.eligibleItems === 'all'}
                    onChange={() => set('eligibleItems', 'all')}
                  />
                  <span>All items (unless excluded below)</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="eligibleItems"
                    value="select"
                    checked={answers.eligibleItems === 'select'}
                    onChange={() => set('eligibleItems', 'select')}
                  />
                  <span>Only specific categories</span>
                </label>
              </div>
              {answers.eligibleItems === 'select' && (
                <textarea
                  className="wizard-textarea"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="e.g. clothing and footwear only, excluding accessories"
                  rows={2}
                  value={answers.eligibleItemsDescription}
                  onChange={(e) => set('eligibleItemsDescription', e.target.value)}
                />
              )}
            </div>

            <div className="wizard-field">
              <label>Non-returnable item exclusions</label>
              <p className="wizard-hint">Select all that apply to your store.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                {[
                  { key: 'excludeFinalSale', label: 'Final sale / non-returnable items' },
                  { key: 'excludePerishables', label: 'Perishables (food, flowers, etc.)' },
                  { key: 'excludeDigitalDownloads', label: 'Digital downloads once accessed' },
                  { key: 'excludeCustomised', label: 'Custom or personalised items' },
                  { key: 'excludeHazardous', label: 'Hazardous materials' },
                  { key: 'excludeHygiene', label: 'Hygiene-sensitive items (underwear, swimwear, pierced jewellery)' },
                  { key: 'excludeOpened', label: 'Opened items no longer in resalable condition' },
                ].map(({ key, label }) => (
                  <label key={key} className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers[key as keyof ReturnPolicyAnswers] as boolean}
                      onChange={(e) => set(key as keyof ReturnPolicyAnswers, e.target.checked)}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{label}</span>
                  </label>
                ))}
              </div>
              <div className="wizard-field" style={{ marginTop: '0.75rem' }}>
                <label>Additional exclusions (one per line, optional)</label>
                <textarea
                  className="wizard-textarea"
                  rows={2}
                  placeholder="e.g. Gift cards&#10;Bundled items sold as a set"
                  value={answers.customExclusions}
                  onChange={(e) => set('customExclusions', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Refund methods offered</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.refundToOriginal}
                    onChange={(e) => set('refundToOriginal', e.target.checked)}
                  />
                  <span>Refund to original payment method</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.refundToStoreCredit}
                    onChange={(e) => set('refundToStoreCredit', e.target.checked)}
                  />
                  <span>Store credit / gift card</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.refundAsExchange}
                    onChange={(e) => set('refundAsExchange', e.target.checked)}
                  />
                  <span>Exchange for another item</span>
                </label>
              </div>
            </div>

            <div className="wizard-field">
              <label>Refund processing time</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. 5–10"
                value={answers.refundProcessingDays}
                onChange={(e) => set('refundProcessingDays', e.target.value)}
              />
              <p className="wizard-hint">Number of business days after the return is received and approved.</p>
            </div>

            <div className="wizard-field">
              <label>Who pays for return shipping?</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="returnShippingPaidBy"
                    value="customer"
                    checked={answers.returnShippingPaidBy === 'customer'}
                    onChange={() => set('returnShippingPaidBy', 'customer')}
                  />
                  <span>Customer pays return shipping</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="returnShippingPaidBy"
                    value="seller"
                    checked={answers.returnShippingPaidBy === 'seller'}
                    onChange={() => set('returnShippingPaidBy', 'seller')}
                  />
                  <span>We provide a prepaid return label</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="returnShippingPaidBy"
                    value="depends"
                    checked={answers.returnShippingPaidBy === 'depends'}
                    onChange={() => set('returnShippingPaidBy', 'depends')}
                  />
                  <span>Depends on the reason <span style={{ color: '#6b7280' }}>(we pay if defective, customer pays otherwise)</span></span>
                </label>
              </div>
            </div>

            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.hasRestockingFee}
                  onChange={(e) => set('hasRestockingFee', e.target.checked)}
                />
                <span>Charge a restocking fee</span>
              </label>
              {answers.hasRestockingFee && (
                <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <label>Restocking fee percentage</label>
                  <input
                    type="text"
                    className="wizard-input"
                    placeholder="e.g. 15"
                    value={answers.restockingFeePercent}
                    onChange={(e) => set('restockingFeePercent', e.target.value)}
                  />
                  <p className="wizard-hint">Enter as a number (e.g. 15 for 15%).</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>How can customers initiate a return?</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.initiateByEmail}
                    onChange={(e) => set('initiateByEmail', e.target.checked)}
                  />
                  <span>By email</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.initiateByPortal}
                    onChange={(e) => set('initiateByPortal', e.target.checked)}
                  />
                  <span>Through an online returns portal</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.initiateInStore}
                    onChange={(e) => set('initiateInStore', e.target.checked)}
                  />
                  <span>In store</span>
                </label>
              </div>
            </div>

            <div className="wizard-checkboxes">
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.requiresRMA}
                  onChange={(e) => set('requiresRMA', e.target.checked)}
                />
                <span>Require a Return Merchandise Authorisation (RMA) number before items are shipped back</span>
              </label>
            </div>

            <div className="wizard-field" style={{ marginTop: '0.75rem' }}>
              <label>Item return conditions</label>
              <p className="wizard-hint">Select what you require for items to be accepted.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.requiresUnused}
                    onChange={(e) => set('requiresUnused', e.target.checked)}
                  />
                  <span>Unused and in the same condition as received</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.requiresOriginalPackaging}
                    onChange={(e) => set('requiresOriginalPackaging', e.target.checked)}
                  />
                  <span>In the original packaging</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.requiresTags}
                    onChange={(e) => set('requiresTags', e.target.checked)}
                  />
                  <span>With all tags and labels still attached</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.requiresProofOfPurchase}
                    onChange={(e) => set('requiresProofOfPurchase', e.target.checked)}
                  />
                  <span>With proof of purchase (order confirmation or receipt)</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Defective, damaged, or incorrect items</label>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="defectivePolicy"
                    value="either"
                    checked={answers.defectivePolicy === 'either'}
                    onChange={() => set('defectivePolicy', 'either')}
                  />
                  <span>Customer's choice of full refund or replacement <span style={{ color: '#6b7280' }}>(recommended)</span></span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="defectivePolicy"
                    value="full-refund"
                    checked={answers.defectivePolicy === 'full-refund'}
                    onChange={() => set('defectivePolicy', 'full-refund')}
                  />
                  <span>Full refund (including shipping)</span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="radio"
                    name="defectivePolicy"
                    value="replacement"
                    checked={answers.defectivePolicy === 'replacement'}
                    onChange={() => set('defectivePolicy', 'replacement')}
                  />
                  <span>Replacement item only</span>
                </label>
              </div>
            </div>

            <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.saleItemsFinalSale}
                  onChange={(e) => set('saleItemsFinalSale', e.target.checked)}
                />
                <span>Sale and promotional items are final sale (not eligible for return)</span>
              </label>
            </div>

            <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.acceptsGiftReturns}
                  onChange={(e) => set('acceptsGiftReturns', e.target.checked)}
                />
                <span>Accept gift returns</span>
              </label>
              {answers.acceptsGiftReturns && (
                <div style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  <div className="wizard-checkboxes">
                    <label className="wizard-checkbox-item">
                      <input
                        type="radio"
                        name="giftRefundMethod"
                        value="store-credit"
                        checked={answers.giftRefundMethod === 'store-credit'}
                        onChange={() => set('giftRefundMethod', 'store-credit')}
                      />
                      <span>Refund as store credit to recipient</span>
                    </label>
                    <label className="wizard-checkbox-item">
                      <input
                        type="radio"
                        name="giftRefundMethod"
                        value="original-payment"
                        checked={answers.giftRefundMethod === 'original-payment'}
                        onChange={() => set('giftRefundMethod', 'original-payment')}
                      />
                      <span>Refund to original purchaser's payment method</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
              <label className="wizard-checkbox-item">
                <input
                  type="checkbox"
                  checked={answers.acceptsInternationalReturns}
                  onChange={(e) => set('acceptsInternationalReturns', e.target.checked)}
                />
                <span>Accept international returns</span>
              </label>
              {answers.acceptsInternationalReturns && (
                <div className="wizard-checkboxes" style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  <label className="wizard-checkbox-item">
                    <input
                      type="checkbox"
                      checked={answers.internationalCustomerPaysDuties}
                      onChange={(e) => set('internationalCustomerPaysDuties', e.target.checked)}
                    />
                    <span>Customer is responsible for return shipping, duties, and customs fees</span>
                  </label>
                </div>
              )}
            </div>

            <div className="wizard-field" style={{ marginTop: '1.25rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem' }}>
              <label style={{ fontWeight: 600 }}>Compliance</label>
              <p className="wizard-hint">Select the regulations that apply to your business or customers.</p>
              <div className="wizard-checkboxes" style={{ marginTop: '0.5rem' }}>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.gdprApplies}
                    onChange={(e) => set('gdprApplies', e.target.checked)}
                  />
                  <span>
                    UK / EU Consumer Rights apply{' '}
                    <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                      — adds mandatory 14-day statutory cancellation right, GDPR-aligned refund timelines, and restocking fee restrictions
                    </span>
                  </span>
                </label>
                <label className="wizard-checkbox-item">
                  <input
                    type="checkbox"
                    checked={answers.ccpaApplies}
                    onChange={(e) => set('ccpaApplies', e.target.checked)}
                  />
                  <span>
                    CCPA / CPRA applies{' '}
                    <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>— California, adds consumer privacy rights section</span>
                  </span>
                </label>
              </div>
              {(answers.gdprApplies || answers.ccpaApplies) && (
                <div className="wizard-field" style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <label>Privacy Policy URL <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="url"
                    className="wizard-input"
                    placeholder="https://yourstore.com/privacy-policy"
                    value={answers.privacyPolicyUrl}
                    onChange={(e) => set('privacyPolicyUrl', e.target.value)}
                  />
                  <p className="wizard-hint">
                    {answers.gdprApplies && answers.ccpaApplies
                      ? 'Linked in both the GDPR data privacy notice and the CCPA section.'
                      : answers.gdprApplies
                      ? 'Linked in the GDPR data privacy notice within the return process section.'
                      : 'Linked in the CCPA section so customers can request data deletion.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-fields">
            <div className="wizard-field">
              <label>Customer service phone <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="tel"
                className="wizard-input"
                placeholder="e.g. +44 20 1234 5678"
                value={answers.customerServicePhone}
                onChange={(e) => set('customerServicePhone', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Company Registration Number <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. 12345678"
                value={answers.companyRegNumber}
                onChange={(e) => set('companyRegNumber', e.target.value)}
              />
              {answers.gdprApplies && (
                <p className="wizard-hint">Required for UK/EU distance selling transparency — Companies House number or equivalent EU registration.</p>
              )}
            </div>
            <div className="wizard-field">
              <label>VAT Number <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g. GB123456789"
                value={answers.vatNumber}
                onChange={(e) => set('vatNumber', e.target.value)}
              />
              {answers.gdprApplies && (
                <p className="wizard-hint">Required if VAT-registered — must be disclosed under UK/EU distance selling regulations.</p>
              )}
            </div>
            <div className="wizard-field">
              <label>Business address <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                className="wizard-textarea"
                rows={2}
                placeholder="e.g. 123 High Street, London, EC1A 1BB, United Kingdom"
                value={answers.customerServiceAddress}
                onChange={(e) => set('customerServiceAddress', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Effective date</label>
              <input
                type="date"
                className="wizard-input"
                value={answers.effectiveDate}
                onChange={(e) => set('effectiveDate', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>Document title</label>
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
        <button
          className="wizard-back-btn"
          onClick={() => navigate('/return-policy')}
        >
          <ArrowLeft size={16} /> Back to Policies
        </button>
        <h1>{isEditing ? 'Edit Return Policy' : 'Create Return Policy'}</h1>
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
            {saveError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>{saveError}</p>}
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={isSaving || !answers.companyName || !answers.contactEmail}
            >
              <Sparkles size={16} />
              {isSaving ? 'Generating...' : 'Generate Return Policy'}
            </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
