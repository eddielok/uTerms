import { escapeHtml, safeUrl } from './html';

export interface EULAAnswers {
  // Step 1: App & Publisher Info
  appName: string;
  companyName: string;
  appVersion: string;
  websiteUrl: string;
  platforms: string[];
  country: string;

  // Step 2: Licence Grant
  licenseType: 'personal' | 'commercial' | 'both';
  isNonExclusive: boolean;
  isNonTransferable: boolean;
  allowsMultipleDevices: boolean;
  numberOfDevices: string;
  allowsFamilySharing: boolean;

  // Step 3: Restrictions
  prohibitsReverseEngineering: boolean;
  prohibitsDecompilation: boolean;
  prohibitsRedistribution: boolean;
  prohibitsRenting: boolean;
  prohibitsModification: boolean;
  customRestrictions: string[];

  // Step 4: IP & Third-Party Components
  hasThirdPartyComponents: boolean;
  thirdPartyComponentsDescription: string;
  hasInAppPurchases: boolean;
  hasUserGeneratedContent: boolean;

  // Step 5: Updates, Support & Privacy
  providesUpdates: boolean;
  updatesAreAutomatic: boolean;
  providesSupport: boolean;
  supportEmail: string;
  collectsData: boolean;
  privacyPolicyUrl: string;

  // Step 6: Termination & Liability
  terminationForBreach: boolean;
  userCanTerminate: boolean;
  disclaimsWarranties: boolean;
  limitationOfLiability: boolean;
  liabilityCap: string;
  requiresIndemnification: boolean;

  // Step 7: Governing Law & Generate
  governingLaw: string;
  disputeResolution: 'courts' | 'arbitration' | 'negotiation';
  contactEmail: string;
  effectiveDate: string;
}

