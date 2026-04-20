import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  MinusCircle,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { useCookieConfig } from '../context/CookieContext';
import { API_URL } from '../lib/config';
import { supabase } from '../lib/supabase';
import './WebsiteDiagnosis.css';

const SCAN_TYPES = [
  {
    id: 'gdpr_pecr',
    label: 'GDPR / PECR website checks',
    desc: 'Cookie consent, data collection notices, privacy policy completeness, legitimate interest claims.',
  },
  {
    id: 'fca_vendor',
    label: 'FCA / vendor due-diligence checks',
    desc: 'Financial promotions, risk disclaimers, regulatory statements and third-party vendor disclosures.',
  },
  {
    id: 'iso27001',
    label: 'ISO 27001 evidence checklist',
    desc: 'Information security policy links, data handling statements, incident disclosure and ISMS evidence.',
  },
  {
    id: 'accessibility_legal',
    label: 'Accessibility and legal page review',
    desc: 'WCAG compliance indicators, accessibility statement, terms of service and mandatory legal pages.',
  },
  {
    id: 'ccpa',
    label: 'CCPA website checks',
    desc: '"Do Not Sell" link, consumer rights disclosure, privacy policy California section.',
  },
];

const INTERVALS: { value: 1 | 3 | 6 | 12; label: string }[] = [
  { value: 1, label: 'Monthly' },
  { value: 3, label: 'Every 3 Months' },
  { value: 6, label: 'Every 6 Months' },
  { value: 12, label: 'Yearly' },
];

interface DiagnosisCheck {
  id: string;
  category: string;
  title: string;
  status: 'pass' | 'fail' | 'warning' | 'na';
  detail: string;
  action?: string | null;
}

interface DiagnosisReport {
  id: string;
  website_url: string;
  scan_types: string[];
  report: {
    score: number;
    summary: string;
    riskLevel: 'high' | 'medium' | 'low';
    checks: DiagnosisCheck[];
  };
  created_at: string;
}

interface DiagnosisSchedule {
  user_id: string;
  website_url: string;
  scan_types: string[];
  interval_months: 1 | 3 | 6 | 12;
  notification_email: string | null;
  enabled: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
}

interface SubscriptionStatus {
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  subscriptionId?: string;
}

function StatusIcon({ status }: { status: DiagnosisCheck['status'] }) {
  if (status === 'pass') return <CheckCircle2 size={16} className="diag-status-pass" />;
  if (status === 'fail') return <XCircle size={16} className="diag-status-fail" />;
  if (status === 'warning') return <AlertTriangle size={16} className="diag-status-warn" />;
  return <MinusCircle size={16} className="diag-status-na" />;
}

function ScoreBadge({ score, riskLevel }: { score: number; riskLevel: string }) {
  const cls = riskLevel === 'high' ? 'diag-score-high' : riskLevel === 'medium' ? 'diag-score-medium' : 'diag-score-low';
  return (
    <div className={`diag-score-badge ${cls}`}>
      <span className="diag-score-num">{score}</span>
      <span className="diag-score-label">/100</span>
    </div>
  );
}

