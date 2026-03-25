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
  scannedCookies?: any; // New field to hold the raw scan data

  // Step 7: Contact & Updates
  privacyEmail: string;
  effectiveDate: string;
  notificationMethod: string; // 'email' | 'website' | 'both'
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
};

// Helper to escape HTML to prevent XSS
const escapeHtml = (unsafe: string) => {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

  let jurisdiction = state ? `${state}, ${country}` : country || "";

  // Formatting fix for United Kingdom
  if (country === "United Kingdom") {
    if (
      !state ||
      state.trim().toUpperCase() === "UK" ||
      state === "United Kingdom"
    ) {
      jurisdiction = "the United Kingdom";
    }
  }

  const notifText =
    notificationMethod === "email"
      ? "We will notify you of material changes by email to the address associated with your account."
      : notificationMethod === "both"
        ? "We will notify you of material changes by email and by posting a notice on our website."
        : "We will post the updated policy on this page with a revised effective date.";

  const email = privacyEmail || "privacy@yourcompany.com";
  const company = companyName || "our company";
  const site = websiteUrl || "#";

  // Generate Cookie Table
  let cookieTableHtml = "";
  if (usesCookies && scannedCookies && scannedCookies.categories) {
    const rows: string[] = [];

    // Iterate through categories
    scannedCookies.categories.forEach((cat: any) => {
      // Iterate through providers in that category
      if (cat.providers) {
        cat.providers.forEach((prov: any) => {
          if (prov.cookies) {
            prov.cookies.forEach((c: any) => {
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

  return `<article class="policy-document">
  <h1>Privacy Policy</h1>
  <p class="policy-meta"><strong>Effective Date:</strong> ${formattedDate}</p>

  <section>
    <h2>1. Introduction</h2>
    <p>This Privacy Policy describes how <strong>${company}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, and protects information when you visit or use our services at <a href="${site}" target="_blank" rel="noopener noreferrer">${websiteUrl || "our website"}</a>.${jurisdiction ? ` This policy is governed by the applicable laws of <strong>${jurisdiction}</strong>.` : ""}</p>
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
  </section>

  <section>
    <h2>4. Sharing of Information</h2>
    ${
      sharesData && thirdParties.length > 0
        ? `<p>We may share your personal information with the following categories of trusted third-party service providers, only as necessary to operate our services:</p><ul>${thirdParties.map(li).join("")}</ul><p>We do not sell your personal information to any third party.</p>`
        : "<p>We do not sell, trade, or otherwise transfer your personal information to third parties, except as required by applicable law or to protect our legal rights.</p>"
    }
  </section>

  <section>
    <h2>5. Cookies &amp; Tracking Technologies</h2>
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
              ? ` For full details, please read our <a href="${cookiePolicyUrl}" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.`
              : " You can control or disable cookies through your browser settings, though this may affect some functionality."
          }</p>
      ${
        unclassifiedCookiesDescription
          ? `<p><strong>Unclassified Cookies:</strong> ${escapeHtml(
              unclassifiedCookiesDescription,
            )}</p>`
          : ""
      }
      ${cookieTableHtml}`
        : "<p>We do not use cookies or similar tracking technologies on our website.</p>"
    }
  </section>

  <section>
    <h2>6. Your Privacy Rights</h2>
    ${
      rights.length > 0
        ? `<p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p><ul>${rights.map((r) => li(`<strong>${r.title}:</strong> ${r.desc}`)).join("")}</ul><p>To exercise any of these rights, please contact us at <a href="mailto:${email}">${email}</a>. We will respond within 30 days.</p>`
        : `<p>You may have certain rights regarding your personal data depending on your location. Please contact us at <a href="mailto:${email}">${email}</a> to learn more.</p>`
    }
    <p>If you are a UK resident, you have the right to lodge a complaint with the Information Commissioner’s Office (ICO) at <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a>.</p>
  </section>

  <section>
    <h2>7. Data Security</h2>
    <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
  </section>

  <section>
    <h2>8. Data Retention</h2>
    <p>We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. When data is no longer needed, we securely delete or anonymize it.</p>
  </section>

  <section>
    <h2>9. Changes to This Policy</h2>
    <p>${notifText} The &ldquo;Effective Date&rdquo; at the top of this page reflects when this policy was last revised. We encourage you to review this policy periodically.</p>
  </section>

  <section>
    <h2>10. Contact Us</h2>
    <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
    <ul>
      ${email ? li(`<strong>Email:</strong> <a href="mailto:${email}">${email}</a>`) : ""}
      ${companyName ? li(`<strong>Company:</strong> ${companyName}`) : ""}
      ${websiteUrl ? li(`<strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${websiteUrl}</a>`) : ""}
    </ul>
  </section>
</article>`;
}