export const DEFAULT_EULA_ANSWERS: EULAAnswers = {
  appName: '',
  companyName: '',
  appVersion: '',
  websiteUrl: '',
  platforms: ['Windows', 'macOS'],
  country: 'England and Wales',
  licenseType: 'personal',
  isNonExclusive: true,
  isNonTransferable: true,
  allowsMultipleDevices: false,
  numberOfDevices: '1',
  allowsFamilySharing: false,
  prohibitsReverseEngineering: true,
  prohibitsDecompilation: true,
  prohibitsRedistribution: true,
  prohibitsRenting: true,
  prohibitsModification: true,
  customRestrictions: [],
  hasThirdPartyComponents: false,
  thirdPartyComponentsDescription: '',
  hasInAppPurchases: false,
  hasUserGeneratedContent: false,
  providesUpdates: true,
  updatesAreAutomatic: false,
  providesSupport: true,
  supportEmail: '',
  collectsData: false,
  privacyPolicyUrl: '',
  terminationForBreach: true,
  userCanTerminate: true,
  disclaimsWarranties: true,
  limitationOfLiability: true,
  liabilityCap: 'the amount paid for the Software in the twelve months preceding the claim',
  requiresIndemnification: false,
  governingLaw: 'England and Wales',
  disputeResolution: 'courts',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
};

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function generateEULA(a: EULAAnswers): string {
  const app = escapeHtml(a.appName) || 'the Software';
  const company = escapeHtml(a.companyName) || 'the Licensor';
  const site = safeUrl(a.websiteUrl);
  const websiteDisplay = escapeHtml(a.websiteUrl) || 'our website';
  const email = escapeHtml(a.contactEmail || a.supportEmail) || 'legal@yourcompany.com';
  const jurisdiction = escapeHtml(a.governingLaw || a.country) || 'England and Wales';
  const effectiveDateStr = formatDate(a.effectiveDate);
  const platformList = a.platforms.length > 0 ? a.platforms.map(escapeHtml).join(', ') : 'the supported platform(s)';
  const liabilityCap = escapeHtml(a.liabilityCap);
  const appVersion = escapeHtml(a.appVersion);

  const licenceTypeText =
    a.licenseType === 'commercial'
      ? 'commercial'
      : a.licenseType === 'both'
      ? 'personal and commercial'
      : 'personal, non-commercial';

  const deviceText = a.allowsMultipleDevices
    ? 'an unlimited number of devices that you own or control'
    : `up to <strong>${escapeHtml(a.numberOfDevices) || '1'}</strong> device${parseInt(a.numberOfDevices || '1') !== 1 ? 's' : ''} that you own or control`;

  const disputeText =
    a.disputeResolution === 'arbitration'
      ? `Any dispute arising out of or in connection with this Agreement shall be referred to and finally resolved by binding arbitration conducted in ${jurisdiction}.`
      : a.disputeResolution === 'negotiation'
      ? `Before initiating any formal proceedings, both parties agree to attempt to resolve any dispute through good-faith informal negotiation for at least 30 days after written notice of the dispute.`
      : `Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts of ${jurisdiction}.`;

  // Build restrictions list
  const restrictions: string[] = [];
  if (a.prohibitsReverseEngineering) restrictions.push('Reverse engineer, disassemble, or attempt to derive the source code of the Software');
  if (a.prohibitsDecompilation) restrictions.push('Decompile or translate the Software into human-readable form');
  if (a.prohibitsRedistribution) restrictions.push('Copy, reproduce, distribute, publish, or sublicense the Software or any part thereof to any third party');
  if (a.prohibitsRenting) restrictions.push('Rent, lease, lend, or otherwise transfer the Software or any rights in it to any third party for compensation');
  if (a.prohibitsModification) restrictions.push('Modify, adapt, translate, or create derivative works based upon the Software');
  restrictions.push('Remove, alter, or obscure any proprietary notices, labels, or marks on the Software');
  restrictions.push('Use the Software in any way that violates applicable local, national, or international law or regulation');
  if (a.customRestrictions.length > 0) restrictions.push(...a.customRestrictions);

  // Section counter
  const sections: string[] = [];
  let n = 0;
  const next = () => ++n;

  // ─── 1. Grant of Licence ───────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Grant of Licence</h2>
  <p>Subject to the terms and conditions of this End User License Agreement (&ldquo;Agreement&rdquo;), <strong>${company}</strong> (&ldquo;Licensor&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) grants you (&ldquo;Licensee&rdquo; or &ldquo;you&rdquo;) a limited${a.isNonExclusive ? ', non-exclusive' : ''}${a.isNonTransferable ? ', non-transferable' : ''}, revocable licence to install and use <strong>${app}</strong>${appVersion ? ` (version ${appVersion})` : ''} (the &ldquo;Software&rdquo;) on ${deviceText} for your ${licenceTypeText} purposes on the following platform(s): <strong>${platformList}</strong>.</p>
  ${a.allowsFamilySharing ? `<p><strong>Family Sharing:</strong> Where permitted by the applicable platform (e.g. Apple Family Sharing or Google Play Family Library), members of your immediate family household may also use the Software under this licence, provided they are bound by the terms of this Agreement.</p>` : ''}
  <p>This licence does not constitute a sale of the Software or any copy thereof. <strong>${company}</strong> retains all ownership of and title to the Software.</p>
</section>`);

  // ─── 2. Restrictions ──────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Restrictions</h2>
  <p>You agree that you will not, and will not permit or authorise any third party to:</p>
  <ul>
    ${restrictions.map(r => `<li>${r}</li>`).join('')}
  </ul>
  <p>Any attempt to do any of the above is a material breach of this Agreement and will result in immediate termination of your licence.</p>
</section>`);

  // ─── 3. Intellectual Property ─────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Intellectual Property</h2>
  <p>The Software, including all copies thereof, and all intellectual property rights subsisting therein (including but not limited to copyright, patents, trade marks, design rights, and trade secrets) are and shall remain the sole and exclusive property of <strong>${company}</strong> and its licensors. This Agreement does not convey to you any interest in or to the Software, but only a limited right of use as set out herein. All rights not expressly granted are reserved by <strong>${company}</strong>.</p>
  ${a.hasThirdPartyComponents ? `<p><strong>Third-Party Components:</strong> The Software incorporates or is distributed with certain third-party open-source or licensed components. ${a.thirdPartyComponentsDescription ? escapeHtml(a.thirdPartyComponentsDescription) : 'These components are subject to their own licence terms, which are provided with the Software or available upon request.'} Your use of such components is governed by the applicable third-party licence terms.</p>` : ''}
</section>`);

  // ─── 4. In-App Purchases (conditional) ────────────────────────────────────
  if (a.hasInAppPurchases) {
    sections.push(`<section>
  <h2>${next()}. In-App Purchases</h2>
  <p>The Software may offer additional features, content, or services available for purchase within the application (&ldquo;In-App Purchases&rdquo;). All In-App Purchases are final and non-refundable except where required by applicable law.</p>
  <p>In-App Purchases are processed through the applicable platform store (e.g. Apple App Store, Google Play Store). Payment, billing, and refund policies for In-App Purchases are governed by the platform store&rsquo;s terms of service. We have no control over, and are not responsible for, the platform store&rsquo;s payment processing or refund decisions.</p>
