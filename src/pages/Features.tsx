import { Accessibility, AlertCircle, Building2, Cookie, FileSignature, FileText, RefreshCcw, ShieldCheck, Truck, UserCheck } from 'lucide-react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Features.css';

const generators = [
  {
    title: "Privacy Policy Generator",
    description: "Generate a comprehensive, legally compliant Privacy Policy tailored to your specific data collection practices and third-party integrations.",
    icon: <ShieldCheck size={32} className="text-primary" />
  },
  {
    title: "Terms & Conditions Generator",
    description: "Create custom Terms of Service to protect your business, outline user responsibilities, and establish governing law.",
    icon: <FileText size={32} className="text-primary" />
  },
  {
    title: "Cookie Policy Generator",
    description: "Automatically scan your site and generate a detailed Cookie Policy explaining the trackers you use and how users can manage them.",
    icon: <Cookie size={32} className="text-primary" />
  },
  {
    title: "EULA Generator",
    description: "Draft a robust End-user License Agreement to govern software licensing, usage rights, and liability limitations for your apps.",
    icon: <FileSignature size={32} className="text-primary" />
  },
  {
    title: "Disclaimer Generator",
    description: "Protect your business from legal claims with auto-generated medical, legal, affiliate, or general liability disclaimers.",
    icon: <AlertCircle size={32} className="text-primary" />
  },
  {
    title: "Shipping Policy Generator",
    description: "Clearly communicate your shipping methods, delivery times, costs, and international shipping rules to your e-commerce customers.",
    icon: <Truck size={32} className="text-primary" />
  },
  {
    title: "Return Policy Generator",
    description: "Create a transparent and legally sound Return and Refund Policy to build trust and reduce customer disputes.",
    icon: <RefreshCcw size={32} className="text-primary" />
  },
  {
    title: "Acceptable Use Generator",
    description: "Define exactly what users can and cannot do on your platform to prevent abuse, spam, and illicit activities.",
    icon: <UserCheck size={32} className="text-primary" />
  },
  {
    title: "Impressum Generator",
    description: "Generate a legally required Impressum (legal disclosure) for your business, essential for operating in German-speaking regions.",
    icon: <Building2 size={32} className="text-primary" />
  },
  {
    title: "Accessibility Statement",
    description: "Demonstrate your commitment to digital inclusion with a statement outlining your compliance with WCAG and ADA standards.",
    icon: <Accessibility size={32} className="text-primary" />
  }
];

export const Features: React.FC = () => {
  return (
    <div className="features-page">
      <Helmet>
        <title>Features — Cookie Scanning, Policy Generator & GCM v2 | uTerms</title>
        <meta name="description" content="Explore uTerms features: AI cookie scanning, GDPR/CCPA policy generator, consent banner builder, Google Consent Mode v2, and visitor consent logs." />
        <link rel="canonical" href="https://uterms.io/features" />
        <meta property="og:title" content="Features — Cookie Scanning, Policy Generator & GCM v2 | uTerms" />
        <meta property="og:description" content="Explore uTerms features: AI cookie scanning, GDPR/CCPA policy generator, consent banner builder, Google Consent Mode v2, and visitor consent logs." />
        <meta property="og:url" content="https://uterms.io/features" />
        <meta property="og:image" content="https://uterms.io/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Features — Cookie Scanning, Policy Generator & GCM v2 | uTerms" />
        <meta name="twitter:description" content="Explore uTerms features: AI cookie scanning, GDPR/CCPA policy generator, consent banner builder, Google Consent Mode v2, and visitor consent logs." />
        <meta name="twitter:image" content="https://uterms.io/og-image.png" />
      </Helmet>
      {/* Hero Section */}
      <section className="features-hero">
        <div className="features-hero-bg-gradient" />
        <div className="container">
          <div className="features-hero-content">
            <h1 className="features-title">
              AI-Generated <span className="text-gradient">Policy Suite</span>
            </h1>
            <p className="features-subtitle">
             Let our state-of-the-art AI automatically generate, orchestrate, and update your entire legal compliance suite in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Generators Grid */}
      <section className="generators-section">
        <div className="container">
          <div className="generators-grid">
            {generators.map((gen, idx) => (
              <div key={idx} className="generator-card glass-panel">
                <div className="generator-icon">
                  {gen.icon}
                </div>
                <h3 className="generator-title">{gen.title}</h3>
                <p className="generator-description">{gen.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
