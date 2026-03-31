export interface ToSAnswers {
  // Step 1: Business Info
  companyName: string;
  websiteUrl: string;
  businessType: string;
  country: string;

  // Step 2: Services & User Accounts
  serviceDescription: string;
  hasThirdPartyFinancialData: boolean;
  requiresAccount: boolean;
  minimumAge: string;
  canTerminateAccounts: boolean;

  // Step 3: Payments & Subscriptions
  isPaid: boolean;
  isSubscription: boolean;
  hasRefundPolicy: boolean;
  refundPeriod: string;
  hasAutoRenewal: boolean;
  cancellationAccess: 'end-of-period' | 'immediate';
  cancellationNoticeDays: string;

  // Step 4: User-Generated Content
  allowsUGC: boolean;
  dmcaCompliant: boolean;
  ugcLicenceGrant: boolean;

  // Step 5: Intellectual Property
  usersOwnContent: boolean;
  prohibitedUses: string[];
  hasThirdPartyIntegrations: boolean;

  // Step 6: Liability & Disclaimers
  limitationOfLiability: boolean;
  liabilityCap: string;
  disclaimsWarranties: boolean;
  requiresIndemnification: boolean;

  // Step 7: Governing Law & Generate
  governingLaw: string;
  disputeResolution: string;
  contactEmail: string;
  effectiveDate: string;
}

export const DEFAULT_TOS_ANSWERS: ToSAnswers = {
  companyName: '',
  websiteUrl: '',
  businessType: 'saas',
  country: 'England and Wales',
  serviceDescription: '',
  hasThirdPartyFinancialData: false,
  requiresAccount: false,
  minimumAge: '13',
  canTerminateAccounts: true,
  isPaid: false,
  isSubscription: false,
  hasRefundPolicy: false,
  refundPeriod: '14 days',
  hasAutoRenewal: false,
  cancellationAccess: 'end-of-period',
  cancellationNoticeDays: '',
  allowsUGC: false,
  dmcaCompliant: false,
  ugcLicenceGrant: false,
  usersOwnContent: true,
  prohibitedUses: [],
  hasThirdPartyIntegrations: false,
  limitationOfLiability: true,
  liabilityCap: 'fees paid in the last 12 months',
  disclaimsWarranties: true,
  requiresIndemnification: true,
  governingLaw: 'England and Wales',
  disputeResolution: 'courts',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  saas: 'software-as-a-service (SaaS) platform',
  ecommerce: 'e-commerce store',
  marketplace: 'online marketplace',
  blog: 'content website',
  app: 'mobile or web application',
  other: 'online service',
};

