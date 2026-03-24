import { ChevronDown, ChevronUp, FileText, LayoutDashboard, Settings, ShieldCheck, LogOut } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConsentOpen, setIsConsentOpen] = useState(
    location.pathname.startsWith('/consent-management')
  );
  
  const [userEmail, setUserEmail] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname.startsWith('/consent-management')) {
      setIsConsentOpen(true);
    }
  }, [location.pathname]);

  // Fetch logged in user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || 'Unknown User');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || 'Unknown User');
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShieldCheck className="text-primary" size={28} />
        <span className="brand-name font-bold text-xl">uTerms</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
        
        <div className="sidebar-group">
          <button 
            className={`sidebar-link ${location.pathname.startsWith('/consent-management') ? 'active-group' : ''}`}
            onClick={() => setIsConsentOpen(!isConsentOpen)}
          >
            <ShieldCheck size={20} />
            <span style={{ flex: 1, textAlign: 'left' }}>Consent Management</span>
            {isConsentOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isConsentOpen && (
            <div className="sidebar-sub-menu">
              <NavLink to="/consent-management/cookies" className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}>
                Check List
              </NavLink>
              <NavLink to="/consent-management/scanner" className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}>
               Website Cookie 
              </NavLink>
              <NavLink to="/consent-management/banner-settings" className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}>
                Cookie Banner
              </NavLink>
              <NavLink to="/consent-management/logs" className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}>
                Cookie Log
              </NavLink>
              
            </div>
          )}
        </div>
        
        <NavLink 
          to="/policy-management" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} />
          <span>Policy Management</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer" ref={dropdownRef}>
        <div className="user-profile-container" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="user-profile">
            <div className="avatar">{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</div>
            <div className="user-info">
              <span className="user-name" title={userEmail}>{userEmail}</span>
            </div>
          </div>
          <ChevronUp size={16} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
          
          {isDropdownOpen && (
            <div className="user-dropdown">
              <button className="dropdown-item text-red-600" onClick={handleSignOut}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
