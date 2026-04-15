import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalPage.css";

export const UTermsPrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Privacy Policy — uTerms</title>
        <meta
          name="description"
          content="uTerms Privacy Policy — how we collect, use, and protect your personal data in accordance with GDPR and CCPA."
        />
        <link rel="canonical" href="https://uterms.io/privacy-policy" />
      </Helmet>

      <div className="legal-hero">
        <div className="container">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">
            Effective date: April 15, 2025 &nbsp;·&nbsp; Last updated: April 15,
            2025
          </p>
        </div>
      </div>

      <div className="container legal-body">
        <section>
          <h2>1. Who We Are</h2>
          <p>
            uTerms ("<strong>uTerms</strong>", "<strong>we</strong>", "
            <strong>us</strong>", or "<strong>our</strong>") operates the
            website <strong>uterms.io</strong> and the associated consent
            management platform (the "Service"). We are committed to protecting
            your personal data and respecting your privacy rights under
            applicable law, including the EU General Data Protection Regulation
            (GDPR) and the California Consumer Privacy Act (CCPA) as amended by
            the California Privacy Rights Act (CPRA).
          </p>
          <p>
            For GDPR purposes, uTerms Inc. acts as the{" "}
            <strong>data controller</strong> for personal data collected through
            the Service. For questions about this Policy or our data practices,
            contact us at{" "}
            <a href="mailto:privacy@uterms.io">privacy@uterms.io</a>.
          </p>
        </section>

        <section>
          <h2>2. Personal Data We Collect</h2>

          <h3>2.1 Data You Provide Directly</h3>
          <ul>
            <li>
              <strong>Account information:</strong> name, email address,
              password (hashed) when you register.
            </li>
            <li>
              <strong>Profile &amp; billing information:</strong> company name,
              billing address, payment card details (processed by our payment
              processor; we do not store raw card numbers).
            </li>
            <li>
              <strong>Support communications:</strong> messages you send to our
              support team.
            </li>
          </ul>

          <h3>2.2 Data Collected Automatically</h3>
          <ul>
            <li>
              <strong>Usage data:</strong> pages visited, features used, clicks,
              session duration, and in-app events.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type and
              version, operating system, device identifiers, referring URL, time
              zone.
            </li>
            <li>
              <strong>Cookies &amp; similar technologies:</strong> see Section 6
              below.
            </li>
          </ul>

          <h3>2.3 Data From Third Parties</h3>
          <ul>
            <li>
              <strong>OAuth providers:</strong> if you sign in via Google, we
              receive your name, email, and profile photo from Google.
            </li>
            <li>
              <strong>Analytics providers:</strong> aggregated, pseudonymous
              usage signals.
            </li>
          </ul>

          <h3>2.4 Visitor Consent Data (on Behalf of Our Customers)</h3>
          <p>
            When end-users of our customers interact with a uTerms-powered
            consent banner, we collect consent records (category choices,
            timestamp, URL, anonymised IP, user agent) on behalf of the
            customer. In this context we act as a{" "}
            <strong>data processor</strong> under the customer's instructions.
            Please refer to the customer's own privacy policy for details on how
            they process your data.
          </p>
        </section>

        <section>
          <h2>3. Legal Bases for Processing (GDPR)</h2>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Providing and operating the Service</td>
                <td>Performance of a contract (Art. 6(1)(b))</td>
              </tr>
              <tr>
                <td>Sending transactional emails (account, billing)</td>
                <td>Performance of a contract (Art. 6(1)(b))</td>
              </tr>
              <tr>
                <td>Fraud prevention, security, and legal compliance</td>
                <td>
                  Legitimate interests (Art. 6(1)(f)) / Legal obligation (Art.
                  6(1)(c))
                </td>
              </tr>
              <tr>
                <td>Product analytics and improving the Service</td>
                <td>Legitimate interests (Art. 6(1)(f))</td>
              </tr>
              <tr>
                <td>Marketing communications</td>
                <td>Consent (Art. 6(1)(a)) — you may withdraw at any time</td>
              </tr>
              <tr>
                <td>Processing consent records for customers</td>
                <td>
                  Performance of a contract with the customer / Legal obligation
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>4. How We Use Your Personal Data</h2>
          <ul>
            <li>To create and manage your account and provide the Service.</li>
            <li>To process payments and send billing receipts.</li>
            <li>
              To send service-related notifications (password resets, security
              alerts, product updates).
            </li>
            <li>To respond to support requests and inquiries.</li>
            <li>To analyse usage patterns and improve the platform.</li>
            <li>
              To detect and prevent fraud, abuse, or violations of our Terms of
              Service.
            </li>
            <li>
              To comply with applicable legal obligations and enforce our
              agreements.
            </li>
            <li>
              To send marketing communications where you have opted in (you may
              opt out at any time).
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Sharing and Disclosure of Personal Data</h2>
          <p>
            We do <strong>not sell</strong> your personal data. We share
            personal data only in the following circumstances:
          </p>
          <ul>
            <li>
              <strong>Service providers:</strong> Supabase (database &amp;
              auth), Stripe (payments), email delivery providers, and analytics
              providers — all bound by data processing agreements.
            </li>
            <li>
              <strong>Business transfers:</strong> in connection with a merger,
              acquisition, or sale of assets, with notice to you.
            </li>
            <li>
              <strong>Legal requirements:</strong> when required by law, court
              order, or to protect the rights, property, or safety of uTerms,
              our users, or the public.
            </li>
            <li>
              <strong>With your consent:</strong> for any other purpose with
              your explicit consent.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies and Tracking Technologies</h2>
          <p>We use the following categories of cookies:</p>
          <ul>
            <li>
              <strong>Strictly necessary:</strong> authentication tokens and
              session management. Cannot be disabled.
            </li>
            <li>
              <strong>Functional:</strong> remember your preferences (e.g. UI
              settings).
            </li>
            <li>
              <strong>Analytics:</strong> pseudonymous usage analytics to
              understand how the platform is used. You may opt out via our
              cookie banner.
            </li>
          </ul>
          <p>
            You can manage cookie preferences at any time through our cookie
            consent banner or your browser settings. Note that disabling certain
            cookies may impair Service functionality.
          </p>
        </section>

        <section>
          <h2>7. International Data Transfers</h2>
          <p>
            uTerms processes data on servers located in the United States. If
            you are located in the European Economic Area (EEA), United Kingdom,
            or Switzerland, your data is transferred to the US under appropriate
            safeguards, including the EU Standard Contractual Clauses (SCCs) or
            equivalent mechanisms. You may request a copy of these safeguards by
            contacting <a href="mailto:privacy@uterms.io">privacy@uterms.io</a>.
          </p>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active
            or as needed to provide the Service. After account deletion, we
            retain data for up to <strong>90 days</strong> for backup and
            legal-hold purposes, then delete it. Consent records (processed on
            behalf of customers) are retained per the customer's configuration
            and applicable regulatory requirements (typically a minimum of 3
            years under GDPR).
          </p>
        </section>

        <section>
          <h2>9. Your Rights</h2>

          <h3>9.1 Rights Under GDPR (EEA / UK Users)</h3>
          <ul>
            <li>
              <strong>Right of access</strong> — request a copy of the personal
              data we hold about you.
            </li>
            <li>
              <strong>Right to rectification</strong> — request correction of
              inaccurate data.
            </li>
            <li>
              <strong>Right to erasure</strong> — request deletion of your data
              ("right to be forgotten").
            </li>
            <li>
              <strong>Right to restrict processing</strong> — ask us to pause
              processing in certain circumstances.
            </li>
            <li>
              <strong>Right to data portability</strong> — receive your data in
              a structured, machine-readable format.
            </li>
            <li>
              <strong>Right to object</strong> — object to processing based on
              legitimate interests or for direct marketing.
            </li>
            <li>
              <strong>Right to withdraw consent</strong> — where processing is
              based on consent, withdraw it at any time without affecting prior
              processing.
            </li>
            <li>
              <strong>Right to lodge a complaint</strong> — with your national
              supervisory authority (e.g. ICO in the UK, CNIL in France).
            </li>
          </ul>

          <h3>9.2 Rights Under CCPA / CPRA (California Residents)</h3>
          <p>As a California resident you have the right to:</p>
          <ul>
            <li>
              <strong>Know</strong> what personal information we collect, use,
              disclose, or sell.
            </li>
            <li>
              <strong>Delete</strong> personal information we hold about you
              (subject to certain exceptions).
            </li>
            <li>
              <strong>Correct</strong> inaccurate personal information.
            </li>
            <li>
              <strong>Opt out of sale or sharing</strong> of personal
              information — we do not sell your data. You may also submit a
              request via our{" "}
              <a href="/do-not-sell">
                Do Not Sell or Share My Personal Information
              </a>{" "}
              page.
            </li>
            <li>
              <strong>Limit use of sensitive personal information</strong> to
              purposes authorised by the CPRA.
            </li>
            <li>
              <strong>Non-discrimination</strong> — we will not discriminate
              against you for exercising your privacy rights.
            </li>
          </ul>
          <p>
            California residents may designate an authorised agent to submit
            requests on their behalf. We will verify the agent's authority
            before fulfilling the request.
          </p>

          <h3>9.3 How to Exercise Your Rights</h3>
          <p>
            Submit requests to{" "}
            <a href="mailto:privacy@uterms.io">privacy@uterms.io</a> or through
            your account settings. We will respond within{" "}
            <strong>30 days</strong> (GDPR) or <strong>45 days</strong> (CCPA),
            with one possible extension of the same period if necessary.
          </p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>
            The Service is not directed to children under 16 years of age. We do
            not knowingly collect personal data from children. If you believe a
            child has provided us with personal data, contact us and we will
            delete it promptly.
          </p>
        </section>

        <section>
          <h2>11. Security</h2>
          <p>
            We implement appropriate technical and organisational measures to
            protect your personal data against unauthorised access, loss,
            destruction, or alteration, including encryption in transit (TLS)
            and at rest, access controls, and regular security reviews. However,
            no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Policy from time to time. We will notify you of
            material changes by email or by posting a prominent notice on the
            Service at least <strong>30 days</strong> before the change takes
            effect. The "Last updated" date at the top of this page reflects the
            most recent revision. Continued use of the Service after the
            effective date constitutes acceptance of the revised Policy.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>For any privacy-related questions, requests, or complaints:</p>
          <address>
            <strong>uTerms Inc.</strong>
            <br />
            Email: <a href="mailto:privacy@uterms.io">privacy@uterms.io</a>
            <br />
          </address>
          <p className="mt-4">
            If you are an EEA resident and we are unable to resolve your
            complaint, you have the right to lodge a complaint with your local
            data protection authority.
          </p>
        </section>
      </div>
    </div>
  );
};
