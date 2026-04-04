import { Bot, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import "./About.css";

export const About: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-bg-gradient" />
        <div className="container">
          <div className="about-hero-content">
            <h1 className="about-title">
              The First <span className="text-gradient">All-In-One</span> AI
              Managed Privacy System
            </h1>
            <p className="about-subtitle">
              We leverage advanced artificial intelligence to fully automate
              your privacy management, keeping you compliant without the manual
              overhead. Let AI handle your cookie banners, legal terms, and
              continuous compliance reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features-section">
        <div className="container">
          <div className="about-features-grid">
            <div className="about-feature-card glass-panel">
              <div className="about-feature-icon">
                <Bot size={32} className="text-primary" />
              </div>
              <h3>AI-Generated Cookie Banners</h3>
              <p>
                Our AI scans your website in real-time, instantly identifying
                active trackers and automatically generating a perfect,
                compliant cookie banner tailored to your specific tech stack.
              </p>
            </div>

            <div className="about-feature-card glass-panel">
              <div className="about-feature-icon">
                <FileText size={32} className="text-primary" />
              </div>
              <h3>Automated Terms Generation</h3>
              <p>
                Say goodbye to static legal templates. The AI drafts and
                customizes your privacy policies and terms of service
                dynamically based on your actual data collection practices.
              </p>
            </div>

            <div className="about-feature-card glass-panel">
              <div className="about-feature-icon">
                <RefreshCw size={32} className="text-primary" />
              </div>
              <h3>Continuous AI Review</h3>
              <p>
                Privacy laws change constantly. Our AI continuously monitors
                global regulations and automatically reviews your active terms,
                flagging needed updates the second a new mandate drops.
              </p>
            </div>

            <div className="about-feature-card glass-panel">
              <div className="about-feature-icon">
                <ShieldCheck size={32} className="text-primary" />
              </div>
              <h3>Auto-Updating Statements</h3>
              <p>
                When your site changes or laws update, your privacy statements
                evolve with them. Experience zero-touch compliance with
                intelligent, real-time automated updates to your live banners
                and statements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section container">
        <div className="about-cta-box glass-panel">
          <div className="about-cta-content">
            <h2>Experience Zero-Touch Compliance</h2>
            <p>Ready to let AI handle your privacy management automatically?</p>
            <Button size="lg" variant="primary" onClick={() => navigate("/register")}>
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
