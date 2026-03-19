import { Check, ChevronDown, ChevronUp, Cookie } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import './CookieBanner.css';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true, // Always true
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('uterm_consent');
    if (!consent) {
      // Small delay for smooth animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('uterm_consent', 'all');
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('uterm_consent', 'essential');
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('uterm_consent', JSON.stringify(prefs));
    setIsVisible(false);
  };

  const togglePref = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Cannot toggle essential
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-wrapper">
      <div className="cookie-banner glass-panel">
        <div className="cookie-banner-header">
          <div className="cookie-icon-bg">
            <Cookie size={24} className="text-primary" />
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
            <div className="pref-item">
              <div className="pref-info">
                <span className="pref-name font-medium">Essential Cookies</span>
                <span className="text-xs text-primary font-medium ml-2 bg-primary-light px-2 py-0.5 rounded-full">Always Active</span>
                <p className="text-xs text-muted mt-1">Necessary for the website to function properly.</p>
              </div>
              <div className="pref-switch disabled checked">
                <div className="switch-thumb"><Check size={12} className="text-primary" /></div>
              </div>
            </div>

            <div className="pref-item cursor-pointer" onClick={() => togglePref('analytics')}>
              <div className="pref-info">
                <span className="pref-name font-medium">Analytics Cookies</span>
                <p className="text-xs text-muted mt-1">Help us understand how visitors interact with the website.</p>
              </div>
              <div className={`pref-switch ${prefs.analytics ? 'checked' : ''}`}>
                <div className="switch-thumb">{prefs.analytics && <Check size={12} className="text-primary" />}</div>
              </div>
            </div>

            <div className="pref-item cursor-pointer" onClick={() => togglePref('marketing')}>
              <div className="pref-info">
                <span className="pref-name font-medium">Marketing Cookies</span>
                <p className="text-xs text-muted mt-1">Used to deliver advertisements relevant to you.</p>
              </div>
              <div className={`pref-switch ${prefs.marketing ? 'checked' : ''}`}>
                <div className="switch-thumb">{prefs.marketing && <Check size={12} className="text-primary" />}</div>
              </div>
            </div>
            
            <div className="pref-item cursor-pointer" onClick={() => togglePref('preferences')}>
              <div className="pref-info">
                <span className="pref-name font-medium">Preference Cookies</span>
                <p className="text-xs text-muted mt-1">Allows the website to remember choices you make.</p>
              </div>
              <div className={`pref-switch ${prefs.preferences ? 'checked' : ''}`}>
                <div className="switch-thumb">{prefs.preferences && <Check size={12} className="text-primary" />}</div>
              </div>
            </div>
          </div>
        )}

        <div className="cookie-banner-actions">
          <button 
            className="customize-btn text-sm font-medium flex items-center gap-1 text-muted hover:text-primary transition"
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
