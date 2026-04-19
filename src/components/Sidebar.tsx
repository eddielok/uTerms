import {
  ChevronDown,
  ChevronUp,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConsentOpen, setIsConsentOpen] = useState(
    location.pathname.startsWith("/consent-management"),
  );
  const [isPolicyOpen, setIsPolicyOpen] = useState(
    location.pathname.startsWith("/policy-scan") ||
      location.pathname.startsWith("/policy-management") ||
      location.pathname.startsWith("/cookie-policy") ||
      location.pathname.startsWith("/terms-of-service") ||
      location.pathname.startsWith("/eula") ||
      location.pathname.startsWith("/return-policy") ||
      location.pathname.startsWith("/disclaimer") ||
      location.pathname.startsWith("/shipping-policy") ||
      location.pathname.startsWith("/acceptable-use-policy") ||
      location.pathname.startsWith("/impressum") ||
      location.pathname.startsWith("/accessibility-statement"),
  );

  const [userEmail, setUserEmail] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname.startsWith("/consent-management")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsConsentOpen(true);
    }
    if (
      location.pathname.startsWith("/policy-management") ||
      location.pathname.startsWith("/cookie-policy") ||
      location.pathname.startsWith("/terms-of-service") ||
      location.pathname.startsWith("/eula") ||
      location.pathname.startsWith("/return-policy") ||
      location.pathname.startsWith("/disclaimer") ||
      location.pathname.startsWith("/shipping-policy") ||
      location.pathname.startsWith("/acceptable-use-policy") ||
      location.pathname.startsWith("/impressum") ||
      location.pathname.startsWith("/accessibility-statement")
    ) {
      setIsPolicyOpen(true);
    }
  }, [location.pathname]);

  // Fetch logged in user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || "Unknown User");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || "Unknown User");
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
            <text x="12" y="12" dominantBaseline="central" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#fb923c" stroke="none">U</text>
          </svg>
        <span className="brand-name font-bold text-xl">uTerms</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
          end
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>

        <div className="sidebar-group">
          <button
            className={`sidebar-link ${location.pathname.startsWith("/consent-management") ? "active-group" : ""}`}
            onClick={() => setIsConsentOpen(!isConsentOpen)}
          >
            <ShieldCheck size={20} />
            <span style={{ flex: 1, textAlign: "left" }}>
              Consent Management
            </span>
            {isConsentOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {isConsentOpen && (
            <div className="sidebar-sub-menu">
              <NavLink
                to="/consent-management/cookies"
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Check List
              </NavLink>
              <NavLink
                to="/consent-management/scanner"
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Website Cookie
              </NavLink>
              <NavLink
                to="/consent-management/banner-settings"
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Cookie Banner
              </NavLink>
              <NavLink
                to="/consent-management/logs"
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Cookie Log
              </NavLink>
            </div>
          )}
        </div>

        <div className="sidebar-group">
          <button
            className={`sidebar-link ${location.pathname.startsWith("/policy-management") || location.pathname.startsWith("/cookie-policy") || location.pathname.startsWith("/terms-of-service") || location.pathname.startsWith("/eula") || location.pathname.startsWith("/return-policy") || location.pathname.startsWith("/disclaimer") || location.pathname.startsWith("/shipping-policy") || location.pathname.startsWith("/acceptable-use-policy") || location.pathname.startsWith("/impressum") || location.pathname.startsWith("/accessibility-statement") ? "active-group" : ""}`}
            onClick={() => setIsPolicyOpen(!isPolicyOpen)}
          >
            <FileText size={20} />
            <span style={{ flex: 1, textAlign: "left" }}>
              Policy Management
            </span>
            {isPolicyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isPolicyOpen && (
            <div className="sidebar-sub-menu">
              <NavLink
                to="/policy-scan"
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Policy Scan
              </NavLink>
              <NavLink
                to="/policy-management"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Privacy Policy
              </NavLink>
              <NavLink
                to="/cookie-policy"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Cookie Policy
              </NavLink>
              <NavLink
                to="/terms-of-service"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Terms of Service
              </NavLink>
              <NavLink
                to="/eula"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                EULA
              </NavLink>
              <NavLink
                to="/return-policy"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Return Policy
              </NavLink>
              <NavLink
                to="/disclaimer"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Disclaimer
              </NavLink>
              <NavLink
                to="/shipping-policy"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Shipping Policy
              </NavLink>
              <NavLink
                to="/acceptable-use-policy"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Acceptable Use Policy
              </NavLink>
              <NavLink
                to="/impressum"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Impressum
              </NavLink>
              <NavLink
                to="/accessibility-statement"
                end
                className={({ isActive }) =>
                  `sidebar-sub-link ${isActive ? "active" : ""}`
                }
              >
                Accessibility Statement
              </NavLink>
            </div>
          )}
        </div>

        <NavLink
          to="/api-documentation"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FileText size={20} />
          <span>API Documentation</span>
        </NavLink>

      </nav>

      <div className="sidebar-footer" ref={dropdownRef}>
        <div
          className="user-profile-container"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="user-profile">
            <div className="avatar">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info">
              <span className="user-name" title={userEmail}>
                {userEmail}
              </span>
            </div>
          </div>
          <ChevronUp
            size={16}
            className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
          />

          {isDropdownOpen && (
            <div className="user-dropdown">
              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
              <button
                className="dropdown-item text-red-600"
                onClick={handleSignOut}
              >
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
