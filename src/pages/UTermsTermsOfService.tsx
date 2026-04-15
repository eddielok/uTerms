import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalPage.css";

export const UTermsTermsOfService: React.FC = () => {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Terms of Service — uTerms</title>
        <meta name="description" content="uTerms Terms of Service — the rules and conditions that govern your use of the uTerms platform." />
        <link rel="canonical" href="https://uterms.io/terms-of-service-uterms" />
      </Helmet>

      <div className="legal-hero">
        <div className="container">
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Effective date: April 15, 2025 &nbsp;·&nbsp; Last updated: April 15, 2025</p>
        </div>
      </div>

      <div className="container legal-body">

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            These Terms of Service ("<strong>Terms</strong>") constitute a legally binding agreement between you
            ("<strong>you</strong>" or "<strong>Customer</strong>") and uTerms Inc. ("<strong>uTerms</strong>",
            "<strong>we</strong>", "<strong>us</strong>") governing your access to and use of the website{" "}
            <strong>uterms.io</strong> and all related services (collectively, the "<strong>Service</strong>").
          </p>
          <p>
            By creating an account, clicking "Sign Up", or otherwise accessing the Service, you confirm that you are
            at least <strong>18 years old</strong>, have the legal authority to enter into this agreement (or are
            acting on behalf of an organisation with appropriate authority), and agree to be bound by these Terms and
            our <a href="/privacy-policy">Privacy Policy</a>.
          </p>
          <p>
            If you do not agree to these Terms, do not access or use the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of the Service</h2>
          <p>
            uTerms provides a consent management and legal document automation platform that enables users to:
          </p>
          <ul>
            <li>Scan websites for cookies and trackers;</li>
            <li>Generate and host a customisable cookie consent banner;</li>
            <li>Generate AI-assisted legal documents (privacy policies, terms of service, cookie policies, etc.);</li>
            <li>Record and store visitor consent decisions;</li>
            <li>Monitor compliance through dashboards and logs.</li>
          </ul>
          <p>
            The Service is provided on a subscription basis. Features available to you depend on the plan you have
            purchased. We reserve the right to modify, suspend, or discontinue any feature with reasonable notice.
          </p>
        </section>

        <section>
          <h2>3. Accounts and Registration</h2>
          <p>
            You must register for an account to access most features of the Service. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information during registration;</li>
            <li>Maintain and promptly update your account information;</li>
            <li>Keep your password secure and confidential;</li>
            <li>Notify us immediately of any unauthorised access to your account at <a href="mailto:privacy@uterms.io">privacy@uterms.io</a>;</li>
            <li>Accept responsibility for all activity that occurs under your account.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that provide false information, violate these Terms,
            or have been inactive for an extended period with advance notice.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree <strong>not</strong> to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of applicable laws and regulations;</li>
            <li>Impersonate any person or entity or falsely state your affiliation;</li>
            <li>Attempt to gain unauthorised access to any part of the Service or its underlying infrastructure;</li>
            <li>Introduce viruses, malware, or other malicious code;</li>
            <li>Scrape, crawl, or systematically extract data from the Service without our written consent;</li>
            <li>Use the Service to transmit unsolicited commercial communications (spam);</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service;</li>
            <li>Resell or sublicence the Service without our express written authorisation;</li>
            <li>Use generated legal documents without independent legal review for high-stakes matters — AI-generated content does not constitute legal advice.</li>
          </ul>
        </section>

        <section>
          <h2>5. AI-Generated Content Disclaimer</h2>
          <p>
            The Service uses artificial intelligence to assist in generating legal documents and policy templates.
            You acknowledge that:
          </p>
          <ul>
            <li>AI-generated content is provided for informational and convenience purposes only and does <strong>not</strong> constitute legal advice;</li>
            <li>You are solely responsible for reviewing, customising, and ensuring the legal accuracy and suitability of any document generated through the Service for your specific circumstances;</li>
            <li>uTerms makes no warranty that generated documents are legally sufficient, complete, or compliant with the laws applicable to your jurisdiction or industry;</li>
            <li>You should consult a qualified attorney before relying on any generated document for legal purposes.</li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>

          <h3>6.1 uTerms Property</h3>
          <p>
            The Service, including its software, design, trademarks, logos, and content (excluding Customer Content),
            is owned by uTerms Inc. and protected by copyright, trademark, and other intellectual property laws. You
            receive a limited, non-exclusive, non-transferable, revocable licence to use the Service solely as
            permitted by these Terms.
          </p>

          <h3>6.2 Your Content</h3>
          <p>
            You retain ownership of all data, documents, and content you upload to or generate through the Service
            ("<strong>Customer Content</strong>"). You grant uTerms a limited licence to store, process, and display
            Customer Content solely to provide and improve the Service. You represent and warrant that you have all
            necessary rights to grant this licence.
          </p>

          <h3>6.3 Feedback</h3>
          <p>
            If you submit feedback, suggestions, or ideas about the Service, you grant uTerms a royalty-free,
            worldwide, perpetual licence to use such feedback without restriction and without any obligation to you.
          </p>
        </section>

        <section>
          <h2>7. Payment and Subscriptions</h2>
          <ul>
            <li>Subscription fees are billed in advance on a monthly or annual basis as selected at signup.</li>
            <li>All fees are exclusive of applicable taxes (VAT, GST, sales tax), which are added where required by law.</li>
            <li>Payments are processed by our third-party payment processor. By subscribing, you authorise us to charge your payment method on a recurring basis.</li>
            <li>You may cancel your subscription at any time through your account settings. Access continues until the end of the current billing period; no partial refunds are issued for unused time, except where required by law.</li>
            <li>We reserve the right to change pricing with at least <strong>30 days' notice</strong>. Continued use after the new pricing takes effect constitutes acceptance.</li>
            <li>Accounts with overdue payments may be suspended after reasonable notice.</li>
          </ul>
        </section>

        <section>
          <h2>8. Data Processing</h2>
          <p>
            To the extent you use the Service to collect and process personal data of your end-users (e.g. visitor
            consent records), you act as the <strong>data controller</strong> and uTerms acts as a{" "}
            <strong>data processor</strong> under your instructions. Our data processing practices are governed by
            our <a href="/privacy-policy">Privacy Policy</a> and, where required by GDPR, a Data Processing
            Agreement (DPA) available upon request at <a href="mailto:privacy@uterms.io">privacy@uterms.io</a>.
          </p>
          <p>
            You are responsible for ensuring you have a lawful basis to collect consent data and for providing your
            end-users with appropriate notices in accordance with applicable data protection law.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers and Limitation of Liability</h2>

          <h3>9.1 Disclaimer of Warranties</h3>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            NON-INFRINGEMENT, OR UNINTERRUPTED OR ERROR-FREE OPERATION. WE DO NOT WARRANT THAT THE SERVICE WILL
            MEET YOUR SPECIFIC LEGAL OR COMPLIANCE REQUIREMENTS.
          </p>

          <h3>9.2 Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, UTERMS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND
            AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN
            CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
            DAMAGES.
          </p>
          <p>
            IN ANY CASE, UTERMS'S AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE
            TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO UTERMS IN THE
            TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED US DOLLARS (USD $100).
          </p>
          <p>
            Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for
            certain damages. In such jurisdictions, our liability is limited to the greatest extent permitted by law.
          </p>
        </section>

        <section>
          <h2>10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless uTerms and its affiliates, officers, directors,
            employees, and agents from and against any claims, liabilities, damages, judgements, awards, losses,
            costs, or expenses (including reasonable attorneys' fees) arising out of or relating to your violation of
            these Terms, your use of the Service, or your infringement of any third-party rights.
          </p>
        </section>

        <section>
          <h2>11. Term and Termination</h2>
          <p>
            These Terms remain in effect while you use the Service. Either party may terminate the agreement:
          </p>
          <ul>
            <li><strong>You:</strong> at any time by cancelling your subscription and closing your account.</li>
            <li><strong>uTerms:</strong> immediately, without notice, for material breaches of these Terms, or with
            <strong> 30 days' notice</strong> for any other reason.</li>
          </ul>
          <p>
            Upon termination, your right to access the Service ceases. You may export your Customer Content before
            termination. We will delete Customer Content within 90 days of termination, except where retention is
            required by law.
          </p>
          <p>
            Sections 5, 6, 9, 10, 12, and 13 survive termination.
          </p>
        </section>

        <section>
          <h2>12. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, United States, without regard to its
            conflict of law provisions. Any dispute arising out of or relating to these Terms or the Service shall
            first be subject to good-faith negotiation. If unresolved, disputes shall be submitted to binding
            arbitration administered under the rules of the American Arbitration Association (AAA), with proceedings
            conducted in English.
          </p>
          <p>
            <strong>Class action waiver:</strong> You agree that any dispute resolution proceedings will be conducted
            only on an individual basis and not in a class, consolidated, or representative action.
          </p>
          <p>
            Nothing in this section prevents either party from seeking injunctive or other equitable relief from a
            court of competent jurisdiction.
          </p>
          <p>
            <strong>EU/UK users:</strong> Notwithstanding the above, if you are a consumer located in the EU or UK,
            you may also bring claims before the courts of your country of residence and may use the EU Online
            Dispute Resolution platform (<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>).
          </p>
        </section>

        <section>
          <h2>13. General Provisions</h2>
          <ul>
            <li><strong>Entire agreement:</strong> These Terms, together with the Privacy Policy and any applicable Order Form, constitute the entire agreement between you and uTerms regarding the Service.</li>
            <li><strong>Severability:</strong> If any provision is held unenforceable, the remaining provisions continue in full force.</li>
            <li><strong>Waiver:</strong> Our failure to enforce any right or provision does not constitute a waiver of that right or provision.</li>
            <li><strong>Assignment:</strong> You may not assign your rights or obligations under these Terms without our written consent. uTerms may assign these Terms in connection with a merger, acquisition, or sale of assets.</li>
            <li><strong>Modifications:</strong> We may update these Terms from time to time. Material changes will be communicated at least 30 days in advance via email or in-app notice. Continued use after the effective date constitutes acceptance.</li>
            <li><strong>Force majeure:</strong> Neither party is liable for failure to perform due to causes beyond its reasonable control.</li>
          </ul>
        </section>

        <section>
          <h2>14. Contact Us</h2>
          <p>For questions about these Terms:</p>
          <address>
            <strong>uTerms Inc.</strong><br />
            Legal Department<br />
            Email: <a href="mailto:legal@uterms.io">legal@uterms.io</a><br />
          </address>
        </section>

      </div>
    </div>
  );
};