</section>`);
  }

  // ─── 5. Updates & Support (conditional) ───────────────────────────────────
  if (a.providesUpdates || a.providesSupport) {
    const supportEmailAddr = escapeHtml(a.supportEmail) || email;
    sections.push(`<section>
  <h2>${next()}. Updates &amp; Support</h2>
  ${a.providesUpdates ? `<p><strong>Updates:</strong> <strong>${company}</strong> may, at its sole discretion, provide updates, patches, bug fixes, or new versions of the Software from time to time. ${a.updatesAreAutomatic ? 'Updates may be installed automatically without additional notice. ' : ''}Updates may add, modify, or remove features and functionality. Continued use of the Software following an update constitutes acceptance of the updated Software. We are under no obligation to provide any updates.</p>` : ''}
  ${a.providesSupport ? `<p><strong>Support:</strong> <strong>${company}</strong> will use reasonable efforts to provide technical support for the Software. Support requests may be submitted to <a href="mailto:${supportEmailAddr}">${supportEmailAddr}</a>. We do not guarantee response times and may modify or discontinue support at any time.</p>` : ''}
</section>`);
  }

  // ─── 6. Privacy & Data Collection (conditional) ───────────────────────────
  if (a.collectsData) {
    const privacyUrl = safeUrl(a.privacyPolicyUrl) || (site !== '#' ? `${site}/privacy-policy` : null);
    sections.push(`<section>
  <h2>${next()}. Privacy &amp; Data Collection</h2>
  <p>The Software may collect and process certain information about you and your use of the Software in order to operate, maintain, and improve its functionality. By installing and using the Software, you consent to such collection and processing in accordance with our Privacy Policy${privacyUrl ? `, available at <a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">${privacyUrl}</a>` : ''}.</p>
  <p>We handle all personal data in accordance with applicable data protection legislation, including the UK GDPR, the Data Protection Act 2018, and (where applicable) the EU General Data Protection Regulation.</p>
</section>`);
  }

  // ─── 7. User-Generated Content (conditional) ──────────────────────────────
  if (a.hasUserGeneratedContent) {
    sections.push(`<section>
  <h2>${next()}. User-Generated Content</h2>
  <p>The Software may permit you to create, submit, or share content (&ldquo;User Content&rdquo;). You retain ownership of any intellectual property rights you hold in your User Content. By submitting User Content, you grant <strong>${company}</strong> a worldwide, non-exclusive, royalty-free licence to use, reproduce, and display your User Content solely for the purpose of operating the Software.</p>
  <p>You represent and warrant that your User Content does not infringe any third-party rights, is not unlawful, defamatory, or otherwise objectionable, and that you have all necessary rights to grant the licence above. We reserve the right to remove any User Content at our discretion.</p>
