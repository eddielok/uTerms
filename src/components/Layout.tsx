import { Menu, X } from "lucide-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useCookieConfig } from "../context/CookieContext";
import { Button } from "./Button";
import "./Layout.css";

const ShieldUIcon = ({
  size = 24,
  className = "",
}: {
  size?: number | string;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
      fill="currentColor"
      stroke="none"
    >
      u
    </text>
  </svg>
);

export const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { userId, isAuthLoading } = useCookieConfig();

  // Close menu on route change
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout">
      <header className="navbar glass-panel">
        <div className="container navbar-inner">
          <Link to="/" className="brand flex items-center gap-2">
            <ShieldUIcon className="text-primary" size={28} />
            <span className="brand-name font-bold text-xl">uTerms</span>
          </Link>

          <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            <Link to="/features" className="nav-link">
              Features
            </Link>
            <Link to="/policies" className="nav-link">
              Resources
            </Link>

            <div className="nav-actions-mobile">
              {userId ? (
                <Link to="/dashboard">
                  <Button variant="primary" fullWidth>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" fullWidth>
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" fullWidth>
                      Request Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className="nav-actions-desktop flex items-center gap-4">
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
            ) : userId ? (
              <Link to="/dashboard">
                <Button variant="primary">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium hover:text-primary transition"
                >
                  Log in
                </Link>
                <Link to="/register">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand flex items-center gap-2">
              <ShieldUIcon size={24} />
              <span className="font-bold text-lg">uTerms</span>
            </Link>
            <p className="text-muted mt-4 text-sm">
              A privacy management and compliance AI automation platform. built
              for modern data teams.
            </p>
          </div>
          <div className="footer-links">
            <h4 className="font-semibold mb-4">Company</h4>
            <Link to="/about">About Us</Link>
            <a href="mailto:privacy@uterms.io">Contact</a>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service-uterms">Terms of Service</Link>
          </div>
          <div className="footer-links footer-links-legal">
            <h4 className="font-semibold mb-4">Product</h4>
            <div className="footer-product-grid">
              <Link to="/features">Features</Link>
              <Link to="/policies">Privacy Policy</Link>
              <Link to="/policies?tab=impressum">Impressum</Link>
              <Link to="/policies?tab=cookies">Cookie Policy</Link>
              <Link to="/policies?tab=eula">EULA</Link>
              <Link to="/policies?tab=return">Return Policy</Link>
              <Link to="/policies?tab=disclaimer">Disclaimer</Link>
              <Link to="/policies?tab=shipping">Shipping Policy</Link>
              <Link to="/policies?tab=aup">Acceptable Use Policy</Link>
              <Link to="/policies?tab=terms">Terms of Service</Link>
              <Link to="/policies?tab=accessibility">Accessibility Statement</Link>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} uTerms Inc. All rights reserved.
          </p>
          <p className="text-muted text-sm">
            <Link to="/do-not-sell" className="hover:text-primary transition">Do Not Sell or Share My Personal Information</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};
