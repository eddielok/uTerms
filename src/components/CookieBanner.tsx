import { Check, ChevronDown, ChevronUp, Cookie, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from './Button';
import { useCookieConfig } from '../context/CookieContext';
import './CookieBanner.css';

// uTerms site-wide cookie categories (shown to public visitors)
const SITE_CATEGORIES = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Strictly necessary for the website to function. These cannot be disabled.',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how visitors interact with the website so we can improve it.',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Used to track visitors across websites to display relevant advertisements.',
  },
];

// Routes where the banner should not appear (app pages + auth pages)
const APP_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/dashboard',
  '/consent-management',
  '/policy-management',
  '/cookie-policy',
  '/terms-of-service',
  '/eula',
  '/return-policy',
  '/disclaimer',
  '/shipping-policy',
  '/acceptable-use-policy',
  '/impressum',
  '/accessibility-statement',
  '/settings',
  '/api-documentation',
];

export const CookieBanner: React.FC = () => {
  const { isPreviewVisible, setIsPreviewVisible, bannerConfig, scannedData } = useCookieConfig();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ essential: true });

  // Determine which categories to display
  const isPreview = isPreviewVisible;
  const categories = isPreview && scannedData ? scannedData.categories : SITE_CATEGORIES;

  // Don't show organic banner on app pages
  const isAppPage = APP_ROUTE_PREFIXES.some(prefix =>
    location.pathname.startsWith(prefix)
  );

  const showBanner = isPreview || (isVisible && !isAppPage);

  useEffect(() => {
    const initialPrefs: Record<string, boolean> = {};
    categories.forEach(c => { initialPrefs[c.id] = c.id === 'essential'; });
    setPrefs(initialPrefs);
  }, [isPreview, scannedData]);

  useEffect(() => {
    if (isPreview) return;
    const consent = localStorage.getItem('uterms_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isPreview]);

  const closeBanner = (consentValue: string) => {
    if (isPreview) {
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

  // Preview uses the user's configured theme/style; organic banner uses fixed defaults
  const theme = isPreview ? bannerConfig.theme : '#6366f1';
  const styleMode = isPreview ? bannerConfig.styleMode : 'banner';
  const position = isPreview ? bannerConfig.position : 'bottom';
  const size = isPreview ? bannerConfig.size : 'standard';

  return (
    <div
      className={`cookie-banner-wrapper ${styleMode} ${position} ${size}`}
      style={{
        '--color-primary': theme,
        '--color-primary-hover': theme,
        '--color-primary-light': `${theme}20`,
      } as React.CSSProperties}
    >
      <div className="cookie-banner glass-panel" style={{ backgroundColor: 'white' }}>
        {isPreview && (
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
              We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
        </div>

        {isDetailsOpen && (
          <div className="cookie-preferences">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`pref-item ${cat.id !== 'essential' ? 'cursor-pointer' : ''}`}
                onClick={() => togglePref(cat.id)}
              >
                <div className="pref-info">
                  <span className="pref-name font-medium">{cat.name}</span>
                  {cat.id === 'essential' && (
                    <span
                      className="text-xs font-medium ml-2 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                    >
                      Always Active
                    </span>
                  )}
                  <p className="text-xs text-muted mt-1">{cat.description}</p>
                </div>
                <div className={`pref-switch ${cat.id === 'essential' || prefs[cat.id] ? 'checked' : ''} ${cat.id === 'essential' ? 'disabled' : ''}`}>
                  <div className="switch-thumb">
                    {(cat.id === 'essential' || prefs[cat.id]) && (
                      <Check size={12} style={{ color: 'var(--color-primary)' }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
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
