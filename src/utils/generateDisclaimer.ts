export interface DisclaimerAnswers {
  // Step 1: Business Info
  companyName: string;
  websiteUrl: string;
  businessType: string;
  country: string;

  // Step 2: Disclaimer Types
  generalInfo: boolean;
  professionalAdvice: boolean;
  medicalHealth: boolean;
  financialInvestment: boolean;
  legalAdvice: boolean;
  affiliateLinks: boolean;
  aiContent: boolean;
  testimonials: boolean;

  // Step 3: Liability & Accuracy
  noAccuracyGuarantee: boolean;
  contentMayBeOutdated: boolean;
  rightToChange: boolean;
  externalLinksDisclaimer: boolean;
  externalSitesOwnPolicies: boolean;
  userAssumesRisk: boolean;
  noLiabilityForDamages: boolean;

  // Step 4: Professional Advice
  recommendDoctor: boolean;
  recommendLawyer: boolean;
  recommendFinancialAdvisor: boolean;
  recommendAccountant: boolean;
  recommendMentalHealth: boolean;
  emergencyServicesNotice: boolean;
  notLicensedInJurisdiction: boolean;

  // Step 5: Affiliate & FTC
  ftcDisclosure: boolean;
  noIncomeGuarantee: boolean;
  pastResultsNotTypical: boolean;
  testimonialsNotTypical: boolean;
  sponsoredContent: boolean;

  // Step 6: Contact & Generate
  contactEmail: string;
  effectiveDate: string;
  policyTitle: string;
}

export const DEFAULT_DISCLAIMER_ANSWERS: DisclaimerAnswers = {
  companyName: "",
  websiteUrl: "",
  businessType: "Blog / Content Website",
  country: "United Kingdom",
  generalInfo: true,
  professionalAdvice: false,
  medicalHealth: false,
  financialInvestment: false,
  legalAdvice: false,
  affiliateLinks: false,
  aiContent: false,
  testimonials: false,
  noAccuracyGuarantee: true,
  contentMayBeOutdated: true,
  rightToChange: true,
  externalLinksDisclaimer: true,
  externalSitesOwnPolicies: true,
  userAssumesRisk: true,
  noLiabilityForDamages: true,
  recommendDoctor: false,
  recommendLawyer: false,
  recommendFinancialAdvisor: false,
  recommendAccountant: false,
  recommendMentalHealth: false,
  emergencyServicesNotice: false,
  notLicensedInJurisdiction: false,
  ftcDisclosure: true,
  noIncomeGuarantee: true,
  pastResultsNotTypical: true,
  testimonialsNotTypical: true,
  sponsoredContent: false,
  contactEmail: "",
  effectiveDate: new Date().toISOString().split("T")[0],
  policyTitle: "Disclaimer",
};

