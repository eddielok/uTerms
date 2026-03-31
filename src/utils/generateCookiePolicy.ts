export interface SpecificCookie {
  name: string;
  provider: string;
  category: string;
  purpose: string;
  duration: string;
  partyType: "First-party" | "Third-party";
}

export interface CookiePolicyAnswers {
  // Step 1: Website Info
  websiteName: string;
  websiteUrl: string;
  websiteType: string;
  country: string;

  // Step 2: Cookie Types
  specificCookies: SpecificCookie[];
  usesEssential: boolean;
  usesFunctional: boolean;
  usesAnalytics: boolean;
  usesMarketing: boolean;
  usesSocial: boolean;

  // Step 3: Third-Party Providers
  analyticsProviders: string[];
  marketingProviders: string[];
  socialProviders: string[];
  otherProviders: string;

  // Step 4: Consent & Control
  consentMechanism: string; // 'banner' | 'implied' | 'opt-in'
  cookieDuration: string;
  optOutMethod: string;

  // Step 5: Compliance
  gdprApplies: boolean;
  ccpaApplies: boolean;
  eprivacyApplies: boolean;
  sellsData: boolean;
  sharesData: boolean;

  // Step 6: Contact & Generate
  contactEmail: string;
  effectiveDate: string;
}

export const DEFAULT_COOKIE_ANSWERS: CookiePolicyAnswers = {
  websiteName: "",
  websiteUrl: "",
  websiteType: "website",
  country: "United States",
  specificCookies: [],
  usesEssential: true,
  usesFunctional: false,
  usesAnalytics: false,
  usesMarketing: false,
  usesSocial: false,
  analyticsProviders: [],
  marketingProviders: [],
  socialProviders: [],
  otherProviders: "",
  consentMechanism: "banner",
  cookieDuration: "12 months",
  optOutMethod: "banner",
  gdprApplies: false,
  ccpaApplies: false,
  eprivacyApplies: false,
  sellsData: false,
  sharesData: false,
  contactEmail: "",
  effectiveDate: new Date().toISOString().split("T")[0],
};

