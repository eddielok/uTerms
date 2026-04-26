import { escapeHtml, safeUrl } from './html';

export interface ScannedCookie {
  name: string;
  value?: string;
  domain?: string;
  path?: string;
  expires?: string | number;
  expiration?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  description?: string;
}

export interface ScannedProvider {
  name: string;
  cookies: ScannedCookie[];
}

export interface ScannedCategory {
  id: string;
  name: string;
  providers: ScannedProvider[];
}

export interface ScannedCookieData {
  categories: ScannedCategory[];
  cookiesCount?: number;
}

export interface WizardAnswers {
  // Step 1: Business Info
  companyName: string;
  websiteUrl: string;
  country: string;
  state: string;

  // Step 2: Data Collection
  collectsName: boolean;
  collectsEmail: boolean;
  collectsPhone: boolean;
  collectsAddress: boolean;
  collectsPayment: boolean;
  collectsDeviceInfo: boolean;
  collectsUsageData: boolean;
  collectsLocation: boolean;

  // Step 3: Purpose
  purposeServiceDelivery: boolean;
  purposeMarketing: boolean;
  purposeAnalytics: boolean;
  purposeLegal: boolean;
  purposeSecurity: boolean;

  // Step 4: Third-Party Sharing
  sharesData: boolean;
  sharesWithAdNetworks: boolean;
  sharesWithAnalytics: boolean;
  analyticsIpAnonymization: boolean;
  sharesWithPaymentProcessors: boolean;
  sharesWithSocialMedia: boolean;
  sharesWithCloud: boolean;

  // Step 5: User Rights
  rightToAccess: boolean;
  rightToDeletion: boolean;
  rightToPortability: boolean;
  rightToRestriction: boolean;
  rightToOptOut: boolean;

  // Step 6: Cookies
  usesCookies: boolean;
  cookieTypes: string[];
  cookiePolicyUrl: string;
  unclassifiedCookiesDescription?: string; // For user explanation of unclassified cookies
  scannedCookies?: ScannedCookieData;

  // Step 7: Contact & Updates
  privacyEmail: string;
  effectiveDate: string;
  notificationMethod: string; // 'email' | 'website' | 'both'

  // PIPL (China)
  piplApplies: boolean;
  piplRetentionDays: number;
  piplCrossBorder: boolean;
}

export const DEFAULT_ANSWERS: WizardAnswers = {
  companyName: "",
  websiteUrl: "",
  country: "",
  state: "",
  collectsName: false,
  collectsEmail: false,
  collectsPhone: false,
  collectsAddress: false,
  collectsPayment: false,
  collectsDeviceInfo: false,
  collectsUsageData: false,
  collectsLocation: false,
  purposeServiceDelivery: false,
  purposeMarketing: false,
  purposeAnalytics: false,
  purposeLegal: false,
  purposeSecurity: false,
  sharesData: false,
  sharesWithAdNetworks: false,
  sharesWithAnalytics: false,
  analyticsIpAnonymization: false,
  sharesWithPaymentProcessors: false,
  sharesWithSocialMedia: false,
  sharesWithCloud: false,
  rightToAccess: false,
  rightToDeletion: false,
  rightToPortability: false,
  rightToRestriction: false,
  rightToOptOut: false,
  usesCookies: false,
  cookieTypes: [],
  cookiePolicyUrl: "",
  unclassifiedCookiesDescription: "",
  privacyEmail: "",
  effectiveDate: "",
  notificationMethod: "website",
  piplApplies: false,
  piplRetentionDays: 180,
  piplCrossBorder: false,
};


function li(text: string) {
  return `<li>${text}</li>`;
}

