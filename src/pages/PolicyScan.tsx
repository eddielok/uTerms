import { CheckCircle2, ExternalLink, Loader2, ScanLine, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookieConfig } from '../context/CookieContext';
import { API_URL } from '../lib/config';
import './PolicyScan.css';

const POLICY_TYPES = [
  { key: 'privacy_policy',    label: 'Privacy Policy',          path: '/policy-management/new' },
  { key: 'cookie_policy',     label: 'Cookie Policy',           path: '/cookie-policy/new' },
  { key: 'terms_of_service',  label: 'Terms of Service',        path: '/terms-of-service/new' },
  { key: 'eula',              label: 'EULA',                    path: '/eula/new' },
  { key: 'return_policy',     label: 'Return Policy',           path: '/return-policy/new' },
  { key: 'disclaimer',        label: 'Disclaimer',              path: '/disclaimer/new' },
  { key: 'shipping_policy',   label: 'Shipping Policy',         path: '/shipping-policy/new' },
  { key: 'aup',               label: 'Acceptable Use Policy',   path: '/acceptable-use-policy/new' },
  { key: 'impressum',         label: 'Impressum',               path: '/impressum/new' },
  { key: 'accessibility',     label: 'Accessibility Statement', path: '/accessibility-statement/new' },
];

// Key fields to surface per policy type: [label, fieldPath, type]
type FieldDef = { label: string; field: string; type: 'bool' | 'str' | 'arr' };
const DISPLAY_FIELDS: Record<string, FieldDef[]> = {
  privacy_policy: [
    { label: 'Collects email',    field: 'collectsEmail',            type: 'bool' },
    { label: 'Collects payment',  field: 'collectsPayment',          type: 'bool' },
    { label: 'Collects location', field: 'collectsLocation',         type: 'bool' },
    { label: 'Analytics use',     field: 'purposeAnalytics',         type: 'bool' },
    { label: 'Marketing use',     field: 'purposeMarketing',         type: 'bool' },
    { label: 'Shares with ads',   field: 'sharesWithAdNetworks',     type: 'bool' },
    { label: 'Right to delete',   field: 'rightToDeletion',          type: 'bool' },
  ],
  cookie_policy: [
    { label: 'Analytics cookies', field: 'usesAnalytics',   type: 'bool' },
    { label: 'Marketing cookies', field: 'usesMarketing',   type: 'bool' },
    { label: 'Social cookies',    field: 'usesSocial',      type: 'bool' },
    { label: 'GDPR applies',      field: 'gdprApplies',     type: 'bool' },
    { label: 'CCPA applies',      field: 'ccpaApplies',     type: 'bool' },
    { label: 'Sells data',        field: 'sellsData',       type: 'bool' },
    { label: 'Analytics tools',   field: 'analyticsProviders', type: 'arr' },
  ],
  terms_of_service: [
    { label: 'Business type',     field: 'businessType',    type: 'str' },
    { label: 'Requires account',  field: 'requiresAccount', type: 'bool' },
    { label: 'Paid service',      field: 'isPaid',          type: 'bool' },
    { label: 'Subscription',      field: 'isSubscription',  type: 'bool' },
    { label: 'User content',      field: 'allowsUGC',       type: 'bool' },
    { label: 'Governing law',     field: 'governingLaw',    type: 'str' },
  ],
  eula: [
    { label: 'App name',          field: 'appName',             type: 'str' },
    { label: 'Platforms',         field: 'platforms',           type: 'arr' },
    { label: 'License type',      field: 'licenseType',         type: 'str' },
    { label: 'Collects data',     field: 'collectsData',        type: 'bool' },
    { label: 'In-app purchases',  field: 'hasInAppPurchases',   type: 'bool' },
    { label: 'Governing law',     field: 'governingLaw',        type: 'str' },
  ],
  return_policy: [
    { label: 'Product types',     field: 'productTypes',        type: 'arr' },
    { label: 'Return window',     field: 'returnWindowDays',    type: 'str' },
    { label: 'Refund to original',field: 'refundToOriginal',    type: 'bool' },
    { label: 'Store credit',      field: 'refundToStoreCredit', type: 'bool' },
    { label: 'Exchange',          field: 'refundAsExchange',    type: 'bool' },
    { label: 'Return shipping',   field: 'returnShippingPaidBy',type: 'str' },
  ],
  disclaimer: [
    { label: 'Business type',     field: 'businessType',        type: 'str' },
    { label: 'Professional advice',field: 'professionalAdvice', type: 'bool' },
    { label: 'Financial info',    field: 'financialInvestment', type: 'bool' },
    { label: 'Legal info',        field: 'legalAdvice',         type: 'bool' },
    { label: 'Affiliate links',   field: 'affiliateLinks',      type: 'bool' },
    { label: 'AI-generated content',field: 'aiContent',         type: 'bool' },
  ],
  shipping_policy: [
    { label: 'Business type',     field: 'businessType',        type: 'str' },
    { label: 'Currency',          field: 'currency',            type: 'str' },
    { label: 'Ships internationally', field: 'shipsInternationally', type: 'bool' },
    { label: 'Free shipping',     field: 'offersFreeShipping',  type: 'bool' },
    { label: 'Express shipping',  field: 'offersExpress',       type: 'bool' },
    { label: 'Tracking provided', field: 'providesTracking',    type: 'bool' },
  ],
  aup: [
    { label: 'Platform type',     field: 'platformType',        type: 'str' },
    { label: 'Requires account',  field: 'requiresAccount',     type: 'bool' },
    { label: 'Minimum age',       field: 'minimumAge',          type: 'str' },
    { label: 'User content',      field: 'allowsUGC',           type: 'bool' },
    { label: 'Sensitive data',    field: 'handlesSensitiveData',type: 'bool' },
    { label: 'Governing law',     field: 'governingLaw',        type: 'str' },
  ],
  impressum: [
    { label: 'Address',           field: 'street',              type: 'str' },
    { label: 'City',              field: 'city',                type: 'str' },
    { label: 'Postcode',          field: 'postcode',            type: 'str' },
    { label: 'Reg. number',       field: 'registrationNumber',  type: 'str' },
    { label: 'VAT ID',            field: 'vatId',               type: 'str' },
    { label: 'Phone',             field: 'phone',               type: 'str' },
  ],
  accessibility: [
    { label: 'Sector',            field: 'sector',              type: 'str' },
    { label: 'WCAG version',      field: 'wcagVersion',         type: 'str' },
    { label: 'Conformance level', field: 'conformanceLevel',    type: 'str' },
    { label: 'Contact name',      field: 'contactName',         type: 'str' },
    { label: 'Contact phone',     field: 'contactPhone',        type: 'str' },
  ],
};

