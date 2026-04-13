import { Check, Loader2, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import { API_URL } from '../lib/config';

interface Props {
  policyType: string;
  websiteUrl: string;
  onUrlChange: (url: string) => void;
  onResult: (analysis: Record<string, unknown>) => void;
  disabled?: boolean;
}

export const AiPrefillButton: React.FC<Props> = ({
  policyType,
  websiteUrl,
  onUrlChange,
  onResult,
  disabled,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleScan = async () => {
    const url = websiteUrl.trim();
    if (!url) return;
    setIsScanning(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`${API_URL}/api/analyze-policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, policyType }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }
      const { analysis } = await response.json();
      onResult(analysis);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to analyse website');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="ai-scan-banner">
      <div className="ai-scan-banner-header">
        <Wand2 size={16} />
        <span>AI Auto-fill</span>
      </div>
      <p className="ai-scan-banner-desc">
        Enter your website URL and click <strong>Scan &amp; Auto-fill</strong> — AI will analyse your site and pre-populate all wizard steps for you to review.
      </p>
      <div className="ai-scan-row">
        <input
          type="url"
          className="ai-scan-input"
          value={websiteUrl}
          onChange={e => onUrlChange(e.target.value)}
          placeholder="https://www.example.com"
          disabled={isScanning || disabled}
        />
        <button
          type="button"
          className="ai-scan-btn"
          onClick={handleScan}
          disabled={isScanning || !websiteUrl.trim() || disabled}
        >
          {isScanning ? (
            <><Loader2 size={14} className="ai-scan-spinner" />Scanning…</>
          ) : (
            <><Wand2 size={14} />Scan &amp; Auto-fill</>
          )}
        </button>
      </div>
      {error && <p className="ai-scan-error">{error}</p>}
      {success && (
        <p className="ai-scan-success">
          <Check size={13} /> Wizard fields pre-filled — please review and adjust each step.
        </p>
      )}
    </div>
  );
};