export const WebsiteDiagnosis: React.FC = () => {
  const { userId } = useCookieConfig();
  const location = useLocation();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [schedule, setSchedule] = useState<DiagnosisSchedule | null>(null);
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [scanResult, setScanResult] = useState<DiagnosisReport['report'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [selectedTypes, setSelectedTypes] = useState<string[]>(['gdpr_pecr']);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [scheduleInterval, setScheduleInterval] = useState<1 | 3 | 6 | 12>(1);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('subscription') === 'success') {
      setSuccessMsg('Subscription activated! You can now run diagnoses.');
      navigate('/website-diagnosis', { replace: true });
      // Poll until webhook writes active status (up to 10s)
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        loadAll(apiKey);
        if (attempts >= 5) clearInterval(poll);
      }, 2000);
      return () => clearInterval(poll);
    } else if (params.get('subscription') === 'cancel') {
      setError('Subscription setup was cancelled.');
      navigate('/website-diagnosis', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        const key = data?.api_key ?? null;
        setApiKey(key);
        loadAll(key);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Pre-fill notification email from Supabase user
  useEffect(() => {
    if (!userId) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setNotificationEmail(session.user.email);
    });
  }, [userId]);

  async function loadAll(key?: string | null) {
    if (!userId) return;
    const k = key ?? apiKey ?? '';
    setIsLoading(true);
    try {
      const [subRes, schedRes, repRes] = await Promise.all([
        fetch(`${API_URL}/api/stripe/subscription/${userId}`, { headers: { 'x-api-key': k } }),
        fetch(`${API_URL}/api/diagnosis/schedule/${userId}`, { headers: { 'x-api-key': k } }),
        fetch(`${API_URL}/api/diagnosis/reports/${userId}`, { headers: { 'x-api-key': k } }),
      ]);

      if (subRes.ok) {
        const sub = await subRes.json();
        setSubscription(sub);
      }

      if (schedRes.ok) {
        const sched = await schedRes.json();
        if (sched) {
          setSchedule(sched);
          setWebsiteUrl(sched.website_url || '');
          setSelectedTypes(sched.scan_types?.length ? sched.scan_types : ['gdpr_pecr']);
          if (sched.notification_email) setNotificationEmail(sched.notification_email);
          setScheduleInterval((sched.interval_months as 1 | 3 | 6 | 12) || 1);
          setScheduleEnabled(sched.enabled ?? true);
        }
      }

      if (repRes.ok) {
        const reps = await repRes.json();
        setReports(Array.isArray(reps) ? reps : []);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubscribe = async () => {
    if (!userId) return;
    setIsCreatingCheckout(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey ?? ''},
        body: JSON.stringify({ userId, email: notificationEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/stripe/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey ?? ''},
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open portal');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open subscription portal');
    }
  };

  const handleScan = async () => {
    if (!websiteUrl.trim() || selectedTypes.length === 0) return;
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    try {
      const res = await fetch(`${API_URL}/api/diagnosis/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey ?? ''},
        body: JSON.stringify({
          userId,
          url: websiteUrl.trim(),
          scanTypes: selectedTypes,
          notificationEmail: notificationEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setScanResult(data.report);
      setReports(prev => [data.savedReport, ...prev].slice(0, 20));
      setSuccessMsg('Diagnosis complete! Report has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!websiteUrl.trim() || !userId) return;
    setIsSavingSchedule(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/diagnosis/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey ?? ''},
        body: JSON.stringify({
          userId,
          url: websiteUrl.trim(),
          scanTypes: selectedTypes,
          intervalMonths: scheduleInterval,
          notificationEmail: notificationEmail.trim() || undefined,
          enabled: scheduleEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save schedule');
      setSchedule(data);
      setSuccessMsg('Schedule saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const toggleType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const isSubscribed = subscription?.status === 'active';

  const checksByCategory = (checks: DiagnosisCheck[]) => {
    const map: Record<string, DiagnosisCheck[]> = {};
    checks.forEach(c => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return map;
  };

  if (isLoading) {
    return (
      <div className="diag-loading">
        <Loader2 size={24} className="diag-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="diag-container">
      <div className="diag-header">
        <div>
          <h1 className="diag-title">Website Diagnosis</h1>
          <p className="diag-subtitle">
            AI-powered compliance audit across GDPR, CCPA, ISO 27001, accessibility and more.
          </p>
        </div>
        <div className="diag-header-actions">
          {isSubscribed ? (
            <button className="diag-manage-btn" onClick={handleManageSubscription}>
              <CreditCard size={14} /> Manage Subscription
            </button>
          ) : null}
        </div>
      </div>

      {error && <div style={{ marginBottom: '1rem' }}><Alert variant="error">{error}</Alert></div>}
      {successMsg && <div style={{ marginBottom: '1rem' }}><Alert variant="success">{successMsg}</Alert></div>}

      {!isSubscribed ? (
        <div className="diag-paywall">
          <div className="diag-paywall-icon"><Shield size={40} /></div>
          <h2 className="diag-paywall-title">Website Diagnosis</h2>
          <p className="diag-paywall-desc">
            Get a full compliance audit of your website — GDPR, CCPA, ISO 27001, accessibility and more.
            Scheduled reports delivered to your inbox.
          </p>
          <ul className="diag-paywall-features">
            <li><CheckCircle2 size={16} /> AI-powered compliance checks across 5 frameworks</li>
            <li><CheckCircle2 size={16} /> Actionable audit checklist with risk scoring</li>
            <li><CheckCircle2 size={16} /> Scheduled reports (monthly to yearly)</li>
            <li><CheckCircle2 size={16} /> Email delivery via Resend</li>
          </ul>
          <div className="diag-paywall-price">
            <span className="diag-price-amount">£1</span>
            <span className="diag-price-period">/ month</span>
          </div>
          <Button
            variant="primary"
            onClick={handleSubscribe}
            disabled={isCreatingCheckout}
            className="diag-subscribe-btn"
          >
            {isCreatingCheckout ? <><Loader2 size={14} className="diag-spinner" /> Redirecting…</> : 'Subscribe Now'}
          </Button>
        </div>
      ) : (
        <div className="diag-body">
          <div className="diag-config-card">
            <h2 className="diag-section-title">Configure Diagnosis</h2>

            <div className="diag-field">
              <label className="diag-label">Website URL</label>
              <input
                type="url"
                className="diag-input"
                placeholder="https://www.example.com"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                disabled={isScanning}
              />
            </div>

            <div className="diag-field">
              <label className="diag-label">Compliance Checks</label>
              <div className="diag-checklist">
                {SCAN_TYPES.map(type => (
                  <label key={type.id} className="diag-check-item">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => toggleType(type.id)}
                      disabled={isScanning}
                    />
                    <div>
                      <span className="diag-check-label">{type.label}</span>
                      <span className="diag-check-desc">{type.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="diag-field">
              <label className="diag-label"><Mail size={14} /> Notification Email</label>
              <input
                type="email"
                className="diag-input"
                placeholder="you@company.com"
                value={notificationEmail}
                onChange={e => setNotificationEmail(e.target.value)}
                disabled={isScanning}
              />
            </div>

            <div className="diag-field">
              <label className="diag-label"><Clock size={14} /> Scheduled Report</label>
              <div className="diag-schedule-row">
                <label className="diag-toggle">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={e => setScheduleEnabled(e.target.checked)}
                  />
                  <span>Enable scheduled reports</span>
                </label>
                {scheduleEnabled && (
                  <div className="diag-interval-pills">
                    {INTERVALS.map(i => (
                      <button
                        key={i.value}
                        className={`diag-interval-pill ${scheduleInterval === i.value ? 'active' : ''}`}
                        onClick={() => setScheduleInterval(i.value)}
                      >
                        {i.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {schedule?.next_run_at && (
                <p className="diag-next-run">
                  Next scheduled run: {new Date(schedule.next_run_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            <div className="diag-actions">
              <button
                className="diag-save-btn"
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule || !websiteUrl.trim()}
              >
                {isSavingSchedule ? <><Loader2 size={14} className="diag-spinner" />Saving…</> : 'Save Schedule'}
              </button>
              <Button
                variant="primary"
                onClick={handleScan}
                disabled={isScanning || !websiteUrl.trim() || selectedTypes.length === 0}
                className="diag-scan-btn"
              >
                {isScanning
                  ? <><Loader2 size={14} className="diag-spinner" />Scanning…</>
                  : <><RefreshCw size={14} />Run Diagnosis Now</>
                }
              </Button>
            </div>
          </div>

          {scanResult && (
            <div className="diag-result-card">
              <div className="diag-result-header">
                <div>
                  <h2 className="diag-section-title">Latest Diagnosis</h2>
                  <p className="diag-result-summary">{scanResult.summary}</p>
                </div>
                <ScoreBadge score={scanResult.score} riskLevel={scanResult.riskLevel} />
              </div>

              {Object.entries(checksByCategory(scanResult.checks)).map(([cat, checks]) => {
                const typeLabel = SCAN_TYPES.find(t => t.id === cat)?.label || cat;
                return (
                  <div key={cat} className="diag-category-block">
                    <h3 className="diag-category-title">{typeLabel}</h3>
                    <div className="diag-checks-list">
                      {checks.map(check => (
                        <div key={check.id} className={`diag-check-row diag-check-${check.status}`}>
                          <StatusIcon status={check.status} />
                          <div className="diag-check-content">
                            <span className="diag-check-title">{check.title}</span>
                            <span className="diag-check-detail">{check.detail}</span>
                            {check.action && check.status !== 'pass' && (
                              <span className="diag-check-action">Action: {check.action}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {reports.length > 0 && (
            <div className="diag-history-card">
              <h2 className="diag-section-title">Report History</h2>
              <div className="diag-history-list">
                {reports.map(rep => (
                  <div key={rep.id} className="diag-history-item">
                    <button
                      className="diag-history-header"
                      onClick={() => setExpandedReport(expandedReport === rep.id ? null : rep.id)}
                    >
                      <div className="diag-history-meta">
                        <span className="diag-history-url">{rep.website_url}</span>
                        <span className="diag-history-date">
                          {new Date(rep.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="diag-history-right">
                        <span className={`diag-risk-badge diag-risk-${rep.report?.riskLevel}`}>
                          {rep.report?.riskLevel ?? '—'} risk
                        </span>
                        <span className="diag-history-score">{rep.report?.score ?? '—'}/100</span>
                        {expandedReport === rep.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {expandedReport === rep.id && rep.report?.checks && (
                      <div className="diag-history-body">
                        <p className="diag-result-summary">{rep.report.summary}</p>
                        {Object.entries(checksByCategory(rep.report.checks)).map(([cat, checks]) => {
                          const typeLabel = SCAN_TYPES.find(t => t.id === cat)?.label || cat;
                          return (
                            <div key={cat} className="diag-category-block">
                              <h3 className="diag-category-title">{typeLabel}</h3>
                              <div className="diag-checks-list">
                                {checks.map(check => (
                                  <div key={check.id} className={`diag-check-row diag-check-${check.status}`}>
                                    <StatusIcon status={check.status} />
                                    <div className="diag-check-content">
                                      <span className="diag-check-title">{check.title}</span>
                                      <span className="diag-check-detail">{check.detail}</span>
                                      {check.action && check.status !== 'pass' && (
                                        <span className="diag-check-action">Action: {check.action}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
