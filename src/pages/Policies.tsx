import {
  Accessibility,
  AlertCircle,
  Building2,
  Cookie,
  FileText,
  Lock,
  RotateCcw,
  Scale,
  Shield,
  Truck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import "./Policies.css";

type TabType =
  | "privacy"
  | "terms"
  | "cookies"
  | "eula"
  | "return"
  | "disclaimer"
  | "shipping"
  | "aup"
  | "impressum"
  | "accessibility";

const ALL_TABS: TabType[] = [
  "privacy",
  "terms",
  "cookies",
  "eula",
  "return",
  "disclaimer",
  "shipping",
  "aup",
  "impressum",
  "accessibility",
];

export const Policies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("privacy");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as TabType;
    if (tab && ALL_TABS.includes(tab)) setActiveTab(tab);
  }, [location]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "privacy", label: "Privacy Policy", icon: <Shield size={16} /> },
    { id: "terms", label: "Terms of Service", icon: <FileText size={16} /> },
    { id: "cookies", label: "Cookie Policy", icon: <Cookie size={16} /> },
    { id: "eula", label: "EULA", icon: <Lock size={16} /> },
    { id: "return", label: "Return Policy", icon: <RotateCcw size={16} /> },
    { id: "disclaimer", label: "Disclaimer", icon: <AlertCircle size={16} /> },
    { id: "shipping", label: "Shipping Policy", icon: <Truck size={16} /> },
    { id: "aup", label: "Acceptable Use Policy", icon: <Scale size={16} /> },
    { id: "impressum", label: "Impressum", icon: <Building2 size={16} /> },
    {
      id: "accessibility",
      label: "Accessibility Statement",
      icon: <Accessibility size={16} />,
    },
  ];

  return (
    <div className="policies-container container">
      <Helmet>
        <title>Legal & Policy Centre | uTerms</title>
        <meta name="description" content="Review uTerms' Privacy Policy, Terms of Service, Cookie Policy, EULA, and more. Full transparency on how we operate." />
        <link rel="canonical" href="https://uterms.io/policies" />
      </Helmet>
      <div className="policies-header">
        <h1 className="text-3xl font-bold mb-4">Legal &amp; Policy Centre</h1>
        <p className="text-muted text-lg max-w-2xl">
          Full transparency on how we operate. Review every policy that governs
          the uTerms platform and the services we provide.
        </p>
      </div>

      <div className="policies-layout">
        {/* Sidebar Nav */}
        <aside className="policies-sidebar">
          <nav className="policies-nav">
            {tabs.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`policy-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                {icon} {label}
              </button>
            ))}
          </nav>

          <div className="policies-meta">
            <h4 className="font-semibold text-sm mb-2">Need Help?</h4>
            <p className="text-xs text-muted mb-3">
              Questions about our policies? Contact our Data Protection Officer.
            </p>
            <a
              href="mailto:privacy@uterms.io"
              className="text-sm font-medium text-primary hover:underline"
            >
              privacy@uterms.io
            </a>
          </div>
        </aside>

        {/* Content Area */}
        <main className="policies-content-area">
          {/* ── Privacy Policy ── */}
          {activeTab === "privacy" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Privacy Policy</h2>
                <p className="doc-description">
                  How we collect, use, and protect your personal data when you
                  use uTerms.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>1. Introduction</h3>
                <p>
                  Welcome to uTerms. We respect your privacy and are committed
                  to protecting your personal data. This privacy notice informs
                  you how we look after your personal data when you visit our
                  website and tells you about your privacy rights and how the
                  law protects you.
                </p>

                <h3>2. Data We Collect</h3>
                <p>
                  We may collect, use, store and transfer different kinds of
                  personal data about you:
                </p>
                <ul>
                  <li>
                    <strong>Identity Data</strong> — first name, last name,
                    username or similar identifier.
                  </li>
                  <li>
                    <strong>Contact Data</strong> — email address and telephone
                    numbers.
                  </li>
                  <li>
                    <strong>Technical Data</strong> — IP address, login data,
                    browser type and version.
                  </li>
                  <li>
                    <strong>Usage Data</strong> — information about how you use
                    our website, products and services.
                  </li>
                </ul>

                <h3>3. How We Use Your Data</h3>
                <p>
                  We use your personal data only when the law allows us to — to
                  perform our contract with you, pursue our legitimate
                  interests, or comply with a legal obligation.
                </p>

                <h3>4. Data Processors</h3>
                <p>
                  We use the following third-party data processors to operate the uTerms platform:
                </p>
                <ul>
                  <li>
                    <strong>Supabase Inc.</strong> — provides our database and authentication infrastructure.
                    Supabase stores your account email address, hashed password, and all policy and consent data on your behalf.
                    Supabase is SOC 2 Type II certified. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>.
                  </li>
                  <li>
                    <strong>Cloudflare Inc.</strong> — provides hosting, CDN, and DDoS protection for the uTerms web application.
                  </li>
                </ul>

                <h3>5. Data Security</h3>
                <p>
                  We have appropriate security measures in place to prevent your
                  personal data from being accidentally lost, used, accessed in
                  an unauthorised way, altered or disclosed. Access is limited
                  to those with a business need to know.
                </p>

                <h3>6. Your Rights</h3>
                <p>
                  Under GDPR and applicable data protection laws, you have the
                  right to access, correct, erase, restrict, port, and object to
                  the processing of your personal data. Contact us at{" "}
                  <a href="mailto:privacy@uterms.io">privacy@uterms.io</a> to
                  exercise these rights.
                </p>
              </div>
            </div>
          )}

          {/* ── Terms of Service ── */}
          {activeTab === "terms" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Terms of Service</h2>
                <p className="doc-description">
                  The rules and conditions that govern your use of the uTerms
                  platform.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: January 15, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>1. Agreement to Terms</h3>
                <p>
                  By accessing or using our Services, you agree to be bound by
                  these Terms. If you do not agree, you may not access or use
                  the Services.
                </p>

                <h3>2. Account Responsibilities</h3>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account credentials and for all activities that occur
                  under your account. You must notify us immediately of any
                  unauthorised use.
                </p>

                <h3>3. Enterprise Subscriptions</h3>
                <p>
                  If you use the Services on behalf of a company or
                  organisation, "you" includes that entity. You represent that
                  you are authorised to grant all permissions and licences
                  provided in these Terms.
                </p>

                <h3>4. Prohibited Uses</h3>
                <p>
                  You may not use the Services to violate any laws, infringe on
                  intellectual property rights, distribute malicious software,
                  or engage in any activity that disrupts or interferes with the
                  integrity of the platform.
                </p>

                <h3>5. Limitation of Liability</h3>
                <p>
                  To the fullest extent permitted by law, uTerms shall not be
                  liable for any indirect, incidental, special, consequential,
                  or punitive damages arising from your use of the Services.
                </p>

                <h3>6. Governing Law</h3>
                <p>
                  These Terms are governed by and construed in accordance with
                  applicable law. Any disputes shall be resolved through binding
                  arbitration or in the courts of competent jurisdiction.
                </p>
              </div>
            </div>
          )}

          {/* ── Cookie Policy ── */}
          {activeTab === "cookies" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Cookie Policy</h2>
                <p className="doc-description">
                  What cookies we use on the uTerms website and how you can
                  manage them.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: February 20, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>What are cookies?</h3>
                <p>
                  Cookies are small text files placed on your computer or mobile
                  device when you visit a website. They are widely used to make
                  websites work efficiently and to provide information to site
                  owners.
                </p>

                <h3>How we use cookies</h3>
                <ul>
                  <li>
                    <strong>Essential cookies:</strong> Required for the
                    operation of our website, including secure login sessions.
                  </li>
                  <li>
                    <strong>Analytical cookies:</strong> Allow us to count
                    visitors and see how users move around our site.
                  </li>
                  <li>
                    <strong>Functional cookies:</strong> Used to recognise you
                    when you return to our website.
                  </li>
                  <li>
                    <strong>Targeting cookies:</strong> Record your visit, the
                    pages viewed, and links followed.
                  </li>
                </ul>

                <h3>Managing your preferences</h3>
                <p>
                  You can manage your cookie preferences at any time via the
                  Cookie Preferences panel in the footer of our website. You can
                  also configure your browser to reject all or some cookies.
                </p>
              </div>
            </div>
          )}

          {/* ── EULA ── */}
          {activeTab === "eula" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>End User License Agreement</h2>
                <p className="doc-description">
                  The licence that governs your right to access and use the
                  uTerms software and platform.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>1. Grant of Licence</h3>
                <p>
                  Subject to these terms, uTerms grants you a limited,
                  non-exclusive, non-transferable, revocable licence to access
                  and use the platform solely for your internal business
                  purposes.
                </p>

                <h3>2. Restrictions</h3>
                <p>
                  You may not sublicence, sell, resell, transfer, assign, or
                  otherwise commercially exploit or make available the platform
                  to any third party. You may not reverse engineer, decompile,
                  or disassemble any portion of the software.
                </p>

                <h3>3. Intellectual Property</h3>
                <p>
                  The platform and all related intellectual property rights
                  remain the exclusive property of uTerms. This agreement does
                  not grant you any rights to our trademarks, service marks, or
                  trade names.
                </p>

                <h3>4. Updates and Modifications</h3>
                <p>
                  uTerms may update or modify the platform at any time.
                  Continued use of the platform after changes constitutes
                  acceptance of the updated terms.
                </p>

                <h3>5. Termination</h3>
                <p>
                  This licence is effective until terminated. It terminates
                  automatically if you breach any of its terms. Upon
                  termination, you must cease all use of the platform and
                  destroy any downloaded materials.
                </p>

                <div className="policy-cta">
                  <p>Need to generate an EULA for your own software product?</p>
                  <Link to="/register" className="policy-cta-link">
                    Create your EULA with uTerms →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Return Policy ── */}
          {activeTab === "return" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Return &amp; Refund Policy</h2>
                <p className="doc-description">
                  Understand the conditions under which subscriptions and
                  purchases may be refunded.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>1. Subscription Refunds</h3>
                <p>
                  uTerms offers a 14-day money-back guarantee on all new paid
                  subscriptions. If you are not satisfied within the first 14
                  days, contact our support team for a full refund — no
                  questions asked.
                </p>

                <h3>2. Eligibility</h3>
                <p>
                  Refund requests must be submitted within 14 days of the
                  initial purchase date. Refunds are not available for plan
                  renewals, add-ons purchased after the initial subscription, or
                  accounts that have been suspended for policy violations.
                </p>

                <h3>3. Processing Time</h3>
                <p>
                  Approved refunds are processed within 5–10 business days and
                  returned to the original payment method.
                </p>

                <h3>4. Cancellations</h3>
                <p>
                  You may cancel your subscription at any time from your account
                  settings. Your access continues until the end of the current
                  billing period. No partial refunds are issued for unused
                  portions of a billing period after the 14-day window.
                </p>

                <div className="policy-cta">
                  <p>
                    Selling products online? Generate a Return Policy for your
                    store.
                  </p>
                  <Link to="/register" className="policy-cta-link">
                    Create your Return Policy with uTerms →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Disclaimer ── */}
          {activeTab === "disclaimer" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Disclaimer</h2>
                <p className="doc-description">
                  Important limitations on the legal advice and accuracy of
                  information provided by uTerms.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>1. Not Legal Advice</h3>
                <p>
                  The policies, templates, and content generated by uTerms are
                  provided for informational purposes only and do not constitute
                  legal advice. You should consult a qualified legal
                  professional before relying on any generated content for legal
                  purposes.
                </p>

                <h3>2. No Warranty</h3>
                <p>
                  uTerms makes no representations or warranties of any kind,
                  express or implied, about the completeness, accuracy,
                  reliability, suitability, or availability of the platform or
                  any information, products, services, or related graphics for
                  any purpose.
                </p>

                <h3>3. Limitation of Liability</h3>
                <p>
                  In no event shall uTerms be liable for any loss or damage
                  including without limitation indirect or consequential loss or
                  damage, or any loss or damage whatsoever arising from loss of
                  data or profits arising out of, or in connection with, the use
                  of this platform.
                </p>

                <h3>4. External Links</h3>
                <p>
                  The platform may include links to other websites. These links
                  are provided for your convenience. uTerms has no
                  responsibility for the content of linked websites and
                  inclusion does not imply endorsement.
                </p>

                <div className="policy-cta">
                  <p>Need a Disclaimer for your own website or app?</p>
                  <Link to="/register" className="policy-cta-link">
                    Create your Disclaimer with uTerms →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Shipping Policy ── */}
          {activeTab === "shipping" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Shipping Policy</h2>
                <p className="doc-description">
                  uTerms is a digital platform — no physical goods are shipped.
                  Learn about digital delivery and service availability.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>1. Digital Delivery</h3>
                <p>
                  uTerms is a software-as-a-service (SaaS) platform. All
                  products, features, and generated documents are delivered
                  digitally through our web application. There are no physical
                  goods, and no shipping or delivery fees apply.
                </p>

                <h3>2. Immediate Access</h3>
                <p>
                  Upon successful subscription or account creation, access to
                  the platform is granted immediately. Generated policy
                  documents are available for download and embed at any time
                  from your dashboard.
                </p>

                <h3>3. Service Availability</h3>
                <p>
                  uTerms targets 99.9% uptime. In the event of planned
                  maintenance, we provide advance notice. Service disruptions
                  beyond our control do not entitle users to refunds beyond what
                  is provided in our Return Policy.
                </p>

                <div className="policy-cta">
                  <p>
                    Run an e-commerce store that ships physical goods? Generate
                    a Shipping Policy.
                  </p>
                  <Link to="/register" className="policy-cta-link">
                    Create your Shipping Policy with uTerms →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Acceptable Use Policy ── */}
          {activeTab === "aup" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Acceptable Use Policy</h2>
                <p className="doc-description">
                  The rules governing what you may and may not do when using the
                  uTerms platform.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>1. Permitted Uses</h3>
                <p>
                  You may use uTerms to generate, manage, and publish legal
                  policy documents for your own websites, apps, and digital
                  products, and to configure a cookie consent banner for your
                  own domains.
                </p>

                <h3>2. Prohibited Activities</h3>
                <ul>
                  <li>
                    Using the platform to generate fraudulent, misleading, or
                    deceptive documents.
                  </li>
                  <li>
                    Attempting to gain unauthorised access to any part of the
                    platform or its infrastructure.
                  </li>
                  <li>
                    Reselling or redistributing generated content as a competing
                    service without express written permission.
                  </li>
                  <li>
                    Uploading or transmitting malicious code, spam, or any
                    content that violates applicable laws.
                  </li>
                  <li>
                    Abusing the AI generation feature through automated scraping
                    or bulk generation for resale.
                  </li>
                </ul>

                <h3>3. Enforcement</h3>
                <p>
                  uTerms reserves the right to suspend or terminate accounts
                  that violate this policy at any time, without notice.
                  Violations may also be reported to relevant authorities where
                  applicable.
                </p>

                <h3>4. Reporting Violations</h3>
                <p>
                  To report a suspected violation, contact us at{" "}
                  <a href="mailto:privacy@uterms.io">privacy@uterms.io</a>.
                </p>

                <div className="policy-cta">
                  <p>
                    Need an Acceptable Use Policy for your own SaaS or online
                    platform?
                  </p>
                  <Link to="/register" className="policy-cta-link">
                    Create your AUP with uTerms →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Impressum ── */}
          {activeTab === "impressum" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Impressum</h2>
                <p className="doc-description">
                  Legal disclosure required under German and EU law (§ 5 TMG / §
                  55 RStV).
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>Service Provider</h3>
                <p>
                  uTerms Inc.
                  <br />
                  Registered business address available upon request.
                  <br />
                  Email:{" "}
                  <a href="mailto:privacy@uterms.io">privacy@uterms.io</a>
                </p>

                <h3>Responsible for Content</h3>
                <p>
                  The uTerms editorial and product team is responsible for
                  content published on this platform pursuant to § 55 Abs. 2
                  RStV.
                </p>

                <h3>Dispute Resolution</h3>
                <p>
                  The European Commission provides a platform for online dispute
                  resolution (OS):{" "}
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                  . We are not obligated to participate in dispute resolution
                  proceedings before a consumer arbitration board.
                </p>

                <h3>Liability for Content</h3>
                <p>
                  As a service provider, we are responsible for our own content
                  on these pages in accordance with § 7 Abs. 1 TMG under general
                  law. According to §§ 8 to 10 TMG, however, we are not
                  obligated to monitor transmitted or stored external
                  information or to investigate circumstances that indicate
                  illegal activity.
                </p>

                <div className="policy-cta">
                  <p>
                    Operating a website in Germany or the EU? Generate your
                    Impressum.
                  </p>
                  <Link to="/register" className="policy-cta-link">
                    Create your Impressum with uTerms →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Accessibility Statement ── */}
          {activeTab === "accessibility" && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Accessibility Statement</h2>
                <p className="doc-description">
                  Our commitment to making uTerms accessible to all users,
                  regardless of ability.
                </p>
                <div className="text-sm text-muted">
                  Last Updated: March 1, 2026
                </div>
              </div>
              <div className="doc-body prose">
                <h3>Our Commitment</h3>
                <p>
                  uTerms is committed to ensuring digital accessibility for
                  people with disabilities. We continually improve the user
                  experience for everyone and apply relevant accessibility
                  standards.
                </p>

                <h3>Conformance Status</h3>
                <p>
                  We aim to conform to the Web Content Accessibility Guidelines
                  (WCAG) 2.1 Level AA. These guidelines explain how to make web
                  content more accessible to people with disabilities.
                </p>

                <h3>Measures Taken</h3>
                <ul>
                  <li>Semantic HTML structure throughout the application.</li>
                  <li>
                    Sufficient colour contrast ratios across all UI components.
                  </li>
                  <li>
                    Keyboard navigation support for all interactive elements.
                  </li>
                  <li>
                    ARIA labels on icons and interactive controls without
                    visible text.
                  </li>
                  <li>Focus indicators on all focusable elements.</li>
                </ul>

                <h3>Known Limitations</h3>
                <p>
                  Some older content and third-party embedded components may not
                  fully meet WCAG 2.1 AA. We are actively working to address
                  these gaps.
                </p>

                <h3>Feedback</h3>
                <p>
                  We welcome your feedback on the accessibility of uTerms. If
                  you experience barriers, please contact us at{" "}
                  <a href="mailto:privacy@uterms.io">privacy@uterms.io</a> and
                  we will respond within 2 business days.
                </p>

                <div className="policy-cta">
                  <p>
                    Need an Accessibility Statement for your own website or app?
                  </p>
                  <Link to="/register" className="policy-cta-link">
                    Create your Accessibility Statement with uTerms →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
