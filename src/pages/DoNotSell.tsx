import React from 'react';
import { Link } from 'react-router-dom';

export const DoNotSell: React.FC = () => (
  <div className="container" style={{ maxWidth: 720, padding: '3rem 1rem' }}>
    <h1 className="text-3xl font-bold mb-4">Do Not Sell or Share My Personal Information</h1>
    <p className="text-muted mb-6">
      Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA),
      California residents have the right to opt out of the sale or sharing of their personal information.
    </p>

    <h2 className="text-xl font-semibold mb-3">What information we collect</h2>
    <p className="text-muted mb-6">
      When you use uTerms, we collect your email address (via account registration) and technical data
      such as IP addresses and browser information (via Supabase Auth and our consent logging system).
      Visitor consent decisions logged by the platform include anonymised IP addresses and user-agent strings.
    </p>

    <h2 className="text-xl font-semibold mb-3">Do we sell your data?</h2>
    <p className="text-muted mb-6">
      uTerms does not sell your personal information to third parties for monetary consideration.
      We do not share your personal information with third parties for cross-context behavioural advertising.
    </p>

    <h2 className="text-xl font-semibold mb-3">How to opt out</h2>
    <p className="text-muted mb-4">
      If you are a California resident and wish to opt out of any future sale or sharing of your personal
      information, or to request deletion of your data, please:
    </p>
    <ul className="text-muted mb-6" style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
      <li>Email us at <a href="mailto:privacy@uterms.io" className="text-primary hover:underline">privacy@uterms.io</a></li>
      <li>Or <Link to="/settings" className="text-primary hover:underline">delete your account</Link> directly from your Settings page</li>
    </ul>

    <h2 className="text-xl font-semibold mb-3">Contact</h2>
    <p className="text-muted">
      For any privacy-related enquiries, contact our Data Protection Officer at{' '}
      <a href="mailto:privacy@uterms.io" className="text-primary hover:underline">privacy@uterms.io</a>.
      See our full <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for details.
    </p>
  </div>
);