</section>`);
  }

  // ─── 8. Termination ───────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Termination</h2>
  ${a.terminationForBreach ? `<p><strong>Termination for Breach:</strong> This Agreement and the licence granted herein shall terminate automatically and without notice if you breach any term of this Agreement. Upon termination, you must immediately cease all use of the Software and permanently delete or destroy all copies of the Software in your possession or control.</p>` : ''}
  ${a.userCanTerminate ? `<p><strong>Termination by You:</strong> You may terminate this Agreement at any time by permanently uninstalling and deleting all copies of the Software from your devices.</p>` : ''}
  <p><strong>${company}</strong> reserves the right to terminate or suspend this licence at any time if required by law, or if we discontinue the Software. We will use reasonable efforts to notify you of such termination where practicable.</p>
  <p><strong>Effect of Termination:</strong> Upon termination for any reason, all rights granted to you under this Agreement shall immediately cease. The following provisions shall survive termination: Intellectual Property, Disclaimer of Warranties, Limitation of Liability, and Governing Law.</p>
</section>`);

  // ─── 9. Disclaimer of Warranties (conditional) ────────────────────────────
  if (a.disclaimsWarranties) {
    sections.push(`<section>
  <h2>${next()}. Disclaimer of Warranties</h2>
  <p>THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, <strong>${company.toUpperCase()}</strong> EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, TITLE, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.</p>
  <p><strong>${company}</strong> does not warrant that the Software will be uninterrupted, error-free, free of viruses or other harmful components, or that defects will be corrected. You assume all risk associated with the installation and use of the Software.</p>
  <p>The Software is a technology tool for connectivity and data display. <strong>${company}</strong> is not a financial adviser or regulated financial institution. Output produced by the Software should not be used as the sole basis for any financial, investment, or related decision.</p>
  <p>Some jurisdictions do not allow the exclusion of implied warranties. If you are a consumer resident in such a jurisdiction, certain statutory rights may apply that cannot be excluded by this Agreement.</p>
</section>`);
  }

  // ─── 10. Limitation of Liability (conditional) ────────────────────────────
  if (a.limitationOfLiability) {
    sections.push(`<section>
  <h2>${next()}. Limitation of Liability</h2>
  <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL <strong>${company.toUpperCase()}</strong>, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, LOSS OF GOODWILL, BUSINESS INTERRUPTION, OR COST OF SUBSTITUTE GOODS OR SERVICES, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT OR THE USE OF OR INABILITY TO USE THE SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
  ${liabilityCap ? `<p>In any event, the total aggregate liability of <strong>${company}</strong> to you under or in connection with this Agreement shall not exceed <strong>${liabilityCap}</strong>.</p>` : ''}
  <p>The limitations above shall apply whether the claim is based in contract, tort (including negligence), strict liability, or any other theory, and shall apply even if any limited remedy set forth herein has failed of its essential purpose. Some jurisdictions do not allow the limitation of liability for certain types of damages, in which case the above limitation shall apply to the maximum extent permitted by law.</p>
</section>`);
  }

  // ─── 11. Indemnification (conditional) ────────────────────────────────────
  if (a.requiresIndemnification) {
    sections.push(`<section>
  <h2>${next()}. Indemnification</h2>
  <p>You agree to indemnify, defend, and hold harmless <strong>${company}</strong> and its officers, directors, employees, agents, and licensors from and against any claims, actions, liabilities, losses, damages, costs, and expenses (including reasonable legal fees) arising out of or related to: (i) your use or misuse of the Software; (ii) your breach of this Agreement; (iii) your violation of any applicable law or regulation; or (iv) any User Content you submit through the Software.</p>
</section>`);
  }

  // ─── Governing Law ────────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Governing Law &amp; Dispute Resolution</h2>
  <p>This Agreement shall be governed by and construed in accordance with the laws of <strong>${jurisdiction}</strong>, without regard to its conflict of law provisions.</p>
  <p>${disputeText}</p>
</section>`);

  // ─── Changes ──────────────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Changes to This Agreement</h2>
  <p>We reserve the right to modify this Agreement at any time. When we make material changes, we will update the &ldquo;Last updated&rdquo; date and, where reasonably practicable, notify you via the Software or by email. Your continued use of the Software after such changes constitutes your acceptance of the revised Agreement.</p>
  <p>If you do not agree to the revised terms, you must discontinue use of and uninstall the Software.</p>
</section>`);

  // ─── Export Compliance ────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Export Compliance</h2>
  <p>The Software may be subject to export control laws and regulations of the United States, the United Kingdom, and other jurisdictions. You represent and warrant that:</p>
  <ul>
    <li>You are not located in, or a national or resident of, any country that is subject to a U.S. or UK Government embargo or that has been designated by either government as a &ldquo;terrorist supporting&rdquo; country; and</li>
    <li>You are not listed on any U.S. or UK Government list of prohibited or restricted parties, including without limitation the U.S. Treasury Department&rsquo;s list of Specially Designated Nationals or the U.S. Department of Commerce Denied Persons List.</li>
  </ul>
  <p>You agree to comply with all applicable export and re-export control laws and regulations. You will not use the Software for any purpose prohibited by such laws.</p>
</section>`);

  // ─── Contact ──────────────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Contact Information</h2>
  <p>If you have any questions about this Agreement, please contact us:</p>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
    ${a.companyName ? `<li><strong>Company:</strong> ${company}</li>` : ''}
    ${a.websiteUrl ? `<li><strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${websiteDisplay}</a></li>` : ''}
  </ul>
</section>`);

  return `
<h1>End User License Agreement</h1>
<p class="policy-meta">Last updated: ${effectiveDateStr}</p>

${sections.join('\n\n')}
`.trim();
}
