import { AlertTriangle, Check, CheckCircle, Code, Copy, Loader2, Settings, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import './Checklist.css';

interface GCMCheck {
  id: string;
  label: string;
  description: string;
  pass: boolean | null;
  required: boolean;
}

interface GCMResult {
  url: string;
  scannedAt: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  passCount: number;
  totalChecks: number;
  checks: GCMCheck[];
}

const GCM_STORAGE_KEY = 'uterms_gcm_scan';

interface ChecklistItemProps {
  step: number;
  title: string;
  description: React.ReactNode;
  metadata?: string;
  status: 'done' | 'action';
  actionIcon?: 'settings' | 'code' | 'copy';
  actionLabel?: string;
  onActionClick?: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  step, 
  title, 
  description, 
  metadata, 
  status, 
  actionIcon, 
  actionLabel,
  onActionClick 
}) => {
  return (
    <div className="checklist-item">
      <div className="checklist-content">
        <h3 className="checklist-title">
          Step {step}: {title}
        </h3>
        <div className="checklist-description">{description}</div>
        {metadata && <div className="checklist-metadata">{metadata}</div>}
      </div>
      <div className="checklist-action-container">
        {status === 'done' ? (
          <div className="checklist-status-done">
            <Check size={18} strokeWidth={3} />
            <span>DONE</span>
          </div>
        ) : (
          <button className="checklist-button" onClick={onActionClick}>
            {actionIcon === 'settings' && <Settings size={18} />}
            {actionIcon === 'code' && <Code size={18} />}
            {actionIcon === 'copy' && <Copy size={18} />}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const Checklist: React.FC = () => {
  const navigate = useNavigate();
  const { scannedData, bannerConfig, userId } = useCookieConfig();
  const [copied, setCopied] = useState(false);
  const [copiedPref, setCopiedPref] = useState(false);
  const hasScan = !!scannedData;

  const [gcmUrl, setGcmUrl] = useState('');
  const [gcmScanning, setGcmScanning] = useState(false);
  const [gcmResult, setGcmResult] = useState<GCMResult | null>(null);
  const [gcmError, setGcmError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const loadGcmResult = async () => {
      const { data } = await supabase
        .from('gcm_scan_results')
        .select('url, status, pass_count, total_checks, checks, scanned_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) {
        const result: GCMResult = {
          url: data.url,
          status: data.status,
          passCount: data.pass_count,
          totalChecks: data.total_checks,
          checks: data.checks,
          scannedAt: data.scanned_at,
        };
        setGcmResult(result);
        setGcmUrl(data.url);
      } else {
        // fall back to localStorage if no DB record yet
        const saved = localStorage.getItem(GCM_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as GCMResult;
            setGcmResult(parsed);
            setGcmUrl(parsed.url);
          } catch { /* ignore */ }
        }
      }
    };
    loadGcmResult();
  }, [userId]);

  const handleGcmScan = async () => {
    if (!gcmUrl.trim()) return;
    setGcmScanning(true);
    setGcmError(null);
    try {
      const response = await fetch('http://localhost:3001/api/gcm-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: gcmUrl.trim() }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Backend returned ${response.status} (non-JSON). Restart the server: node server/index.js`);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Scan failed');
      setGcmResult(data);
      localStorage.setItem(GCM_STORAGE_KEY, JSON.stringify(data));
      if (userId) {
        await supabase.from('gcm_scan_results').upsert(
          {
            user_id: userId,
            url: data.url,
            status: data.status,
            pass_count: data.passCount,
            total_checks: data.totalChecks,
            checks: data.checks,
            scanned_at: data.scannedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setGcmError('Cannot reach backend. Make sure the server is running: node server/index.js');
      } else {
        setGcmError(err.message || 'Failed to scan');
      }
    } finally {
      setGcmScanning(false);
    }
  };

  const handleCopy = () => {
    const scriptText = `<script src="http://localhost:5173/uterms-embed.js?id=${userId || 'YOUR_USER_ID'}&autoBlock=on"></script>`;
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPref = () => {
    const prefText = `<a href="#" class="uterms-preferences">Consent Preferences</a>`;
    navigator.clipboard.writeText(prefText);
    setCopiedPref(true);
    setTimeout(() => setCopiedPref(false), 2000);
  };

  return (
    <div className="checklist-page-container">
      <div className="checklist-container">
        <ChecklistItem
          step={1}
          title="Scan your website"
          description={
            hasScan ? (
              <div className="checklist-status-row">
                <span className="status-badge success"><Check size={14} /></span>
                <span>{scannedData.pages} pages scanned</span>
              </div>
            ) : (
              "To get started, scan your website to your account."
            )
          }
          metadata={hasScan ? `Last successful scan: ${scannedData.date}` : undefined}
          status={hasScan ? 'done' : 'action'}
          actionIcon="settings"
          actionLabel="SCAN NOW"
          onActionClick={() => navigate('/consent-management/scanner')}
        />

        <ChecklistItem
          step={2}
          title="Configure Cookie Banner"
          description={
            bannerConfig.isConfigured ? (
              <div className="checklist-status-row">
                <span className="status-badge success"><Check size={14} /></span>
                <span>Banner configured</span>
                <button 
                  className="checklist-link border-none bg-transparent cursor-pointer p-0" 
                  onClick={() => navigate('/consent-management/banner-settings')}
                >
                  Edit settings
                </button>
              </div>
            ) : (
              "Customize your cookie banner from default settings to match your website's branding and user experience."
            )
          }
          status={bannerConfig.isConfigured ? 'done' : 'action'}
          actionIcon="settings"
          actionLabel="CUSTOMIZE"
          onActionClick={() => navigate('/consent-management/banner-settings')}
        />

        <ChecklistItem
          step={3}
          title="Embed Cookie Banner"
          description={
            hasScan ? (
              <>
                <div className="checklist-code-snippet mt-4">
                  <div className="code-snippet-header">
                    <span className="code-snippet-title">CODE SNIPPET</span>
                  </div>
                  <div className="code-snippet-content">
                    {`<script src="http://localhost:5173/uterms-embed.js?id=${userId || 'YOUR_USER_ID'}&autoBlock=on"></script>`}
                  </div>
                </div>
               
              </>
            ) : (
              "Generate an embedded script to install the consent banner on your website. Please scan your website first."
            )
          }
          status="action"
          actionIcon={hasScan ? "copy" : "settings"}
          actionLabel={hasScan ? (copied ? "COPIED" : "COPY") : "SCAN"}
          onActionClick={hasScan ? handleCopy : () => navigate('/consent-management/scanner')}
        />

        <ChecklistItem
          step={4}
          title="Embed Consent Preference"
          description={
            hasScan ? (
              <>
                <div>Allow visitors to change their consent preference anytime.</div>
                <div className="checklist-code-snippet mt-4">
                  <div className="code-snippet-header">
                    <span className="code-snippet-title">CODE SNIPPET</span>
                  </div>
                  <div className="code-snippet-content">
                    {`<a href="#" class="uterms-preferences">Consent Preferences</a>`}
                  </div>
                </div>
              </>
            ) : (
              "Allow visitors to change their consent preference anytime. Please scan your website first."
            )
          }
          status="action"
          actionIcon={hasScan ? "copy" : "settings"}
          actionLabel={hasScan ? (copiedPref ? "COPIED" : "COPY") : "SCAN"}
          onActionClick={hasScan ? handleCopyPref : () => navigate('/consent-management/scanner')}
        />

        {/* Step 5: GCM Compliance — custom layout for richer UI */}
        <div className="checklist-item">
          <div className="checklist-content">
            <h3 className="checklist-title">Step 5: Scan your website for GCM compliance</h3>
            <div className="checklist-description">
              Google Consent Mode v2 (GCM v2) is required by Google for all advertisers using Google Ads or Analytics. Enter your website URL to check compliance.
            </div>

            {/* URL input row */}
            <div className="gcm-input-row">
              <input
                className="gcm-url-input"
                type="url"
                placeholder="https://yourwebsite.com"
                value={gcmUrl}
                onChange={e => setGcmUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !gcmScanning && handleGcmScan()}
                disabled={gcmScanning}
              />
              <button
                className="checklist-button"
                onClick={handleGcmScan}
                disabled={gcmScanning || !gcmUrl.trim()}
              >
                {gcmScanning
                  ? <><Loader2 size={16} className="gcm-spin" /><span>Scanning…</span></>
                  : <><Settings size={16} /><span>SCAN NOW</span></>}
              </button>
            </div>

            {gcmError && (
              <p className="gcm-error">{gcmError}</p>
            )}

            {gcmResult && !gcmScanning && (
              <div className="gcm-results">
                <div className="gcm-checks">
                  {gcmResult.checks.map(check => (
                    <div key={check.id} className={`gcm-check-item ${check.pass === true ? 'pass' : check.pass === false ? 'fail' : 'unknown'}`}>
                      <span className="gcm-check-icon">
                        {check.pass === true
                          ? <CheckCircle size={15} />
                          : check.pass === false
                          ? <XCircle size={15} />
                          : <AlertTriangle size={15} />}
                      </span>
                      <div className="gcm-check-text">
                        <span className="gcm-check-label">{check.label}</span>
                        <span className="gcm-check-desc">{check.description}</span>
                      </div>
                      {!check.required && (
                        <span className="gcm-optional-badge">optional</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="gcm-scan-meta">
                  Last scanned: <strong>{gcmResult.url}</strong> — {new Date(gcmResult.scannedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="checklist-action-container">
            {gcmResult && !gcmScanning ? (
              <div className={`gcm-status-badge gcm-status-${gcmResult.status}`}>
                {gcmResult.status === 'compliant' && <><Check size={16} /><span>COMPLIANT</span></>}
                {gcmResult.status === 'partial' && <><AlertTriangle size={16} /><span>PARTIAL</span></>}
                {gcmResult.status === 'non_compliant' && <><XCircle size={16} /><span>NOT COMPLIANT</span></>}
                {gcmResult.status === 'not_applicable' && <><AlertTriangle size={16} /><span>NO GTM FOUND</span></>}
              </div>
            ) : gcmScanning ? (
              <div className="gcm-status-badge gcm-status-scanning">
                <Loader2 size={16} className="gcm-spin" />
                <span>SCANNING</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