export function generatePrivacyPolicy(answers: WizardAnswers): string {
  const {
    companyName,
    websiteUrl,
    country,
    state,
    collectsName,
    collectsEmail,
    collectsPhone,
    collectsAddress,
    collectsPayment,
    collectsDeviceInfo,
    collectsUsageData,
    collectsLocation,
    purposeServiceDelivery,
    purposeMarketing,
    purposeAnalytics,
    purposeLegal,
    purposeSecurity,
    sharesData,
    sharesWithAdNetworks,
    sharesWithAnalytics,
    analyticsIpAnonymization,
    sharesWithPaymentProcessors,
    sharesWithSocialMedia,
    sharesWithCloud,
    rightToAccess,
    rightToDeletion,
    rightToPortability,
    rightToRestriction,
    rightToOptOut,
    usesCookies,
    cookieTypes,
    cookiePolicyUrl,
    scannedCookies,
    unclassifiedCookiesDescription,
    privacyEmail,
    effectiveDate,
    notificationMethod,
  } = answers;

  const dataTypes: string[] = [
    collectsName && "Full name",
    collectsEmail && "Email address",
    collectsPhone && "Phone number",
    collectsAddress && "Physical address",
    collectsPayment && "Payment and billing information",
    collectsDeviceInfo && "Device and browser information",
    collectsUsageData && "Usage and interaction data",
    collectsLocation && "Location data",
  ].filter(Boolean) as string[];

  const purposes: string[] = [
    purposeServiceDelivery && "To provide, operate, and maintain our services",
    purposeMarketing &&
      "To send promotional and marketing communications (with your consent)",
    purposeAnalytics && "To analyze and improve how our services are used",
    purposeLegal && "To comply with legal and regulatory obligations",
    purposeSecurity && "To protect the security and integrity of our platform",
  ].filter(Boolean) as string[];

  const thirdParties: string[] = sharesData
    ? ([
        sharesWithAdNetworks && "Advertising networks",
        sharesWithAnalytics && "Analytics service providers",
        sharesWithPaymentProcessors && "Payment processors",
        sharesWithSocialMedia && "Social media platforms",
        sharesWithCloud && "Cloud infrastructure and hosting providers",
      ].filter(Boolean) as string[])
    : [];

  const rights: { title: string; desc: string }[] = [
    rightToAccess && {
      title: "Right to Access",
      desc: "You may request a copy of the personal data we hold about you.",
    },
    rightToDeletion && {
      title: "Right to Erasure",
      desc: "You may request that we delete your personal data, subject to certain conditions.",
    },
    rightToPortability && {
      title: "Right to Data Portability",
      desc: "You may request your data in a structured, machine-readable format.",
    },
    rightToRestriction && {
      title: "Right to Restriction",
      desc: "You may request that we limit how we process your data in certain circumstances.",
    },
    rightToOptOut && {
      title: "Right to Opt-Out",
      desc: "You may opt out of the sale or sharing of your personal data at any time.",
    },
  ].filter(Boolean) as { title: string; desc: string }[];

  const formattedDate = effectiveDate
    ? new Date(effectiveDate + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  let jurisdiction = country || "";

  if (country === "England and Wales") {
    jurisdiction = "England and Wales";
  } else if (country === "United Kingdom") {
    if (!state || state.trim().toUpperCase() === "UK" || state === "United Kingdom") {
      jurisdiction = "the United Kingdom";
    }
  }
  jurisdiction = escapeHtml(jurisdiction);

  const notifText =
    notificationMethod === "email"
      ? "We will notify you of material changes by email to the address associated with your account."
      : notificationMethod === "both"
        ? "We will notify you of material changes by email and by posting a notice on our website."
        : "We will post the updated policy on this page with a revised effective date.";

  const email = escapeHtml(privacyEmail) || "privacy@yourcompany.com";
  const company = escapeHtml(companyName) || "our company";
  const site = safeUrl(websiteUrl);
  const websiteDisplay = escapeHtml(websiteUrl) || "our website";

  // Legal basis entries (GDPR Article 6)
  const legalBasisEntries: {
    purpose: string;
    basis: string;
    article: string;
  }[] = [
    purposeServiceDelivery && {
      purpose: "Providing, operating, and maintaining our services",
      basis: "Contractual Necessity",
      article: "Article 6(1)(b) GDPR",
    },
    (purposeAnalytics || purposeSecurity) && {
      purpose: "Analytics, service improvement, and security",
      basis: "Legitimate Interest",
      article: "Article 6(1)(f) GDPR",
    },
    purposeMarketing && {
      purpose: "Marketing and promotional communications",
      basis: "Consent",
      article: "Article 6(1)(a) GDPR",
    },
    purposeLegal && {
      purpose: "Legal and regulatory compliance",
      basis: "Legal Obligation",
      article: "Article 6(1)(c) GDPR",
    },
    usesCookies && {
      purpose: "Cookie-based tracking and personalisation",
      basis: "Consent",
      article: "Article 6(1)(a) GDPR",
    },
  ].filter(Boolean) as { purpose: string; basis: string; article: string }[];

  // International data transfer: flag if sharing with analytics/cloud/ads/social/payments
  const hasInternationalTransfers =
    sharesWithAnalytics ||
    sharesWithCloud ||
    sharesWithAdNetworks ||
    sharesWithPaymentProcessors ||
    sharesWithSocialMedia;

  // Check if we have GA or other analytics cookies
  const hasAnalyticsCookies = scannedCookies?.categories?.some((cat: ScannedCategory) => {
    return cat.providers?.some((prov: ScannedProvider) => {
      return prov.cookies?.some((c: ScannedCookie) => {
        const name = c.name?.toLowerCase() || "";
        return (
          name.includes("_ga") ||
          name.includes("_gid") ||
          name.includes("_gat") ||
          name.includes("__utm") ||
          name.includes("_hjid") ||
          name.includes("_clck") ||
          name.includes("_pk_")
        );
      });
    });
  });

  // Check if we have API-related functional cookies
  const hasApiCookies = scannedCookies?.categories?.some((cat: ScannedCategory) => {
    return cat.providers?.some((prov: ScannedProvider) => {
      return prov.cookies?.some((c: ScannedCookie) => {
        const name = c.name?.toLowerCase() || "";
        return name.includes("api") || name.includes("_cache");
      });
    });
  });

  // CCPA categories of data collected
  const ccpaCategories: string[] = [
    collectsName && "Identifiers (e.g. name)",
    collectsEmail && "Identifiers (e.g. email address)",
    collectsPhone && "Identifiers (e.g. phone number)",
    collectsAddress && "Identifiers (e.g. physical address)",
    collectsPayment && "Financial information (e.g. payment and billing data)",
    collectsDeviceInfo &&
      "Internet / network activity (e.g. device and browser information)",
    collectsUsageData &&
      "Internet / network activity (e.g. usage and interaction data)",
    hasAnalyticsCookies &&
      "Internet or other electronic network activity information (e.g., browsing history, IP address)",
    collectsLocation && "Geolocation data",
  ].filter(Boolean) as string[];

  // Generate Cookie Table
  let cookieTableHtml = "";
  if (usesCookies && scannedCookies && scannedCookies.categories) {
    const rows: string[] = [];

    // Iterate through categories
    scannedCookies.categories.forEach((cat: ScannedCategory) => {
      // Iterate through providers in that category
      if (cat.providers) {
        cat.providers.forEach((prov: ScannedProvider) => {
          if (prov.cookies) {
            prov.cookies.forEach((c: ScannedCookie) => {
              rows.push(`
                <tr>
                  <td style="padding: 4px; border: 1px solid #ddd;">${escapeHtml(c.name)}</td>
                  <td style="padding: 4px; border: 1px solid #ddd;">${escapeHtml(c.domain)}</td>
                  <td style="padding: 4px; border: 1px solid #ddd;">${escapeHtml(cat.name)}</td>
                  <td style="padding: 4px; border: 1px solid #ddd;">${escapeHtml(c.description || "-")}</td>
                  <td style="padding: 4px; border: 1px solid #ddd;">${escapeHtml(c.expiration || "-")}</td>
                </tr>
               `);
            });
          }
        });
      }
    });

    if (rows.length > 0) {
      cookieTableHtml = `
      <div style="overflow-x: auto; margin-top: 1rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; line-height: 1.2;">
          <thead>
            <tr style="background-color: #f9fafb; text-align: left;">
              <th style="padding: 4px; border: 1px solid #ddd;">Name</th>
              <th style="padding: 4px; border: 1px solid #ddd;">Domain</th>
              <th style="padding: 4px; border: 1px solid #ddd;">Category</th>
              <th style="padding: 4px; border: 1px solid #ddd;">Description</th>
              <th style="padding: 4px; border: 1px solid #ddd;">Expiration</th>
            </tr>
          </thead>
          <tbody>
            ${rows.join("")}
          </tbody>
        </table>
      </div>`;
    }
  }

  return `
<h1>Privacy Policy</h1>
<p class="policy-meta">Last updated: ${formattedDate}</p>

  <section>
    <h2>1. Introduction</h2>
    <p>This Privacy Policy describes how <strong>${company}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, and protects information when you visit or use our services at <a href="${site}" target="_blank" rel="noopener noreferrer">${websiteDisplay}</a>.${jurisdiction ? ` This policy is governed by the applicable laws of <strong>${jurisdiction}</strong>.` : ""}</p>
    <p>By using our services, you agree to the collection and use of information in accordance with this policy.</p>
  </section>

  <section>
    <h2>2. Information We Collect</h2>
    ${
      dataTypes.length > 0
        ? `<p>We may collect the following categories of personal information from you:</p><ul>${dataTypes.map(li).join("")}</ul>`
        : "<p>We collect only the minimum information necessary to operate our services, such as basic usage and device data.</p>"
    }
  </section>

  <section>
    <h2>3. How We Use Your Information</h2>
    ${
      purposes.length > 0
        ? `<p>We use the information we collect for the following purposes:</p><ul>${purposes.map(li).join("")}</ul>`
        : "<p>We use the information we collect solely to provide and improve our services to you.</p>"
    }
    ${
      legalBasisEntries.length > 0
        ? `<p>Where required by applicable law (including GDPR), we process personal data on one or more of the following legal grounds:</p>
    <div style="overflow-x:auto;margin:0.75rem 0;">
      <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
        <thead>
          <tr style="background:#f3f4f6;text-align:left;">
            <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Processing Activity</th>
            <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Legal Basis</th>
            <th style="text-align:left;padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">Reference</th>
          </tr>
        </thead>
        <tbody>
          ${legalBasisEntries
            .map(
              (e) => `<tr>
            <td style="padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">${e.purpose}</td>
            <td style="padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">${e.basis}</td>
            <td style="padding:0.6rem 0.75rem;border:1px solid #e5e7eb;">${e.article}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`
        : ""
    }
  </section>

  <section>
    <h2>4. Sharing of Information</h2>
    ${
      sharesData && thirdParties.length > 0
        ? `<p>We may share your personal information with the following categories of trusted third-party service providers, only as necessary to operate our services:</p><ul>${thirdParties.map(li).join("")}</ul><p>We do not sell your personal information to any third party.</p>`
        : "<p>We do not sell, trade, or otherwise transfer your personal information to third parties, except as required by applicable law or to protect our legal rights.</p>"
    }
    ${
      sharesWithAnalytics && analyticsIpAnonymization
        ? `<p><strong>Google Analytics &amp; IP Anonymization:</strong> We use Google Analytics to understand how visitors interact with our website. We have enabled <strong>IP Anonymization</strong> (also known as IP masking), which means Google truncates your IP address before storing it — your full IP address is never written to disk. This measure reduces the personal data transmitted to Google and supports our compliance with GDPR and the UK GDPR. You can learn more at <a href="https://support.google.com/analytics/answer/2763052" target="_blank" rel="noopener noreferrer">Google&rsquo;s IP anonymization documentation</a>.</p>`
        : ""
    }
  </section>

  <section>
    <h2>5. International Data Transfers</h2>
    ${
      hasInternationalTransfers
        ? `<p>Some of the third-party service providers we use (such as analytics platforms and cloud infrastructure providers) may process your personal data on servers located outside the United Kingdom (UK) or the European Economic Area (EEA), including in the United States.</p>
    <p>Where such transfers occur, we ensure appropriate safeguards are in place in accordance with applicable data protection law. These safeguards may include:</p>
    <ul>
      <li>Standard Contractual Clauses (SCCs) approved by the European Commission or the UK Information Commissioner&rsquo;s Office (ICO)</li>
      <li>Adequacy decisions confirming the recipient country provides equivalent data protection</li>
    </ul>
    <p>You may request a copy of the applicable transfer mechanism by contacting us at <a href="mailto:${email}">${email}</a>.</p>`
        : `<p>We endeavour to store and process your personal data within the United Kingdom (UK) or the European Economic Area (EEA). If we need to transfer data outside these regions, we will ensure adequate safeguards are in place, such as Standard Contractual Clauses (SCCs), before doing so.</p>`
    }
  </section>

  <section>
    <h2>6. Cookies &amp; Tracking Technologies</h2>
    ${
      usesCookies
        ? `<p>We use cookies and similar tracking technologies on our website.${
            cookieTypes && cookieTypes.length > 0
              ? ` We use the following types of cookies: <strong>${cookieTypes.join(
                  ", ",
                )}</strong>.`
              : ""
          }${
            cookiePolicyUrl
              ? ` For full details, please read our <a href="${safeUrl(cookiePolicyUrl)}" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.`
              : " You can control or disable cookies through your browser settings, though this may affect some functionality."
          }</p>
      ${
        unclassifiedCookiesDescription
          ? `<p><strong>Unclassified Cookies:</strong> ${escapeHtml(
              unclassifiedCookiesDescription,
            )}</p>`
          : ""
      }
      ${
        hasApiCookies
          ? `<p><strong>Functional Cookies:</strong> We use functional cookies to enhance your experience and store your privacy preferences. These cookies (such as API cache cookies) are necessary to provide core functionality and remember your settings.</p>`
          : ""
      }
      ${cookieTableHtml}`
        : "<p>We do not use cookies or similar tracking technologies on our website.</p>"
    }
  </section>

  <section>
    <h2>7. Your Privacy Rights</h2>
    <p>We do not &ldquo;Sell&rdquo; your personal information collected via cookies or otherwise, nor do we &ldquo;Share&rdquo; it for cross-context behavioral advertising, as those terms are defined by the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).</p>
    ${
      ccpaCategories.length > 0
        ? `<p>In the preceding 12 months, we have collected the following categories of personal information:</p><ul>${ccpaCategories.map(li).join("")}</ul>`
        : ""
    }
    ${
      rights.length > 0
        ? `<p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p><ul>${rights.map((r) => li(`<strong>${r.title}:</strong> ${r.desc}`)).join("")}</ul><p>To exercise any of these rights, please contact us at <a href="mailto:${email}">${email}</a>. We will respond within 30 days.</p>`
        : `<p>You may have certain rights regarding your personal data depending on your location. Please contact us at <a href="mailto:${email}">${email}</a> to learn more.</p>`
    }
    <p>If you are a UK resident, you have the right to lodge a complaint with the Information Commissioner&rsquo;s Office (ICO) at <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a>.</p>
    <p>If you are a California resident, you may also submit a verifiable consumer request to us at <a href="mailto:${email}">${email}</a> to exercise your CCPA/CPRA rights, including the right to know, the right to delete, and the right to correct your personal information.</p>
  </section>

  <section>
    <h2>8. Data Security</h2>
    <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
  </section>

  <section>
    <h2>9. Data Retention</h2>
    <p>We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. When data is no longer needed, we securely delete or anonymize it.</p>
  </section>

  ${answers.piplApplies ? `
  <section>
    <h2>10. 中国《个人信息保护法》（PIPL）声明 / China PIPL Notice</h2>
    <p>本节适用于中国大陆的访客，并依据《中华人民共和国个人信息保护法》（PIPL，2021年11月1日施行）作出补充说明。</p>
    <p><em>This section applies to visitors in mainland China and supplements this Privacy Policy in accordance with China's Personal Information Protection Law (PIPL, effective 1 November 2021).</em></p>

    <p><strong>个人信息处理者 / Data Controller：</strong> ${company}${email ? `（联系方式 / Contact: <a href="mailto:${email}">${email}</a>）` : ""}</p>

    <p><strong>处理目的与法律依据 / Purposes and Legal Basis：</strong> 我们依据您的同意（PIPL 第13条第1款）处理您的个人信息，用于提供和改进我们的服务、分析网站使用情况，以及（如适用）发送营销通讯。您可随时撤回同意，而不影响撤回前已基于同意所进行处理的合法性。</p>
    <p><em>We process your personal information based on your consent (PIPL Art. 13(1)) for the purposes of providing and improving our services, analysing website usage, and (where applicable) sending marketing communications. You may withdraw consent at any time without affecting the lawfulness of prior processing.</em></p>

    <p><strong>保留期限 / Retention Period：</strong> 我们保留个人信息的期限不超过 <strong>${answers.piplRetentionDays || 180} 天</strong>（或达成处理目的所必要的最短期限），届时将予以删除或匿名化处理。</p>
    <p><em>We retain personal information for no longer than <strong>${answers.piplRetentionDays || 180} days</strong> (or the minimum period necessary to fulfil the processing purpose), after which it is deleted or anonymised.</em></p>

    ${answers.piplCrossBorder ? `
    <p><strong>个人信息出境 / Cross-Border Transfer：</strong> 您的部分个人信息可能被传输至中国境外的服务器或第三方服务商处理。我们已依法采取必要措施，确保境外接收方提供与 PIPL 相当的保护水平，包括签署标准合同条款（SCCs）或通过其他合规机制。</p>
    <p><em>Some of your personal information may be transferred to servers or third-party service providers outside China. We have taken necessary measures to ensure that overseas recipients provide a level of protection equivalent to PIPL, including execution of Standard Contractual Clauses (SCCs) or other compliant mechanisms.</em></p>
    ` : ""}

    <p><strong>您在 PIPL 下的权利 / Your Rights under PIPL：</strong> 您有权查阅、复制、更正、补充、删除您的个人信息；撤回同意；限制或拒绝个人信息处理；以及就自动化决策提出异议。如需行使上述权利，请联系 <a href="mailto:${email}">${email}</a>，我们将在法定期限内予以回应。</p>
    <p><em>You have the right to access, copy, correct, supplement, and delete your personal information; withdraw consent; restrict or object to processing; and raise objections regarding automated decision-making. To exercise these rights contact <a href="mailto:${email}">${email}</a>; we will respond within the statutory timeframe.</em></p>
  </section>
  ` : ""}

  <section>
    <h2>${answers.piplApplies ? "11" : "10"}. Changes to This Policy</h2>
    <p>${notifText} The &ldquo;Effective Date&rdquo; at the top of this page reflects when this policy was last revised. We encourage you to review this policy periodically.</p>
  </section>

  <section>
    <h2>${answers.piplApplies ? "12" : "11"}. Contact Us</h2>
    <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
    <ul>
      ${email ? li(`<strong>Email:</strong> <a href="mailto:${email}">${email}</a>`) : ""}
      ${companyName ? li(`<strong>Company:</strong> ${company}`) : ""}
      ${websiteUrl ? li(`<strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${websiteDisplay}</a>`) : ""}
    </ul>
  </section>
`.trim();
}
