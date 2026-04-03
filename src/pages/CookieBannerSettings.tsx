import { Check, ExternalLink, Eye, Grid, Menu } from 'lucide-react';
import React from 'react';
import { useCookieConfig } from '../context/CookieContext';
import { APP_URL } from '../lib/config';
import './CookieBannerSettings.css';

export const CookieBannerSettings: React.FC = () => {
  const { bannerConfig, setBannerConfig, setIsPreviewVisible, userId } = useCookieConfig();
  const { theme, styleMode, position, size } = bannerConfig;

  const updateConfig = (key: keyof typeof bannerConfig, value: string) => {
    setBannerConfig(prev => ({ ...prev, [key]: value, isConfigured: true }));
  };

  const themes = [
    { id: 'blue', color: '#3b82f6' },
    { id: 'emerald', color: '#10b981' },
    { id: 'rose', color: '#ef4444' },
    { id: 'amber', color: '#f59e0b' },
    { id: 'black', color: '#000000' },
    { id: 'white', color: '#ffffff' },
  ];

  return (
    <div className="banner-settings-container">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Cookie Banner Setting</h1>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Personalize the behavior and appearance of your cookie banner.</p>
      
      <div className="banner-settings-layout">
        {/* Left Panel */}
        <div className="controls-panel">
          
          <div className="control-group">
            <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
              <div>
                <div className="control-group-title">Built-in Themes</div>
                <div className="theme-selector">
                  <div className="theme-circles">
                    {themes.map(t => (
                      <div 
                        key={t.id}
                        className={`theme-circle ${t.id === 'white' ? 'white' : ''} ${theme === t.color ? 'active' : ''}`}
                        style={{ backgroundColor: t.color }}
                        onClick={() => updateConfig('theme', t.color)}
                      >
                        {theme === t.color && <Check size={16} color={t.id === 'white' ? '#000' : '#fff'} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div className="theme-divider"></div>
                <div>
                  <div className="control-group-title">Custom Theme</div>
                  <div className="theme-circle theme-circle-custom"></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #e5e7eb', margin: '0.5rem 0' }}></div>

          <div className="control-group">
            <div className="control-group-title">Display Style</div>
            <div className="toggle-group">
              <button className={`toggle-button ${styleMode === 'stretch' ? 'active' : ''}`} onClick={() => updateConfig('styleMode', 'stretch')}>
                <div className="toggle-icon stretch"></div>
                Stretch
              </button>
              <button className={`toggle-button ${styleMode === 'banner' ? 'active' : ''}`} onClick={() => updateConfig('styleMode', 'banner')}>
                <div className="toggle-icon banner"></div>
                Banner
              </button>
              <button className={`toggle-button ${styleMode === 'modal' ? 'active' : ''}`} onClick={() => updateConfig('styleMode', 'modal')}>
                <div className="toggle-icon modal"></div>
                Modal
              </button>
              <button className={`toggle-button ${styleMode === 'tooltip' ? 'active' : ''}`} onClick={() => updateConfig('styleMode', 'tooltip')}>
                <div className="toggle-icon tooltip"></div>
                Tooltip
              </button>
            </div>
          </div>

          <div className="control-group">
            <div className="control-group-title">Position</div>
            <div className="toggle-group">
              <button className={`toggle-button ${position === 'top' ? 'active' : ''}`} onClick={() => updateConfig('position', 'top')}>
                <div className="toggle-icon top"></div>
                Top
              </button>
              <button className={`toggle-button ${position === 'bottom' ? 'active' : ''}`} onClick={() => updateConfig('position', 'bottom')}>
                <div className="toggle-icon bottom"></div>
                Bottom
              </button>
            </div>
          </div>

          <div className="control-group">
            <div className="control-group-title">Size</div>
            <div className="toggle-group">
              <button className={`toggle-button ${size === 'standard' ? 'active' : ''}`} onClick={() => updateConfig('size', 'standard')}>
                <Menu size={16} className={size === 'standard' ? 'text-blue-500' : 'text-gray-500'} />
                Standard
              </button>
              <button className={`toggle-button ${size === 'compact' ? 'active' : ''}`} onClick={() => updateConfig('size', 'compact')}>
                <Grid size={16} className={size === 'compact' ? 'text-blue-500' : 'text-gray-500'} />
                Compact
              </button>
            </div>
          </div>

        </div>

        {/* Right Panel */}
        <div className="preview-panel">
          <div className="browser-mockup">
            <div className="browser-header">
              <div className="browser-dot"></div>
              <div className="browser-dot"></div>
              <div className="browser-dot"></div>
            </div>
            <div className="browser-content">
              <div className="browser-main-mock">
                <div className="browser-top-mock"></div>
                <div style={{ flex: 1 }}></div>
              </div>
              <div className="browser-sidebar-mock"></div>

              {/* The dynamic mock banner */}
              <div className={`banner-mock ${styleMode} ${position} ${size}`}>
                <div className="banner-mock-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris imperdiet sem ante.
                </div>
                <button 
                  className="banner-mock-btn" 
                  style={{ backgroundColor: theme, color: theme === '#ffffff' ? '#000' : '#fff', border: theme === '#ffffff' ? '1px solid #d1d5db' : 'none' }}
                >
                  Button
                </button>
              </div>
            </div>
          </div>

          <button className="preview-btn" onClick={() => setIsPreviewVisible(true)}>
            <Eye size={18} /> PREVIEW
          </button>
          
          <a 
            href={`${APP_URL}/test-embed.html?reset=1&id=${userId || 'YOUR_USER_ID'}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="preview-btn flex justify-center items-center gap-1"
            style={{ textDecoration: 'none', marginTop: '1rem' }}
          >
            <ExternalLink size={18} /> LIVE PREVIEW
          </a>
        </div>
      </div>
    </div>
  );
};