function formatDate(dateStr: string): string {
  if (!dateStr)
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

const PROVIDER_LINKS: Record<string, string> = {
  "Google Analytics": "https://policies.google.com/privacy",
  "Google Tag Manager": "https://policies.google.com/privacy",
  "Meta Pixel": "https://www.facebook.com/privacy/policy/",
  Facebook: "https://www.facebook.com/privacy/policy/",
  HubSpot: "https://legal.hubspot.com/privacy-policy",
  Hotjar: "https://www.hotjar.com/legal/policies/privacy/",
  Mixpanel: "https://mixpanel.com/legal/privacy-policy/",
  Segment: "https://www.twilio.com/en-us/legal/privacy",
  Intercom: "https://www.intercom.com/legal/privacy",
  Zendesk:
    "https://www.zendesk.com/company/agreements-and-terms/privacy-notice/",
  Stripe: "https://stripe.com/privacy",
  LinkedIn: "https://www.linkedin.com/legal/privacy-policy",
  "Twitter/X": "https://twitter.com/en/privacy",
  TikTok: "https://www.tiktok.com/legal/page/us/privacy-policy/en",
  Pinterest: "https://policy.pinterest.com/en/privacy-policy",
  Snapchat: "https://snap.com/en-US/privacy/privacy-policy",
};

export function generateCookiePolicy(a: CookiePolicyAnswers): string {
  const site = a.websiteName || a.websiteUrl || "this website";
  const url = a.websiteUrl || "#";
  const effectiveDateStr = formatDate(a.effectiveDate);

  const allAnalytics = a.analyticsProviders;
  const allMarketing = a.marketingProviders;
  const allSocial = a.socialProviders;

  // Build cookie table rows
  const cookieRows: string[] = [];
  if (a.usesEssential) {
    cookieRows.push(`
      <tr>
        <td><strong>Essential / Strictly Necessary</strong></td>
        <td>Required for the website to function. Cannot be disabled.</td>
        <td>Session / Persistent</td>
        <td>First-party</td>
        <td>Always active</td>
      </tr>`);
  }
  if (a.usesFunctional) {
    cookieRows.push(`
      <tr>
        <td><strong>Functional</strong></td>
        <td>Remember your preferences such as language, region, or login state.</td>
        <td>Persistent (up to ${a.cookieDuration})</td>
        <td>First-party</td>
        <td>Opt-in</td>
      </tr>`);
  }
  if (a.usesAnalytics) {
    cookieRows.push(`
      <tr>
        <td><strong>Analytics / Performance</strong></td>
        <td>Help us understand how visitors interact with the website by collecting and reporting information anonymously.</td>
        <td>Persistent (up to ${a.cookieDuration})</td>
        <td>First &amp; third-party</td>
        <td>Opt-in</td>
      </tr>`);
  }
  if (a.usesMarketing) {
    cookieRows.push(`
      <tr>
        <td><strong>Marketing / Advertising</strong></td>
        <td>Track visitors across websites to display relevant and personalised advertising.</td>
        <td>Persistent (up to ${a.cookieDuration})</td>
        <td>Third-party</td>
        <td>Opt-in</td>
      </tr>`);
  }
  if (a.usesSocial) {
    cookieRows.push(`
      <tr>
        <td><strong>Social Media</strong></td>
        <td>Enable sharing of pages and content from our website onto social media platforms.</td>
        <td>Persistent (up to ${a.cookieDuration})</td>
        <td>Third-party</td>
        <td>Opt-in</td>
      </tr>`);
  }

  // Build third-party provider list
  const providerSections: string[] = [];
  if (allAnalytics.length > 0) {
    const items = allAnalytics
      .map((p) => {
        const link = PROVIDER_LINKS[p];
        return link
          ? `<li><strong>${p}</strong> — <a href="${link}" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>`
          : `<li><strong>${p}</strong></li>`;
      })
      .join("");
    providerSections.push(
      `<p><em>Analytics &amp; Performance:</em></p><ul>${items}</ul>`,
    );
  }
  if (allMarketing.length > 0) {
    const items = allMarketing
      .map((p) => {
        const link = PROVIDER_LINKS[p];
        return link
          ? `<li><strong>${p}</strong> — <a href="${link}" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>`
          : `<li><strong>${p}</strong></li>`;
      })
      .join("");
    providerSections.push(
      `<p><em>Marketing &amp; Advertising:</em></p><ul>${items}</ul>`,
    );
  }
  if (allSocial.length > 0) {
    const items = allSocial
      .map((p) => {
        const link = PROVIDER_LINKS[p];
        return link
          ? `<li><strong>${p}</strong> — <a href="${link}" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>`
          : `<li><strong>${p}</strong></li>`;
      })
      .join("");
    providerSections.push(`<p><em>Social Media:</em></p><ul>${items}</ul>`);
  }
  if (a.otherProviders.trim()) {
    providerSections.push(`<p><em>Other:</em></p><p>${a.otherProviders}</p>`);
  }

  // Consent mechanism description
  const consentDesc =
    a.consentMechanism === "banner"
      ? "When you first visit our website, a cookie consent banner will appear. You can choose to accept all cookies, reject non-essential cookies, or manage your preferences individually."
      : a.consentMechanism === "opt-in"
        ? "We use an explicit opt-in mechanism. Non-essential cookies are not placed until you have given affirmative consent through our consent management tool."
        : "By continuing to use our website, you agree to the placement of strictly necessary cookies. For non-essential cookies, you may opt out at any time using the controls described below.";

  // Opt-out description
  const optOutDesc =
    a.optOutMethod === "banner"
      ? 'You can change or withdraw your consent at any time by clicking the "Cookie Settings" link in the footer of our website.'
      : a.optOutMethod === "browser"
        ? "You can control and delete cookies through your browser settings. Please visit your browser's help documentation for guidance on managing cookies."
        : "You can change or withdraw your consent via our Cookie Settings tool, or by adjusting your browser settings to block or delete cookies.";

  // GDPR / CCPA sections
  let gdprSection = "";
  if (a.gdprApplies) {
    gdprSection = `
    <section>
      <h2>5. GDPR — Legal Basis for Cookie Processing</h2>
      <p>For visitors in the European Economic Area (EEA) and United Kingdom, we rely on the following legal bases under Article 6 of the GDPR:</p>
      <ul>
        <li><strong>Legitimate Interests (Art. 6(1)(f))</strong> — for strictly necessary cookies required to deliver our service.</li>
        <li><strong>Consent (Art. 6(1)(a))</strong> — for all non-essential cookies (functional, analytics, marketing, social). You may withdraw consent at any time.</li>
      </ul>
      <p>We do not use cookies for automated decision-making or profiling that produces significant legal effects.</p>
    </section>`;
  }

  let ccpaSection = "";
  if (a.ccpaApplies) {
    const sectionNum = a.gdprApplies ? "6" : "5";
    const sharingProviders = [...a.marketingProviders, ...a.analyticsProviders]
      .filter(Boolean)
      .join(", ");

    ccpaSection = `
    <section>
      <h2>${sectionNum}. Notice at Collection — California Residents (CCPA / CPRA)</h2>
      <p>This section applies to consumers in the State of California and supplements the rest of this Cookie Policy, as required by the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).</p>

      <p><strong>Sale of Personal Information:</strong> We do <strong>not</strong> &ldquo;Sell&rdquo; your personal information collected via cookies, as that term is defined under the CCPA / CPRA (i.e., disclosing personal information to a third party for monetary or other valuable consideration).${a.sellsData ? " <em>Note: please update this statement if your practices differ.</em>" : ""}</p>

      <p><strong>Sharing for Cross-Context Behavioral Advertising:</strong> ${
        a.sharesData
          ? `We <strong>do</strong> &ldquo;Share&rdquo; personal information collected via cookies for cross-context behavioral advertising, as defined under the CPRA.${sharingProviders ? ` This includes sharing data with: <strong>${sharingProviders}</strong>.` : ""} You have the right to opt out of this sharing at any time using the opt-out mechanism described below.`
          : `We do <strong>not</strong> &ldquo;Share&rdquo; your personal information collected via cookies for cross-context behavioral advertising, as defined under the CPRA.`
      }</p>

      <p>As a California resident, you have the following rights regarding personal information collected via cookies:</p>
      <ul>
        <li><strong>Right to Know</strong> — Request disclosure of the categories and specific pieces of personal information collected about you via cookies, the purposes for collection, and whether it is sold or shared.</li>
        <li><strong>Right to Delete</strong> — Request deletion of personal information collected via cookies, subject to certain exceptions.</li>
        <li><strong>Right to Opt Out of Sale / Sharing</strong> — Opt out of the sale or sharing of your personal information at any time. Use our cookie consent manager or click &ldquo;Do Not Sell or Share My Personal Information&rdquo; in our website footer.</li>
        <li><strong>Right to Correct</strong> — Request correction of inaccurate personal information we hold about you.</li>
        <li><strong>Right to Non-Discrimination</strong> — We will not discriminate against you for exercising any of your CCPA / CPRA rights.</li>
      </ul>

      <p>To submit a request or for questions about your California privacy rights, contact us at <a href="mailto:${a.contactEmail}">${a.contactEmail}</a>. We will respond within 45 days as required by law.</p>
    </section>`;
  }

  const sectionOffset = (a.gdprApplies ? 1 : 0) + (a.ccpaApplies ? 1 : 0);

  return `
<h1>Cookie Policy</h1>
<p class="policy-meta">Last updated: ${effectiveDateStr}</p>

<section>
  <h2>1. Introduction</h2>
  <p>This Cookie Policy explains how <strong>${site}</strong> (<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>) uses cookies and similar tracking technologies when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>
  <p>Please read this policy carefully. By using our website, you consent to the use of cookies in accordance with this policy.</p>
</section>

<section>
  <h2>2. What Are Cookies?</h2>
  <p>Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
  <p>Cookies set by the website owner (in this case, ${site}) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality on or through the website.</p>
</section>

<section>
  <h2>3. Cookies We Use</h2>
  <p>We use the following categories of cookies on our website:</p>
  <div style="overflow-x:auto;margin:0.75rem 0;">
  <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Category</th>
        <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Purpose</th>
        <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Duration</th>
        <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Type</th>
        <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Consent</th>
      </tr>
    </thead>
    <tbody style="border:1px solid #e5e7eb;">
      ${cookieRows
        .map((r) =>
          r
            .split("\n")
            .map((l) => l.replace(/^\s{6}/, ""))
            .join("\n")
            .replace(
              /<td>/g,
              '<td style="padding:0.6rem 0.75rem;border:1px solid #e5e7eb;vertical-align:top;">',
            ),
        )
        .join("")}
    </tbody>
  </table>
  </div>

  <h3 style="font-size:1rem;font-weight:700;color:#111827;margin-top:2rem;margin-bottom:0.5rem;font-family:ui-sans-serif,system-ui,sans-serif;">Specific Cookie Names</h3>
  <p style="font-size:0.875rem;color:#4b5563;margin-bottom:0.75rem;">The table below names each individual cookie in use on our website. Listing cookies by name — not just category — is required by GDPR transparency obligations (Art. 13/14) and the ePrivacy Directive.</p>
  ${
    a.specificCookies.length > 0
      ? `
  <div style="overflow-x:auto;margin:0.5rem 0;">
  <table style="width:100%;border-collapse:collapse;font-size:0.8125rem;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Cookie Name</th>
        <th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Provider</th>
        <th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Category</th>
        <th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Purpose</th>
        <th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Duration</th>
        <th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Type</th>
      </tr>
    </thead>
    <tbody>
      ${a.specificCookies
        .map(
          (c) => `
      <tr>
        <td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;font-family:ui-monospace,monospace;font-size:0.8rem;">${c.name}</td>
        <td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">${c.provider}</td>
        <td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">${c.category}</td>
        <td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">${c.purpose || "—"}</td>
        <td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">${c.duration || "—"}</td>
        <td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">${c.partyType}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
  </div>`
      : `
  <p style="font-size:0.875rem;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:0.75rem 1rem;margin:0.5rem 0;">
    <strong>Action required:</strong> No specific cookies have been listed yet. Return to the Cookie Policy wizard (Step 2 &rarr; Specific Cookies) and add each cookie name (e.g. <code style="font-family:ui-monospace,monospace;font-size:0.8rem;background:#fef3c7;padding:0.1rem 0.3rem;border-radius:3px;">_ga</code>, <code style="font-family:ui-monospace,monospace;font-size:0.8rem;background:#fef3c7;padding:0.1rem 0.3rem;border-radius:3px;">_gid</code>, <code style="font-family:ui-monospace,monospace;font-size:0.8rem;background:#fef3c7;padding:0.1rem 0.3rem;border-radius:3px;">csrf_token</code>). This table is required for GDPR compliance.
  </p>`
  }
</section>

${
  providerSections.length > 0
    ? `
<section>
  <h2>4. Third-Party Cookies &amp; Service Providers</h2>
  <p>We use the following third-party services that may set cookies on your device. Each provider has its own privacy and cookie policy:</p>
  ${providerSections.join("")}
</section>`
    : `
<section>
  <h2>4. Third-Party Cookies</h2>
  <p>Some cookies on our website are set by third-party services. These cookies are governed by the respective third parties' privacy policies, which we encourage you to review.</p>
</section>`
}

${gdprSection}
${ccpaSection}

<section>
  <h2>${4 + sectionOffset + 1}. How We Obtain Your Consent</h2>
  <p>${consentDesc}</p>
</section>

<section>
  <h2>${4 + sectionOffset + 2}. How to Manage &amp; Opt Out of Cookies</h2>
  <p>${optOutDesc}</p>
  <p>You can also opt out of specific third-party tracking by visiting:</p>
  <ul>
    <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
    <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices (EU)</a></li>
    <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative (US)</a></li>
    <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance (US)</a></li>
  </ul>
  <p>Please note that disabling certain cookies may affect the functionality of our website.</p>
  ${
    a.ccpaApplies
      ? `<p>${
          !a.sellsData && !a.sharesData
            ? `We do not &ldquo;Sell&rdquo; your personal information collected via cookies, nor do we &ldquo;Share&rdquo; it for cross-context behavioral advertising.`
            : !a.sellsData && a.sharesData
              ? `We do not &ldquo;Sell&rdquo; your personal information collected via cookies. We do &ldquo;Share&rdquo; it for cross-context behavioral advertising — you may opt out using the controls above.`
              : `We may &ldquo;Sell&rdquo; or &ldquo;Share&rdquo; personal information collected via cookies. California residents may opt out using the controls above or by contacting us directly.`
        }</p>`
      : ""
  }
</section>

<section>
  <h2>${4 + sectionOffset + 3}. Changes to This Cookie Policy</h2>
  <p>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. When we make significant changes, we will update the "Last updated" date at the top of this policy. We encourage you to review this policy periodically.</p>
</section>

<section>
  <h2>${4 + sectionOffset + 4}. Contact Us</h2>
  <p>If you have questions or concerns about our use of cookies, please contact us at:</p>
  <p><a href="mailto:${a.contactEmail}">${a.contactEmail}</a></p>
</section>
`.trim();
}