function formatDate(dateStr: string): string {
  if (!dateStr)
    return new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const d = new Date(dateStr + "T00:00:00");
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

const hasProfessionalSection = (a: DisclaimerAnswers) =>
  a.professionalAdvice ||
  a.medicalHealth ||
  a.financialInvestment ||
  a.legalAdvice;

export function generateDisclaimer(a: DisclaimerAnswers): string {
  const company = a.companyName || "We";
  const site = a.websiteUrl || "#";
  const email = a.contactEmail || "contact@yourcompany.com";
  const effectiveDateStr = formatDate(a.effectiveDate);

  const sections: string[] = [];
  let n = 0;
  const next = () => ++n;

  // ─── 1. Overview ─────────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Overview</h2>
  <p>The information provided by <strong>${company}</strong>${a.websiteUrl ? ` on <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a>` : ""} is for <strong>general informational purposes only</strong>. All information on this site is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>
  <p>By accessing or using this website, you acknowledge that you have read, understood, and agree to be bound by this Disclaimer.</p>
</section>`);

  // ─── 2. General Information Disclaimer ───────────────────────────────────
  if (a.generalInfo) {
    sections.push(`<section>
  <h2>${next()}. General Information Only</h2>
  <p>The content published on this website is intended for general informational and educational purposes only. It does not constitute advice of any kind and should not be relied upon as the basis for any decision or action. <strong>${company}</strong> accepts no responsibility for any loss or damage that may arise directly or indirectly from reliance on any information provided on this site.</p>
  <p>Nothing on this website creates or is intended to create any relationship — including without limitation a professional, advisory, or contractual relationship — between <strong>${company}</strong> and any reader or visitor.</p>
</section>`);
  }

  // ─── 3. Professional Advice Disclaimer ───────────────────────────────────
  if (hasProfessionalSection(a)) {
    const professionsToRecommend: string[] = [];
    if (a.recommendDoctor)
      professionsToRecommend.push("a qualified doctor or physician");
    if (a.recommendLawyer)
      professionsToRecommend.push("a qualified lawyer or solicitor");
    if (a.recommendFinancialAdvisor)
      professionsToRecommend.push("an authorised financial adviser");
    if (a.recommendAccountant)
      professionsToRecommend.push("a qualified accountant");
    if (a.recommendMentalHealth)
      professionsToRecommend.push("a licensed mental health professional");

    sections.push(`<section>
  <h2>${next()}. Not Professional Advice</h2>
  <p>The information on this website does <strong>not</strong> constitute — and is not intended as a substitute for — professional advice. You should not act or refrain from acting based solely on the content of this website without first seeking ${professionsToRecommend.length > 0 ? professionsToRecommend.join(", ") + ", or another relevant licensed professional appropriate to the subject matter (including, where applicable, a qualified engineer, safety specialist, or other technical expert)," : "appropriate qualified professional advice from a licensed professional appropriate to the subject matter"} who is familiar with your individual circumstances.</p>
  ${a.notLicensedInJurisdiction ? `<p><strong>${company}</strong> does not represent that the information on this site is appropriate for use in your jurisdiction. Professional licensing, regulations, and standards vary by country and region. Always verify that any advice or information you act on is applicable to your location.</p>` : ""}
</section>`);
  }

  // ─── 4. Medical / Health Disclaimer ──────────────────────────────────────
  if (a.medicalHealth) {
    sections.push(`<section>
  <h2>${next()}. Medical &amp; Health Disclaimer</h2>
  <p>The health and medical content on this website is provided for general informational purposes only and is <strong>not intended as medical advice</strong>. It does not replace professional medical diagnosis, treatment, or consultation with a qualified healthcare provider.</p>
  <p>Never disregard professional medical advice or delay seeking it because of something you have read on this website. Always consult your doctor or a qualified health professional before starting any new treatment, health programme, diet, or exercise regimen, or before making any changes to existing medication or treatment.</p>
  ${a.emergencyServicesNotice ? `<p><strong>In the event of a medical emergency, call your local emergency services immediately (e.g. 999 in the UK, 112 in the EU, or 911 in the US). Do not use this website as a substitute for emergency care.</strong></p>` : ""}
  <p><strong>${company}</strong> does not endorse, recommend, or make any representations about specific products, services, tests, doctors, procedures, opinions, or other information referenced on this website.</p>
</section>`);
  }

  // ─── 5. Financial / Investment Disclaimer ────────────────────────────────
  if (a.financialInvestment) {
    sections.push(`<section>
  <h2>${next()}. Financial &amp; Investment Disclaimer</h2>
  <p>The financial and investment content on this website is provided for general informational and educational purposes only. It does <strong>not</strong> constitute financial advice, investment advice, trading advice, or any other type of advice, and should not be treated as such.</p>
  <p><strong>${company}</strong> is not a registered investment adviser, broker-dealer, financial analyst, or financial planner. The information provided does not take into account your personal financial situation, objectives, risk tolerance, or investment experience. You should not make any financial or investment decisions based solely on the information provided here.</p>
  <p>All investments involve risk, including the potential loss of principal. Past performance is not indicative of future results. Always seek independent financial advice from a regulated financial adviser before making any investment decisions.</p>
</section>`);
  }

  // ─── 6. Legal Advice Disclaimer ──────────────────────────────────────────
  if (a.legalAdvice) {
    sections.push(`<section>
  <h2>${next()}. Legal Disclaimer</h2>
  <p>The legal content on this website is provided for general informational purposes only and does <strong>not</strong> constitute legal advice. Reading this website or any materials on it does not create a solicitor-client, attorney-client, or any other professional relationship between you and <strong>${company}</strong>.</p>
  <p>Laws vary significantly by jurisdiction and change frequently. The information on this site may not reflect the most current legal developments, and you should not rely on it as a substitute for advice from a qualified legal professional who is familiar with the laws applicable to your jurisdiction and specific situation.</p>
  <p>If you have a legal problem or question, please consult a qualified solicitor, barrister, attorney, or other licensed legal professional in your jurisdiction.</p>
</section>`);
  }

  // ─── 7. Accuracy & Completeness ──────────────────────────────────────────
  const accuracyPoints: string[] = [];
  if (a.noAccuracyGuarantee)
    accuracyPoints.push(
      "We do not warrant the accuracy, completeness, or suitability of any information published on this site for any particular purpose.",
    );
  if (a.contentMayBeOutdated)
    accuracyPoints.push(
      "Information on this website may become outdated. We do not undertake any obligation to update or revise the content on this site, and content should not be assumed to be current.",
    );
  if (a.rightToChange)
    accuracyPoints.push(
      "We reserve the right to add, amend, or remove any content on this website at any time without notice.",
    );

  if (accuracyPoints.length > 0) {
    sections.push(`<section>
  <h2>${next()}. Accuracy &amp; Completeness</h2>
  <ul>
    ${accuracyPoints.map((p) => `<li>${p}</li>`).join("")}
  </ul>
  <p>While we endeavour to keep information up to date and correct, we make no representations or warranties of any kind about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.</p>
</section>`);
  }

  // ─── 8. External Links ───────────────────────────────────────────────────
  if (a.externalLinksDisclaimer) {
    sections.push(`<section>
  <h2>${next()}. External Links</h2>
  <p>This website may contain links to external websites that are not operated by <strong>${company}</strong>. We have no control over the content, privacy practices, or availability of those sites, and we accept no responsibility or liability for them or for any loss or damage that may arise from your use of them.</p>
  ${a.externalSitesOwnPolicies ? `<p>External websites are governed by their own terms and privacy policies. We encourage you to review the terms of service and privacy policy of any third-party website you visit.</p>` : ""}
  <p>The inclusion of any link does not imply endorsement, approval, or control by <strong>${company}</strong> of the linked site or of any association with its operators.</p>
</section>`);
  }

  // ─── 9. Affiliate Links & FTC Disclosure ─────────────────────────────────
  if (a.affiliateLinks) {
    sections.push(`<section>
  <h2>${next()}. Affiliate Links &amp; FTC Disclosure</h2>
  ${
    a.ftcDisclosure
      ? `<p><strong>Disclosure:</strong> This website may contain affiliate links. This means that if you click on a link and make a purchase, <strong>${company}</strong> may receive a commission at no additional cost to you. This helps support the operation of this website.</p>
  <p>In accordance with the <em>Federal Trade Commission (FTC) guidelines</em> and UK Advertising Standards Authority (ASA) requirements, we disclose all material connections between this site and any products or services we recommend or review.</p>`
      : `<p>This website may contain affiliate links. If you click on an affiliate link and make a purchase, we may receive a commission.</p>`
  }
  ${a.sponsoredContent ? `<p><strong>Sponsored Content:</strong> Some posts or pages on this website may be sponsored or paid for by third parties. Sponsored content will be clearly identified where required by applicable law. Our editorial opinions remain our own and are not influenced by any sponsorship arrangement.</p>` : ""}
  <p>Our recommendations are based on our genuine assessment of the products and services we feature. We only recommend products and services we believe provide value to our readers.</p>
</section>`);
  }

  // ─── 10. Earnings & Results Disclaimer ───────────────────────────────────
  if (
    a.noIncomeGuarantee ||
    a.pastResultsNotTypical ||
    a.testimonialsNotTypical
  ) {
    const earningsPoints: string[] = [];
    if (a.noIncomeGuarantee)
      earningsPoints.push(
        "We make no guarantee of specific income, earnings, results, or financial outcomes. Any figures or projections referenced on this website are illustrative only.",
      );
    if (a.pastResultsNotTypical)
      earningsPoints.push(
        "Past results are <strong>not necessarily indicative of future results</strong>. Any results described on this website are not typical and individual outcomes will vary based on many factors outside our control.",
      );
    if (a.testimonialsNotTypical)
      earningsPoints.push(
        "Testimonials and case studies presented on this site represent individual experiences only and may not be typical. Individual results will vary and are not guaranteed.",
      );

    if (earningsPoints.length > 0) {
      sections.push(`<section>
  <h2>${next()}. Earnings &amp; Results Disclaimer</h2>
  <ul>
    ${earningsPoints.map((p) => `<li>${p}</li>`).join("")}
  </ul>
  <p>Any reference to income figures, earnings, or results achieved by individuals or businesses featured on this site are provided as examples only. They are not intended to represent or guarantee that you will achieve the same or similar results.</p>
</section>`);
    }
  }

  // ─── 11. AI-Generated Content Disclaimer ─────────────────────────────────
  if (a.aiContent) {
    sections.push(`<section>
  <h2>${next()}. AI-Generated Content</h2>
  <p>Some of the content on this website may be generated, assisted, or summarised using artificial intelligence (AI) tools. While we take reasonable steps to review and verify AI-generated content before publishing, AI systems can produce inaccurate, incomplete, or outdated information.</p>
  <p>AI-generated content is provided for informational purposes only and should not be treated as authoritative or relied upon without independent verification. <strong>${company}</strong> does not warrant the accuracy or reliability of any AI-generated content on this website.</p>
  <p>We encourage you to verify any AI-generated information against authoritative sources before acting on it.</p>
</section>`);
  }

  // ─── 12. Testimonials ────────────────────────────────────────────────────
  if (a.testimonials) {
    sections.push(`<section>
  <h2>${next()}. Testimonials</h2>
  <p>This website may feature testimonials, reviews, or endorsements from customers, clients, or third parties. These testimonials reflect the real-life experiences of individuals who have used our products or services; however, they represent individual results and experiences, which may vary.</p>
  <p>Testimonials are not claimed to represent typical results. The testimonials displayed on this site are verbatim or have been edited for length or clarity. <strong>${company}</strong> is not responsible for the opinions expressed in testimonials.</p>
</section>`);
  }

  // ─── 13. Limitation of Liability ─────────────────────────────────────────
  const liabilityPoints: string[] = [];
  if (a.userAssumesRisk)
    liabilityPoints.push(
      "Your use of this website and reliance on any information published on it is solely at your own risk.",
    );
  if (a.noLiabilityForDamages)
    liabilityPoints.push(
      `<strong>${company}</strong> shall not be liable for any direct, indirect, incidental, consequential, special, or exemplary damages arising out of or in connection with your access to, use of, or reliance on this website or its content, even if we have been advised of the possibility of such damages.`,
    );

  sections.push(`<section>
  <h2>${next()}. Limitation of Liability</h2>
  ${liabilityPoints.length > 0 ? `<ul>${liabilityPoints.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
  <p>To the fullest extent permitted by applicable law, <strong>${company}</strong> excludes all liability for any claims, losses, demands, or damages of any kind whatsoever with regard to any information, content, or services provided on this website, including but not limited to direct, indirect, incidental, or consequential loss or damage.</p>
  <p>Nothing in this Disclaimer limits or excludes our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for any other liability that cannot be lawfully limited or excluded.</p>
</section>`);

  // ─── 14. Changes to This Disclaimer ──────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Changes to This Disclaimer</h2>
  <p>We reserve the right to update or modify this Disclaimer at any time without prior notice. Any changes will take effect immediately upon posting to this page. We encourage you to review this Disclaimer periodically. Your continued use of this website following any changes constitutes your acceptance of the revised Disclaimer.</p>
  <p><strong>No waiver:</strong> Our failure to enforce any right or provision of this Disclaimer will not be considered a waiver of those rights. Any waiver of any provision of this Disclaimer will only be effective if made in writing and signed by an authorised representative of <strong>${company}</strong>.</p>
  <p>This Disclaimer was last updated on <strong>${effectiveDateStr}</strong>.</p>
</section>`);

  // ─── 15. Governing Law ───────────────────────────────────────────────────
  const jurisdictionMap: Record<string, { law: string; courts: string }> = {
    "England and Wales": {
      law: "England and Wales",
      courts: "England and Wales",
    },
    Scotland: { law: "Scotland", courts: "Scotland" },
    "United Kingdom": { law: "England and Wales", courts: "England and Wales" },
    "United States": {
      law: "the United States of America",
      courts: "the United States",
    },
    Canada: { law: "Canada", courts: "Canada" },
    Australia: { law: "Australia", courts: "Australia" },
    Germany: { law: "Germany", courts: "Germany" },
    France: { law: "France", courts: "France" },
    Netherlands: { law: "the Netherlands", courts: "the Netherlands" },
    Singapore: { law: "Singapore", courts: "Singapore" },
    India: { law: "India", courts: "India" },
  };
  const jurisdiction = jurisdictionMap[a.country] ?? {
    law: a.country || "England and Wales",
    courts: a.country || "England and Wales",
  };

  sections.push(`<section>
  <h2>${next()}. Governing Law</h2>
  <p>This Disclaimer and any dispute or claim arising out of or in connection with it (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of <strong>${jurisdiction.law}</strong>.</p>
  <p>You irrevocably agree that the courts of <strong>${jurisdiction.courts}</strong> shall have exclusive jurisdiction to settle any dispute or claim that arises out of or in connection with this Disclaimer or its subject matter or formation.</p>
  <p>Our failure to enforce any right or provision of this Disclaimer will not be considered a waiver of those rights. If any provision of this Disclaimer is held to be invalid or unenforceable by a court, the remaining provisions will continue in full force and effect.</p>
</section>`);

  // ─── 16. Contact Us ───────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Contact Us</h2>
  <p>If you have any questions about this Disclaimer, please contact us:</p>
  <ul>
    ${a.companyName ? `<li><strong>Company:</strong> ${a.companyName}</li>` : ""}
    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
    ${a.websiteUrl ? `<li><strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a></li>` : ""}
  </ul>
</section>`);

  return `
<h1>${a.policyTitle || "Disclaimer"}</h1>
<p class="policy-meta">Last updated: ${effectiveDateStr}</p>

${sections.join("\n\n")}
`.trim();
}