const DEFAULT_PROHIBITED_USES = [
  'Use the service for any unlawful purpose or in violation of these Terms',
  'Attempt to gain unauthorized access to any part of the service or its related systems',
  'Transmit any viruses, malware, or other harmful or disruptive code',
  'Harass, abuse, threaten, or harm any other user or third party',
  'Scrape, crawl, or otherwise extract data from the service without our written consent',
  'Resell, sublicense, or otherwise commercialize the service without our written consent',
  'Take any action that imposes an unreasonable or disproportionately large load on our infrastructure, servers, or network resources',
];

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function generateTermsOfService(a: ToSAnswers): string {
  const company = a.companyName || 'the Company';
  const site = a.websiteUrl || '#';
  const serviceType = BUSINESS_TYPE_LABELS[a.businessType] || 'online service';
  const effectiveDateStr = formatDate(a.effectiveDate);
  const email = a.contactEmail || 'legal@yourcompany.com';
  const jurisdiction = a.governingLaw || a.country || 'England and Wales';

  const prohibitedList = a.prohibitedUses.length > 0
    ? a.prohibitedUses
    : DEFAULT_PROHIBITED_USES;

  const baseOffset = [a.isPaid, a.allowsUGC].filter(Boolean).length;
  const tpiOffset = a.hasThirdPartyIntegrations ? 1 : 0;

  const disputeText =
    a.disputeResolution === 'arbitration'
      ? `Any dispute arising out of or in connection with these Terms shall be referred to and finally resolved by binding arbitration. The arbitration shall be conducted in ${jurisdiction}.`
      : a.disputeResolution === 'negotiation'
      ? `Before initiating any formal proceedings, both parties agree to attempt to resolve any dispute through good-faith informal negotiation for at least 30 days after written notice of the dispute.`
      : `Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of ${jurisdiction}.`;

  return `
<h1>Terms of Service</h1>
<p class="policy-meta">Last updated: ${effectiveDateStr}</p>

<section>
  <h2>1. Acceptance of Terms</h2>
  <p>These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and <strong>${company}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your access to and use of <a href="${site}" target="_blank" rel="noopener noreferrer">${site}</a> and our ${serviceType} (collectively, the &ldquo;Service&rdquo;).</p>
  <p>By accessing or using the Service, you confirm that you have read, understood, and agree to be bound by these Terms and our <a href="${site}/privacy-policy">Privacy Policy</a>. If you do not agree, you must not access or use the Service.</p>
  <p>If you have entered into a separate written agreement with <strong>${company}</strong> for the Service, that agreement shall supersede these Terms in the event of a conflict.</p>
  ${a.minimumAge ? `<p>You must be at least <strong>${a.minimumAge} years old</strong> to use the Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.</p>` : ''}
</section>

<section>
  <h2>2. Description of Services</h2>
  <p><strong>${company}</strong> provides a ${serviceType}${a.serviceDescription ? `: ${a.serviceDescription}` : '.'}</p>
  <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.</p>
  ${a.hasThirdPartyFinancialData ? `<p><strong>Third-Party Financial Data Disclaimer:</strong> The Service is for informational and connectivity purposes only. <strong>${company}</strong> is not a financial adviser, broker, or regulated financial institution. We do not guarantee the accuracy, completeness, timeliness, or fitness for any particular purpose of any third-party financial data integrated through our platform. Any financial information displayed through the Service is provided by independent third parties and may not reflect current market conditions. You should not rely on such information as the sole basis for any investment, financial, legal, or other decisions. We expressly disclaim all liability for any loss or damage arising from your reliance on third-party financial data.</p>` : ''}
</section>

<section>
  <h2>3. User Accounts${a.requiresAccount ? '' : ' & Access'}</h2>
  ${a.requiresAccount ? `
  <p>To access certain features of the Service, you must register for an account. When registering, you agree to:</p>
  <ul>
    <li>Provide accurate, current, and complete information</li>
    <li>Maintain and promptly update your account information</li>
    <li>Keep your password secure and confidential</li>
    <li>Accept responsibility for all activity that occurs under your account</li>
    <li>Notify us immediately of any unauthorized use of your account</li>
  </ul>
  <p>You may not share your account credentials or allow others to access the Service through your account.</p>
  ` : `<p>Access to the Service does not require registration. However, certain features may require you to provide contact information or agree to additional terms.</p>`}
  ${a.canTerminateAccounts ? `
  <p><strong>Account Termination:</strong> We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms, is harmful to other users, us, third parties, or for any other reason. You may also delete your account at any time by contacting us at <a href="mailto:${email}">${email}</a>.</p>
  ` : ''}
</section>

${a.isPaid ? `
<section>
  <h2>4. Payments${a.isSubscription ? ', Subscriptions' : ''} &amp; Billing</h2>
  <p>Certain features of the Service require payment. By providing payment information, you authorize us to charge the applicable fees to your payment method.</p>
  ${a.isSubscription ? `
  <p><strong>Subscriptions:</strong> Some features are billed on a recurring basis (&ldquo;Subscription&rdquo;). Your Subscription will automatically renew at the end of each billing period unless you cancel before the renewal date${a.cancellationNoticeDays ? ` by giving at least <strong>${a.cancellationNoticeDays} days&rsquo; notice</strong> prior to renewal` : ''}.</p>
  ${a.hasAutoRenewal ? `<p><strong>Auto-Renewal:</strong> Subscriptions renew automatically at the end of each billing period. We will notify you of any price changes before they take effect.</p>` : ''}
  <p><strong>Cancellation:</strong> You may cancel your Subscription at any time${a.cancellationNoticeDays ? ` provided you give at least <strong>${a.cancellationNoticeDays} days&rsquo; written notice</strong> before your next renewal date` : ''}. ${a.cancellationAccess === 'end-of-period' ? `Upon cancellation, your access to paid features will continue until the end of your current billing period. You will not receive a refund for any unused portion of your Subscription, except where required by applicable law.` : `Cancellation takes effect immediately. Your access to paid features will end at the point of cancellation and no refund will be issued for any remaining time in the billing period, except where required by applicable law.`}</p>
  ` : ''}
  ${a.hasRefundPolicy ? `<p><strong>Refunds:</strong> You may request a refund within <strong>${a.refundPeriod}</strong> of your purchase by contacting us at <a href="mailto:${email}">${email}</a>. Refunds are issued at our discretion and may be subject to conditions. Subscription fees are generally non-refundable except where required by applicable law.</p>` : '<p><strong>Refunds:</strong> All purchases are final and non-refundable except where required by applicable law.</p>'}
  <p>All prices are exclusive of applicable taxes unless stated otherwise. You are responsible for all taxes associated with your use of the Service.</p>
</section>
` : ''}

${a.allowsUGC ? `
<section>
  <h2>${a.isPaid ? '5' : '4'}. User-Generated Content</h2>
  <p>The Service may allow you to post, upload, submit, or otherwise make available content, including text, images, and other materials (&ldquo;User Content&rdquo;). You retain ownership of any intellectual property rights you hold in your User Content.</p>
  ${a.ugcLicenceGrant ? `<p><strong>Licence to Us:</strong> By submitting User Content, you grant <strong>${company}</strong> a worldwide, non-exclusive, royalty-free, sublicensable licence to use, reproduce, modify, distribute, and display your User Content solely for the purpose of operating and improving the Service.</p>` : ''}
  <p>You represent and warrant that your User Content does not violate any third-party rights (including intellectual property and privacy rights), is not unlawful, defamatory, obscene, or otherwise objectionable, and that you have all rights necessary to grant the licences above.</p>
  <p>We reserve the right to remove any User Content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable.</p>
  ${a.dmcaCompliant ? `
  <p><strong>DMCA / Copyright Takedown:</strong> We respect the intellectual property rights of others. If you believe that content on the Service infringes your copyright, please send a written notice to <a href="mailto:${email}">${email}</a> with the following information: (i) identification of the copyrighted work claimed to have been infringed; (ii) identification of the material that is claimed to be infringing and its location; (iii) your contact information; (iv) a statement that you have a good faith belief that use of the material is not authorized; and (v) a statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.</p>
  ` : ''}
</section>
` : ''}

<section>
  <h2>${baseOffset + 4}. Intellectual Property</h2>
  <p>The Service and its original content (excluding User Content), features, functionality, trademarks, logos, and trade dress are and will remain the exclusive property of <strong>${company}</strong> and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
  ${a.usersOwnContent
    ? '<p>You retain all rights to content you create and submit through the Service, subject to any licence you grant us as described above.</p>'
    : `<p>Content created using the Service may be subject to our intellectual property rights. Please review the specific terms applicable to each feature for details.</p>`}
  <p>You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Service strictly in accordance with these Terms. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any part of the Service without our prior written consent.</p>
</section>

<section>
  <h2>${baseOffset + 5}. Prohibited Uses</h2>
  <p>You agree not to use the Service to:</p>
  <ul>
    ${prohibitedList.map(u => `<li>${u}</li>`).join('')}
  </ul>
</section>

${a.hasThirdPartyIntegrations ? `
<section>
  <h2>${baseOffset + 6}. Third-Party Services &amp; Links</h2>
  <p>The Service may integrate with or link to third-party websites, APIs, or services (e.g. banking institutions or financial data providers). We do not control, endorse, or assume responsibility for any third-party services, their availability, content, accuracy, or practices.</p>
  <p>Your interactions with third-party services are governed solely by their own terms of service and privacy policies. We encourage you to review those policies before engaging with any third party. <strong>${company}</strong> is not a party to, and has no responsibility for, any transactions or agreements you enter into with third parties.</p>
  <p>You acknowledge that <strong>${company}</strong> is not liable for any failures, outages, errors, or damages caused by third-party providers, including but not limited to data inaccuracies, service interruptions, or security incidents originating from those third parties.</p>
</section>
` : ''}

${a.disclaimsWarranties ? `
<section>
  <h2>${baseOffset + 6 + tpiOffset}. Disclaimer of Warranties</h2>
  <p>THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
  <p>We do not warrant that the results obtained from use of the Service will be accurate, reliable, or meet your requirements. Any reliance on the Service is at your own risk.</p>
  ${a.hasThirdPartyFinancialData ? `<p><strong>${company}</strong> is a technology provider only and does not provide financial, investment, legal, or regulatory advice. Any financial data, calculations, or results obtained through the Service are for informational purposes only and do not constitute a recommendation or solicitation to buy, sell, or hold any financial instrument. We do not warrant the accuracy, completeness, or timeliness of any financial data sourced from third-party providers, and such data may not reflect current market conditions. You should seek independent professional advice before making any financial or investment decision.</p>` : ''}
</section>
` : ''}

${a.limitationOfLiability ? `
<section>
  <h2>${baseOffset + (a.disclaimsWarranties ? 7 : 6) + tpiOffset}. Limitation of Liability</h2>
  <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL <strong>${company.toUpperCase()}</strong>, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE.</p>
  ${a.liabilityCap ? `<p>In any event, our total cumulative liability to you for all claims arising from or related to the Service shall not exceed <strong>${a.liabilityCap}</strong>.</p>` : ''}
  <p>Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities. In such jurisdictions, our liability is limited to the greatest extent permitted by law.</p>
</section>
` : ''}

${a.requiresIndemnification ? `
<section>
  <h2>${baseOffset + (a.disclaimsWarranties ? 1 : 0) + (a.limitationOfLiability ? 1 : 0) + 6 + tpiOffset}. Indemnification</h2>
  <p>You agree to indemnify, defend, and hold harmless <strong>${company}</strong> and its officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising out of or in any way connected with: (i) your access to or use of the Service; (ii) your violation of these Terms; (iii) your violation of any third-party rights, including intellectual property or privacy rights; or (iv) any User Content you submit to the Service.</p>
</section>
` : ''}

<section>
  <h2>${baseOffset + (a.disclaimsWarranties ? 1 : 0) + (a.limitationOfLiability ? 1 : 0) + (a.requiresIndemnification ? 1 : 0) + 6 + tpiOffset}. Governing Law &amp; Dispute Resolution</h2>
  <p>These Terms are governed by and construed in accordance with the laws of <strong>${jurisdiction}</strong>, without regard to its conflict of law provisions.</p>
  <p>${disputeText}</p>
</section>

<section>
  <h2>${baseOffset + (a.disclaimsWarranties ? 1 : 0) + (a.limitationOfLiability ? 1 : 0) + (a.requiresIndemnification ? 1 : 0) + 7 + tpiOffset}. Changes to These Terms</h2>
  <p>We reserve the right to modify these Terms at any time. When we make material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page and, where appropriate, notify you by email or through the Service. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.</p>
  <p>We encourage you to review these Terms periodically. If you do not agree to the revised Terms, you must stop using the Service.</p>
</section>

<section>
  <h2>${baseOffset + (a.disclaimsWarranties ? 1 : 0) + (a.limitationOfLiability ? 1 : 0) + (a.requiresIndemnification ? 1 : 0) + 8 + tpiOffset}. Contact Us</h2>
  <p>If you have any questions about these Terms, please contact us:</p>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
    ${a.companyName ? `<li><strong>Company:</strong> ${a.companyName}</li>` : ''}
    ${a.websiteUrl ? `<li><strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a></li>` : ''}
  </ul>
</section>
`.trim();
}
