import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import { useCookieConfig } from "../context/CookieContext";
import "./Home.css";

export const Home: React.FC = () => {
  const { userId } = useCookieConfig();
  return (
    <div className="home-page">
      <Helmet>
        <title>uTerms — Cookie Consent & Privacy Policy Platform</title>
        <meta name="description" content="Automate cookie consent, generate GDPR-compliant privacy policies, and manage visitor consent globally. The all-in-one privacy compliance platform for your website." />
        <link rel="canonical" href="https://uterms.io/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is uTerms?",
              "acceptedAnswer": { "@type": "Answer", "text": "uTerms is an all-in-one privacy compliance platform that automates cookie consent banners, generates GDPR and CCPA-compliant legal policies, and logs visitor consent decisions." }
            },
            {
              "@type": "Question",
              "name": "Is uTerms GDPR compliant?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. uTerms scans your site for cookies, categorises them, and provides a consent banner that collects and logs visitor consent in accordance with GDPR and CCPA requirements." }
            },
            {
              "@type": "Question",
              "name": "Does uTerms support Google Consent Mode v2?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. uTerms fully supports Google Consent Mode v2 (GCM v2), automatically setting consent signals for ad_storage, analytics_storage, ad_user_data, and ad_personalization based on visitor choices." }
            },
            {
              "@type": "Question",
              "name": "What types of legal policies can uTerms generate?",
              "acceptedAnswer": { "@type": "Answer", "text": "uTerms can generate Privacy Policies, Cookie Policies, Terms of Service, EULAs, Disclaimers, Return Policies, Shipping Policies, Acceptable Use Policies, Impressums, and Accessibility Statements." }
            },
            {
              "@type": "Question",
              "name": "Is uTerms free to use?",
              "acceptedAnswer": { "@type": "Answer", "text": "uTerms offers a free plan. Sign up at uterms.io to get started with cookie scanning and policy generation at no cost." }
            }
          ]
        })}</script>
      </Helmet>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-gradient"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge-pill mb-6 inline-flex">
              <span className="badge-dot"></span>
              AI-Powered Consent Classification
            </div>
            <br></br>
            <h1 className="hero-title">
              Data Privacy Built for the{" "}
              <span className="text-gradient">Enterprise</span>
            </h1>
            <p className="hero-subtitle">
              Automate compliance, manage consent globally, and build trust with
              your users. The all-in-one privacy platform that scales with your
              business.
            </p>
            <div className="hero-actions">
              <Link to={userId ? "/dashboard" : "/register"}>
                <Button size="lg" className="hero-btn">
                  {userId ? "Go to Dashboard" : "Sign Up"} <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="secondary" size="lg" className="hero-btn">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-panel dashboard-preview">
              <div className="preview-header">
                <div className="window-controls">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">Compliance Overview</div>
              </div>
              <div className="preview-body">
                <div className="metric-row">
                  <div className="metric-card">
                    <span className="metric-label">Consent Rate</span>
                    <span className="metric-value text-success">92.4%</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Active Policies</span>
                    <span className="metric-value text-primary">14</span>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bar" style={{ height: "60%" }}></div>
                  <div className="chart-bar" style={{ height: "80%" }}></div>
                  <div className="chart-bar" style={{ height: "40%" }}></div>
                  <div className="chart-bar" style={{ height: "90%" }}></div>
                  <div
                    className="chart-bar"
                    style={{
                      height: "100%",
                      backgroundColor: "var(--color-primary)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Everything you need for complete compliance
            </h2>
            <p className="section-subtitle">
              From cookie consent to data subject requests, we provide the tools
              to navigate complex privacy laws like GDPR, CCPA, and CPRA.
            </p>
            <br></br>
          </div>

          <div className="features-grid">
            <Card className="feature-card">
              <CardContent className="flex flex-col gap-4 h-full pt-6">
                <div className="feature-icon-wrapper bg-primary-light text-primary">
                  <Globe size={28} />
                </div>
                <h3 className="text-xl font-bold">Global Consent Management</h3>
                <p className="text-muted flex-grow">
                  Automatically detect visitors' locations and serve the legally
                  required consent banner and languages.
                </p>
                <div className="feature-link group">
                  Learn more{" "}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardContent className="flex flex-col gap-4 h-full pt-6">
                <div
                  className="feature-icon-wrapper bg-success/10 text-success"
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                  }}
                >
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-bold">Policy Documentation</h3>
                <p className="text-muted flex-grow">
                  Generate, host, and automatically update your privacy
                  policies, terms of service, and cookie notices.
                </p>
                <div className="feature-link group">
                  Learn more{" "}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardContent className="flex flex-col gap-4 h-full pt-6">
                <div
                  className="feature-icon-wrapper bg-warning/10 text-warning"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    color: "#f59e0b",
                  }}
                >
                  <Activity size={28} />
                </div>
                <h3 className="text-xl font-bold">Privacy Monitoring</h3>
                <p className="text-muted flex-grow">
                  Continuously scan your website for unclassified cookies and
                  third-party trackers with real-time alerting.
                </p>
                <div className="feature-link group">
                  Learn more{" "}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box glass-panel">
            <div className="cta-content">
              <h2>Ready to simplify your privacy operations?</h2>
              <p>
                Join thousands of companies that trust uTerms to protect their
                business and their users.
              </p>
              <ul className="cta-benefits">
                <li>
                  <CheckCircle2 size={20} className="text-success" /> Setup in
                  minutes, not months
                </li>
                <li>
                  <CheckCircle2 size={20} className="text-success" /> Guaranteed
                  SLA uptime
                </li>
                <li>
                  <CheckCircle2 size={20} className="text-success" /> 24/7
                  dedicated support
                </li>
              </ul>
              <div className="mt-8 flex gap-4">
                <Link to={userId ? "/dashboard" : "/register"}>
                  <Button size="lg">{userId ? "Go to Dashboard" : "Get Started Now"}</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <Lock size={120} className="text-primary opacity-20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
