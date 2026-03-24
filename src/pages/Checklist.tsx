import { Check, Code, Copy, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookieConfig } from '../context/CookieContext';
import './Checklist.css';

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

  const handleCopy = () => {
    const scriptText = `<script src="http://localhost:5173/uterms-embed.js?id=${userId || 'YOUR_USER_ID'}&autoBlock=on"></script>`;
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPref = () => {
    const prefText = `<a href="#" class="uterms-display-preferences">Consent Preferences</a>`;
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

        <ChecklistItem
          step={5}
          title="Scan your website for GCM compliance"
          description={
            <div className="checklist-status-row">
              <span className="status-badge success"><Check size={14} /></span>
              <span>1 pages scanned</span>
              <a href="#" className="checklist-link">Scan now</a>
            </div>
          }
          metadata="Last successful scan: Feb 17, 2026"
          status="done"
        />
      </div>
    </div>
  );
};
