import { Cookie, FileText, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Policies.css';

type TabType = 'privacy' | 'terms' | 'cookies';

export const Policies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('privacy');
  const location = useLocation();

  useEffect(() => {
    // Parse query params to set active tab
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') as TabType;
    if (tab && ['privacy', 'terms', 'cookies'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  return (
    <div className="policies-container container">
      <div className="policies-header">
        <h1 className="text-3xl font-bold mb-4">Legal & Privacy Center</h1>
        <p className="text-muted text-lg max-w-2xl">
          We believe in full transparency. Review our policies to understand how we protect your data and the terms that govern our services.
        </p>
      </div>

      <div className="policies-layout">
        {/* Sidebar Nav */}
        <aside className="policies-sidebar">
          <nav className="policies-nav">
            <button 
              className={`policy-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={18} /> Privacy Policy
            </button>
            <button 
              className={`policy-tab ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              <FileText size={18} /> Terms of Service
            </button>
            <button 
              className={`policy-tab ${activeTab === 'cookies' ? 'active' : ''}`}
              onClick={() => setActiveTab('cookies')}
            >
              <Cookie size={18} /> Cookie Policy
            </button>
          </nav>
          
          <div className="policies-meta mt-8 p-4 bg-primary-light rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-primary">Need Help?</h4>
            <p className="text-xs text-muted mb-3">If you have questions about our policies, please contact our Data Protection Officer.</p>
            <a href="mailto:privacy@uterm.com" className="text-sm font-medium text-primary hover:underline">privacy@uterm.com</a>
          </div>
        </aside>

        {/* Content Area */}
        <main className="policies-content-area">
          {activeTab === 'privacy' && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Privacy Policy</h2>
                <div className="text-sm text-muted">Last Updated: March 1, 2026</div>
              </div>
              <div className="doc-body prose">
                <h3>1. Introduction</h3>
                <p>Welcome to Uterm. We respect your privacy and are committed to protecting your personal data. This privacy notice will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                
                <h3>2. The data we collect about you</h3>
                <p>Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                <ul>
                  <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                  <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                  <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                  <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                </ul>

                <h3>3. How we use your personal data</h3>
                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul>
                  <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                  <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  <li>Where we need to comply with a legal obligation.</li>
                </ul>

                <h3>4. Data Security</h3>
                <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Terms of Service</h2>
                <div className="text-sm text-muted">Last Updated: January 15, 2026</div>
              </div>
              <div className="doc-body prose">
                <h3>1. Agreement to Terms</h3>
                <p>By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.</p>
                
                <h3>2. Enterprise Subscriptions</h3>
                <p>If you are using the Services on behalf of a company, organization, or other entity, then "you" includes you and that entity; and you represent and warrant that you are authorized to grant all permissions and licenses provided in these Terms.</p>
                
                <h3>3. Service Level Agreement Setup</h3>
                <p>For Enterprise customers, SLA commitments are governed by the specific Enterprise Agreement executed between Uterm and the customer. In the event of a conflict between these Terms and the Enterprise Agreement, the Enterprise Agreement will control.</p>
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="policy-document">
              <div className="doc-header">
                <h2>Cookie Policy</h2>
                <div className="text-sm text-muted">Last Updated: February 20, 2026</div>
              </div>
              <div className="doc-body prose">
                <h3>What are cookies?</h3>
                <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
                
                <h3>How we use cookies</h3>
                <p>We use cookies for the following purposes:</p>
                <ul>
                  <li><strong>Essential cookies:</strong> These are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website.</li>
                  <li><strong>Analytical/performance cookies:</strong> They allow us to recognise and count the number of visitors and to see how visitors move around our website when they are using it.</li>
                  <li><strong>Functionality cookies:</strong> These are used to recognise you when you return to our website.</li>
                  <li><strong>Targeting cookies:</strong> These cookies record your visit to our website, the pages you have visited and the links you have followed.</li>
                </ul>
                
                <h3>Managing your preferences</h3>
                <p>You can manage your cookie preferences at any time by accessing the Cookie Preferences panel via the link in the footer of our website. You can also configure your browser to reject all or some cookies.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
