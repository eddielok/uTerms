import { Check, ChevronDown, ChevronUp, Cookie, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { useCookieConfig } from '../context/CookieContext';
import './CookieBanner.css';

export const CookieBanner: React.FC = () => {
  const { isPreviewVisible, setIsPreviewVisible, bannerConfig, scannedData } = useCookieConfig();
  const [isVisible, setIsVisible] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ essential: true });

  const showBanner = isVisible || isPreviewVisible;

  useEffect(() => {
    // If we have scanned data, initialize preferences
    if (scannedData) {
      const initialPrefs: Record<string, boolean> = {};
      scannedData.categories.forEach(c => initialPrefs[c.id] = c.id === 'essential');
      setPrefs(initialPrefs);
    }
  }, [scannedData]);

  useEffect(() => {
    if (isPreviewVisible) return;
    const consent = localStorage.getItem('uterms_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isPreviewVisible]);

  const closeBanner = (consentValue: string) => {
    if (isPreviewVisible) {
      setIsPreviewVisible(false);
    } else {
      localStorage.setItem('uterms_consent', consentValue);
      setIsVisible(false);
    }
  };

  const handleAcceptAll = () => closeBanner('all');
  const handleRejectAll = () => closeBanner('essential');
  const handleSavePreferences = () => closeBanner(JSON.stringify(prefs));

  const togglePref = (key: string) => {
    if (key === 'essential') return;
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`cookie-banner-wrapper ${bannerConfig.styleMode} ${bannerConfig.position} ${bannerConfig.size}`}
      style={{
        '--color-primary': bannerConfig.theme,
        '--color-primary-hover': bannerConfig.theme,
        '--color-primary-light': `${bannerConfig.theme}20`,
      } as React.CSSProperties}
    >
      <div className="cookie-banner glass-panel" style={{ backgroundColor: 'white' }}>
        {isPreviewVisible && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', cursor: 'pointer', color: '#6b7280' }} onClick={() => setIsPreviewVisible(false)}>
            <X size={20} />
          </div>
        )}
        
        <div className="cookie-banner-header">
          <div className="cookie-icon-bg">
            <Cookie size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="cookie-banner-title">
            <h3>We value your privacy</h3>
            <p className="text-muted text-sm mt-1">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
        </div>

        {isDetailsOpen && (
          <div className="cookie-preferences">
            {scannedData ? scannedData.categories.map(cat => (
              <div key={cat.id} className={`pref-item ${cat.id === 'essential' ? '' : 'cursor-pointer'}`} onClick={() => togglePref(cat.id)}>
                <div className="pref-info">
                  <span className="pref-name font-medium">{cat.name}</span>
                  {cat.id === 'essential' && <span className="text-xs font-medium ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>Always Active</span>}
                  <p className="text-xs text-muted mt-1">{cat.description}</p>
                </div>
                <div className={`pref-switch ${cat.id === 'essential' || prefs[cat.id] ? 'checked' : ''} ${cat.id === 'essential' ? 'disabled' : ''}`}>
                  <div className="switch-thumb">{(cat.id === 'essential' || prefs[cat.id]) && <Check size={12} style={{ color: 'var(--color-primary)' }} />}</div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500 text-center py-4">No scan data available. Please run a website scan first.</div>
            )}
          </div>
        )}

        <div className="cookie-banner-actions">
          <button 
            className="customize-btn text-sm font-medium flex items-center gap-1 text-muted transition"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          >
            {isDetailsOpen ? 'Hide Preferences' : 'Customize Preferences'}
            {isDetailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="action-buttons">
            {isDetailsOpen ? (
              <Button variant="outline" size="sm" onClick={handleSavePreferences}>Save Preferences</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleRejectAll}>Reject All</Button>
            )}
            <Button variant="primary" size="sm" onClick={handleAcceptAll}>Accept All</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