const PREFILL_KEY = (type: string) => `uterms_prefill_${type}`;
type ScanStatus = 'idle' | 'scanning' | 'done' | 'error';

function FieldRow({ label, value, type }: { label: string; value: unknown; type: 'bool' | 'str' | 'arr' }) {
  if (type === 'bool') {
    return (
      <div className="ps-field-row">
        <span className={`ps-field-dot ${value ? 'yes' : 'no'}`} />
        <span className="ps-field-label">{label}</span>
      </div>
    );
  }
  if (type === 'arr') {
    const arr = Array.isArray(value) ? value : [];
    if (arr.length === 0) return null;
    return (
      <div className="ps-field-row">
        <span className="ps-field-label">{label}:</span>
        <span className="ps-field-value">{arr.join(', ')}</span>
      </div>
    );
  }
  if (!value) return null;
  return (
    <div className="ps-field-row">
      <span className="ps-field-label">{label}:</span>
      <span className="ps-field-value">{String(value)}</span>
    </div>
  );
}

export const PolicyScan: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useCookieConfig();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, Record<string, unknown>>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Load saved results on mount
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/policy-scan/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.found) {
          setUrl(data.url);
          setAnalyses(data.analyses);
          setSavedAt(data.created_at);
          setStatus('done');
          for (const pt of POLICY_TYPES) {
            if (data.analyses[pt.key]) localStorage.setItem(PREFILL_KEY(pt.key), JSON.stringify(data.analyses[pt.key]));
          }
        }
      })
      .catch(() => {});
  }, [userId]);

  const handleScan = async () => {
    if (!url.trim()) return;
    setStatus('scanning');
    setError(null);
    setAnalyses({});
    setSavedAt(null);
    try {
      const response = await fetch(`${API_URL}/api/analyze-all-policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), userId }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Scan failed');
      }
      const { analyses: data } = await response.json();
      for (const pt of POLICY_TYPES) {
        if (data[pt.key]) localStorage.setItem(PREFILL_KEY(pt.key), JSON.stringify(data[pt.key]));
      }
      setAnalyses(data);
      setSavedAt(new Date().toISOString());
      setStatus('done');
    } catch (err: any) {
      setError(err.message || 'Scan failed. Please try again.');
      setStatus('error');
    }
  };

  const handleClear = () => {
    for (const pt of POLICY_TYPES) localStorage.removeItem(PREFILL_KEY(pt.key));
    setAnalyses({});
    setStatus('idle');
    setUrl('');
    setSavedAt(null);
  };

  return (
    <div className="policy-scan-container">
      <div className="policy-scan-header">
        <h1><ScanLine size={24} /> Policy Scan</h1>
        <p className="policy-scan-desc">
          Enter your website URL and AI will analyse it to prefill all 10 policy wizards at once.
          Then click any card below to open the pre-filled wizard.
        </p>
      </div>

      <div className="policy-scan-input-row">
        <input
          type="url"
          className="policy-scan-url-input"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.example.com"
          disabled={status === 'scanning'}
          onKeyDown={e => e.key === 'Enter' && handleScan()}
        />
        <button
          className="policy-scan-btn"
          onClick={handleScan}
          disabled={status === 'scanning' || !url.trim()}
        >
          {status === 'scanning'
            ? <><Loader2 size={16} className="spin" /> Scanning…</>
            : <><ScanLine size={16} /> Scan All Policies</>}
        </button>
      </div>

      {error && (
        <div className="policy-scan-error"><XCircle size={16} /> {error}</div>
      )}

      {status === 'scanning' && (
        <div className="policy-scan-progress">
          <Loader2 size={32} className="spin" />
          <p>Analysing your website with AI — this takes about 20–30 seconds…</p>
        </div>
      )}

      {status === 'done' && Object.keys(analyses).length > 0 && (
        <>
          <div className="policy-scan-success-bar">
            <CheckCircle2 size={16} />
            <span>
              All 10 policies prefilled — click any card to open the wizard with pre-populated fields.
              {savedAt && (
                <span style={{ marginLeft: '0.5rem', opacity: 0.75, fontSize: '0.8rem' }}>
                  Last scanned: {new Date(savedAt).toLocaleString()}
                </span>
              )}
            </span>
          </div>

          <div className="policy-scan-grid">
            {POLICY_TYPES.map(pt => {
              const data = analyses[pt.key] || {};
              const companyName = (data.companyName || data.websiteName || data.organisationName) as string;
              const country = data.country as string;
              const fields = DISPLAY_FIELDS[pt.key] || [];

              return (
                <div key={pt.key} className="policy-scan-card">
                  <div className="policy-scan-card-header">
                    <CheckCircle2 size={15} className="text-success" />
                    <span className="policy-scan-card-title">{pt.label}</span>
                  </div>

                  {(companyName || country) && (
                    <div className="ps-card-meta">
                      {companyName && <span className="ps-company">{companyName}</span>}
                      {country && <span className="ps-country">{country}</span>}
                    </div>
                  )}

                  <div className="ps-fields">
                    {fields.map(f => (
                      <FieldRow key={f.field} label={f.label} value={data[f.field]} type={f.type} />
                    ))}
                  </div>

                  <button
                    className="policy-scan-card-btn"
                    onClick={() => navigate(pt.path)}
                  >
                    <ExternalLink size={13} /> Create {pt.label}
                  </button>
                </div>
              );
            })}
          </div>

          <button className="policy-scan-clear-btn" onClick={handleClear}>
            Clear &amp; Scan Again
          </button>
        </>
      )}
    </div>
  );
};
