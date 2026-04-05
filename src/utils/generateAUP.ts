export interface AUPAnswers {
  // Step 1: Business Info
  companyName: string;
  websiteUrl: string;
  platformType: string;
  country: string;

  // Step 2: Platform & Users
  requiresAccount: boolean;
  minimumAge: string;
  userTypes: string[];
  handlesSensitiveData: boolean;

  // Step 3: Prohibited Activities
  prohibitedActivities: string[];

  // Step 4: Content Standards
  allowsUGC: boolean;
  prohibitedContent: string[];
  dmcaCompliant: boolean;

  // Step 5: Enforcement & Consequences
  canSuspend: boolean;
  immediateTermination: boolean;
  hasAppealProcess: boolean;
  cooperatesWithLawEnforcement: boolean;
  dataRetentionAfterTermination: boolean;

  // Step 6: Legal & Generate
  governingLaw: string;
  disputeResolution: 'courts' | 'arbitration' | 'negotiation';
  contactEmail: string;
  effectiveDate: string;
  policyTitle: string;
}

export const DEFAULT_AUP_ANSWERS: AUPAnswers = {
  companyName: '',
  websiteUrl: '',
  platformType: 'saas',
  country: 'England and Wales',
  requiresAccount: true,
  minimumAge: '13',
  userTypes: ['registered members'],
  handlesSensitiveData: false,
  prohibitedActivities: [
    'illegal',
    'harassment',
    'malware',
    'unauthorized-access',
    'ip-infringement',
    'scraping',
    'impersonation',
    'phishing',
  ],
  allowsUGC: false,
  prohibitedContent: [],
  dmcaCompliant: false,
  canSuspend: true,
  immediateTermination: true,
  hasAppealProcess: false,
  cooperatesWithLawEnforcement: true,
  dataRetentionAfterTermination: false,
  governingLaw: 'England and Wales',
  disputeResolution: 'courts',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  policyTitle: 'Acceptable Use Policy',
};

export const ALL_PROHIBITED_ACTIVITIES: { id: string; label: string; generated: string }[] = [
  {
    id: 'illegal',
    label: 'Engaging in any illegal or unlawful activity',
    generated: 'Use the Platform for any purpose that is unlawful, fraudulent, or otherwise prohibited by applicable law or regulation, including but not limited to money laundering, drug trafficking, or facilitating any criminal act.',
  },
  {
    id: 'harassment',
    label: 'Harassment, bullying, or abuse of other users',
    generated: 'Harass, bully, intimidate, stalk, threaten, or abuse any other user or third party, including sending repeated unwanted communications or engaging in conduct that creates a hostile environment.',
  },
  {
    id: 'hate-speech',
    label: 'Hate speech targeting protected characteristics',
    generated: 'Post, transmit, or promote content that constitutes hate speech, including material that incites hatred, discrimination, or violence against any individual or group based on protected characteristics such as race, ethnicity, religion, gender, sexual orientation, disability, or national origin.',
  },
  {
    id: 'spam',
    label: 'Sending spam or unsolicited bulk communications',
    generated: 'Send, distribute, or facilitate unsolicited bulk messages, commercial solicitations, chain letters, or any other form of spam, whether by email, in-platform messaging, or any other communication channel.',
  },
  {
    id: 'malware',
    label: 'Uploading or distributing malware or viruses',
    generated: 'Upload, transmit, or distribute any viruses, worms, Trojan horses, ransomware, spyware, adware, or other malicious or harmful code designed to interfere with, damage, or gain unauthorized access to any system, network, or data.',
  },
  {
    id: 'unauthorized-access',
    label: 'Attempting unauthorized access to the service or other accounts',
    generated: 'Attempt to gain unauthorized access to the Platform, its underlying infrastructure, other users\' accounts, or any system or network connected to the Platform, including through password mining, credential stuffing, brute force attacks, or social engineering.',
  },
  {
    id: 'ip-infringement',
    label: 'Infringing third-party intellectual property rights',
    generated: 'Infringe, misappropriate, or violate the intellectual property rights of any third party, including posting, uploading, or distributing content protected by copyright, trademark, patent, or trade secret without appropriate authorization.',
  },
  {
    id: 'scraping',
    label: 'Scraping or extracting data without written permission',
    generated: 'Scrape, crawl, index, mirror, or otherwise extract data from the Platform by any means — including automated scripts, spiders, or crawlers — without our prior written consent, or in a manner that places an unreasonable or disproportionate load on our infrastructure.',
  },
  {
    id: 'bots',
    label: 'Using bots or automated tools to interact with the service',
    generated: 'Use any robot, bot, script, macro, automated tool, or non-human process to access, interact with, or perform actions on the Platform, unless expressly permitted in writing by us or facilitated through our official API under its applicable terms.',
  },
  {
    id: 'impersonation',
    label: 'Impersonating any person, organization, or entity',
    generated: 'Impersonate any person, company, organization, or entity, including our staff, other users, or public figures, or misrepresent your affiliation with any person or organization.',
  },
  {
    id: 'phishing',
    label: 'Phishing, fraud, or deceptive practices',
    generated: 'Engage in, facilitate, or promote any form of phishing, social engineering, fraud, deception, or scam, including creating fake login pages, sending fraudulent communications, or inducing others to disclose sensitive credentials or financial information.',
  },
  {
    id: 'csam',
    label: 'Distributing CSAM or content that exploits minors',
    generated: 'Post, transmit, store, distribute, or solicit any child sexual abuse material (CSAM) or any content that sexualises, exploits, or endangers minors in any way. We will report any such content to the relevant authorities immediately upon discovery.',
  },
  {
    id: 'dos',
    label: 'Conducting denial-of-service (DoS) or DDoS attacks',
    generated: 'Conduct, facilitate, or participate in any denial-of-service (DoS) or distributed denial-of-service (DDoS) attack, or any other action intended to disrupt or impair the availability, performance, or integrity of the Platform or any connected infrastructure.',
  },
  {
    id: 'reselling',
    label: 'Reselling or sublicensing access without authorization',
    generated: 'Resell, sublicense, rent, lease, or otherwise transfer access to the Platform to any third party without our prior written consent, or use the Platform to provide services to third parties in a manner not expressly authorized by us.',
  },
  {
    id: 'crypto-mining',
    label: 'Cryptocurrency mining or unauthorized resource use',
    generated: 'Use the Platform\'s computing resources, storage, or network capacity to mine cryptocurrency, perform unauthorized computations, or run any process that consumes resources disproportionate to normal use of the Platform.',
  },
];

export const ALL_PROHIBITED_CONTENT: { id: string; label: string; generated: string }[] = [
  {
    id: 'adult',
    label: 'Sexually explicit or adult content',
    generated: 'Sexually explicit or pornographic material, including nudity intended to be sexually gratifying, unless the Platform explicitly permits such content in a designated adult-only section subject to verified age controls.',
  },
  {
    id: 'violence',
    label: 'Graphic violence or gore',
    generated: 'Gratuitous or graphic depictions of violence, gore, torture, or self-harm, including content that glorifies or celebrates such acts.',
  },
  {
    id: 'misinformation',
    label: 'Deliberate misinformation or disinformation',
    generated: 'Content that deliberately spreads false or misleading information with intent to deceive, including fabricated news stories, manipulated media, or health misinformation that could cause real-world harm.',
  },
  {
    id: 'terrorism',
    label: 'Content inciting violence or promoting terrorism',
    generated: 'Content that promotes, glorifies, or incites acts of terrorism, extremism, or mass violence, or that facilitates the recruitment or radicalization of individuals.',
  },
  {
    id: 'doxxing',
    label: "Doxxing or publishing others' private information",
    generated: "Content that reveals another person's private or personally identifiable information (such as home address, phone number, financial details, or location data) without their explicit consent.",
  },
  {
    id: 'commercial-spam',
    label: 'Unsolicited commercial advertising or spam content',
    generated: 'Unsolicited commercial advertising, promotional material, or spam content, including mass-posting affiliate links, referral codes, or marketing messages in contexts where they are not permitted.',
  },
];

const PLATFORM_TYPE_LABELS: Record<string, string> = {
  saas: 'software-as-a-service (SaaS) platform',
  hosting: 'web hosting or cloud platform',
  community: 'online community or forum',
  educational: 'educational platform',
  corporate: 'corporate or enterprise network',
  marketplace: 'online marketplace',
  social: 'social networking platform',
  publishing: 'content publishing platform',
  other: 'online platform',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function generateAUP(a: AUPAnswers): string {
  const company = a.companyName || 'We';
  const site = a.websiteUrl || '#';
  const email = a.contactEmail || 'legal@yourcompany.com';
  const effectiveDateStr = formatDate(a.effectiveDate);
  const platformLabel = PLATFORM_TYPE_LABELS[a.platformType] || 'online platform';
  const jurisdiction = a.governingLaw || a.country || 'England and Wales';

  const sections: string[] = [];
  let n = 0;
  const next = () => ++n;

  const disputeText =
    a.disputeResolution === 'arbitration'
      ? `Any dispute arising out of or in connection with this Policy shall be referred to and finally resolved by binding arbitration conducted in ${jurisdiction}.`
      : a.disputeResolution === 'negotiation'
      ? `Before initiating formal proceedings, both parties agree to attempt to resolve any dispute through good-faith informal negotiation for at least 30 days after written notice of the dispute.`
      : `Any dispute arising out of or in connection with this Policy shall be subject to the exclusive jurisdiction of the courts of ${jurisdiction}.`;

  // ─── 1. Introduction & Purpose ───────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Introduction &amp; Purpose</h2>
  <p>This Acceptable Use Policy (&ldquo;Policy&rdquo;) sets out the rules governing your use of the ${platformLabel} operated by <strong>${company}</strong>${a.websiteUrl ? ` at <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a>` : ''} (the &ldquo;Platform&rdquo;).</p>
  <p>The purpose of this Policy is to protect the integrity, security, and availability of the Platform, to safeguard the experience of all users, and to ensure that the Platform is used only for lawful and intended purposes. This Policy applies alongside our Terms of Service${a.allowsUGC ? ', Content Guidelines,' : ''} and Privacy Policy, which are incorporated herein by reference.</p>
  <p>By accessing or using the Platform, you agree to comply with this Policy. If you do not agree, you must not use the Platform.</p>
</section>`);

  // ─── 2. Scope — Who This Policy Applies To ───────────────────────────────
  const userTypeList = a.userTypes.length > 0 ? a.userTypes : ['all users of the Platform'];
  sections.push(`<section>
  <h2>${next()}. Scope — Who This Policy Applies To</h2>
  <p>This Policy applies to <strong>all individuals and entities</strong> who access or use the Platform, including:</p>
  <ul>
    ${userTypeList.map(u => `<li>${u.charAt(0).toUpperCase() + u.slice(1)}</li>`).join('\n    ')}
    <li>Visitors who access the Platform without registering an account</li>
    <li>Third-party integrations, applications, or services that interact with the Platform through any API or interface</li>
  </ul>
  ${a.minimumAge ? `<p>You must be at least <strong>${a.minimumAge} years of age</strong> to use the Platform. If you are under 18, you confirm that your parent or legal guardian has reviewed and agreed to this Policy on your behalf.</p>` : ''}
  ${a.handlesSensitiveData ? `<p>The Platform handles sensitive personal data. Users are required to exercise particular care when uploading, transmitting, or processing such data and must comply with all applicable data protection laws, including the UK GDPR, EU GDPR, and the Data Protection Act 2018, as applicable.</p>` : ''}
</section>`);

  // ─── 3. Permitted Uses ────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Permitted Uses</h2>
  <p>Subject to your compliance with this Policy and our Terms of Service, <strong>${company}</strong> grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform solely for its intended purposes.</p>
  <p>Permitted uses include:</p>
  <ul>
    <li>Accessing and using the Platform's features and functionality as they are designed and described</li>
    <li>Creating and managing an account for your personal or business use</li>
    ${a.allowsUGC ? '<li>Submitting, posting, or sharing content in accordance with our Content Standards (Section 5)</li>' : ''}
    <li>Communicating with our support team and other authorized representatives</li>
    <li>Using any officially documented API or integration in accordance with its applicable developer terms</li>
  </ul>
  <p>Any use of the Platform not expressly permitted by this Policy or our Terms of Service is prohibited.</p>
</section>`);

  // ─── 4. Prohibited Activities ─────────────────────────────────────────────
  const selectedActivities = a.prohibitedActivities.length > 0
    ? ALL_PROHIBITED_ACTIVITIES.filter(act => a.prohibitedActivities.includes(act.id))
    : ALL_PROHIBITED_ACTIVITIES;

  sections.push(`<section>
  <h2>${next()}. Prohibited Activities</h2>
  <p>You must not use the Platform in any way that violates applicable law or these rules. The following activities are strictly prohibited:</p>
  <ol>
    ${selectedActivities.map((act) => `<li><strong>${act.label}:</strong> ${act.generated}</li>`).join('\n    ')}
  </ol>
  <p>This list is illustrative, not exhaustive. We reserve the right to determine, in our sole discretion, whether any conduct not listed above violates the spirit of this Policy.</p>
</section>`);

  // ─── 5. Content Standards (conditional) ──────────────────────────────────
  if (a.allowsUGC) {
    const selectedContent = a.prohibitedContent.length > 0
      ? ALL_PROHIBITED_CONTENT.filter(c => a.prohibitedContent.includes(c.id))
      : [];

    sections.push(`<section>
  <h2>${next()}. Content Standards</h2>
  <p>Where the Platform permits you to post, upload, share, or otherwise submit content (&ldquo;User Content&rdquo;), you are responsible for ensuring that your User Content complies with this Policy and all applicable laws.</p>
  <p>User Content must not:</p>
  <ul>
    ${selectedContent.length > 0
      ? selectedContent.map(c => `<li>${c.generated}</li>`).join('\n    ')
      : `<li>Violate any applicable law or third-party rights</li>
    <li>Be defamatory, obscene, offensive, or otherwise objectionable</li>
    <li>Infringe any copyright, trademark, or other intellectual property right</li>
    <li>Contain personal data of third parties without their consent</li>`
    }
  </ul>
  <p>We reserve the right to remove or restrict access to any User Content that we determine, in our sole discretion, violates this Policy or is otherwise harmful or inappropriate — without prior notice and without liability to you.</p>
  ${a.dmcaCompliant ? `<p><strong>DMCA / Copyright Takedown:</strong> If you believe that content on the Platform infringes your copyright, please send a written notice to <a href="mailto:${email}">${email}</a> including: (i) identification of the copyrighted work; (ii) identification of the infringing material and its location; (iii) your contact details; (iv) a good faith belief statement; and (v) a declaration, under penalty of perjury, that the information is accurate and you are authorised to act. We will process valid takedown notices in accordance with the Digital Millennium Copyright Act (DMCA) and/or applicable local law.</p>` : ''}
</section>`);
  }

  // ─── 6. Account Security & Responsibility (conditional) ──────────────────
  if (a.requiresAccount) {
    sections.push(`<section>
  <h2>${next()}. Account Security &amp; Responsibility</h2>
  <p>You are solely responsible for maintaining the confidentiality and security of your account credentials, including your username and password. You agree to:</p>
  <ul>
    <li>Use a strong, unique password and not reuse passwords from other services</li>
    <li>Not share your account credentials with any third party</li>
    <li>Log out of your account at the end of each session on shared or public devices</li>
    <li>Notify us immediately at <a href="mailto:${email}">${email}</a> if you suspect any unauthorized access to or use of your account</li>
    <li>Accept full responsibility for all activity conducted under your account, whether authorized by you or not, unless caused by our failure to maintain appropriate security</li>
  </ul>
  <p><strong>${company}</strong> will never ask you for your password by email, phone, or any other channel. If you receive such a request, treat it as fraudulent and report it to us immediately.</p>
  ${a.handlesSensitiveData ? '<p>Given that the Platform handles sensitive data, you must apply additional security measures appropriate to the nature of the data you process, such as enabling multi-factor authentication where available.</p>' : ''}
</section>`);
  }

  // ─── 7. Automated Access & Scraping ──────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Automated Access &amp; API Use</h2>
  <p>Automated access to the Platform (including through scripts, crawlers, bots, or similar tools) is not permitted unless you are using our officially published API and operating within its documented rate limits and terms of use.</p>
  <p>When using our API or any authorized automated integration, you must:</p>
  <ul>
    <li>Authenticate all requests using valid API credentials issued to you</li>
    <li>Respect all rate limits and usage quotas</li>
    <li>Not use the API to aggregate, republish, or commercialize Platform data without our written consent</li>
    <li>Immediately cease automated access if instructed to do so by us</li>
  </ul>
  <p>We reserve the right to throttle, block, or terminate access from any IP address or account that engages in excessive automated requests or conduct that compromises Platform performance or security.</p>
</section>`);

  // ─── 8. Monitoring & Privacy ─────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Monitoring &amp; Privacy</h2>
  <p><strong>${company}</strong> reserves the right to monitor, log, and review activity on the Platform for the purposes of security, fraud prevention, compliance with this Policy and applicable law, and improving the Platform. This monitoring may include automated scanning, logging of access patterns, and review of flagged content or accounts.</p>
  <p>Monitoring is conducted in accordance with our <a href="${site}/privacy-policy">Privacy Policy</a>${a.handlesSensitiveData ? ' and all applicable data protection laws, including the UK GDPR and EU GDPR' : ''}. We will handle any personal data collected in the course of monitoring in accordance with our Privacy Policy.</p>
  <p>By using the Platform, you acknowledge and consent to such monitoring. You should have no expectation of privacy in respect of any content you submit or actions you take that violate this Policy.</p>
</section>`);

  // ─── 9. Enforcement — Suspension & Termination ──────────────────────────
  if (a.canSuspend) {
    sections.push(`<section>
  <h2>${next()}. Enforcement — Suspension &amp; Termination</h2>
  <p>We take violations of this Policy seriously. If we determine, in our sole discretion, that you have violated this Policy, we may take any one or more of the following actions:</p>
  <ul>
    <li>Issue a formal warning</li>
    <li>Temporarily restrict or suspend your access to some or all features of the Platform</li>
    <li>Permanently terminate your account and revoke your right to use the Platform</li>
    <li>Remove, disable, or restrict access to any content you have submitted</li>
    <li>Refer the matter to law enforcement or relevant regulatory authorities</li>
    <li>Pursue civil or criminal legal proceedings against you</li>
  </ul>
  ${a.immediateTermination
    ? `<p><strong>Immediate action:</strong> For serious violations — including but not limited to illegal activity, distribution of CSAM, security attacks, or conduct that puts other users at risk — we reserve the right to take immediate action without prior notice, including permanent termination of your account.</p>`
    : `<p>Where practicable and where the violation is not severe, we will endeavour to give you reasonable notice and an opportunity to remedy the breach before taking enforcement action.</p>`
  }
  ${a.hasAppealProcess
    ? `<p><strong>Appeals:</strong> If you believe that enforcement action has been taken against your account in error, you may submit an appeal to <a href="mailto:${email}">${email}</a> within <strong>14 days</strong> of the action being taken. Please include your account details and a clear explanation of your grounds for appeal. We will review appeals on a case-by-case basis, but our decisions are ultimately final.</p>`
    : ''
  }
  <p>These enforcement measures are in addition to any other rights and remedies available to us under applicable law. Termination of your account does not relieve you of any obligations or liabilities incurred prior to termination.</p>
</section>`);
  }

  // ─── 10. Reporting Violations ────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Reporting Violations</h2>
  <p>We rely on our community to help maintain a safe and respectful environment. If you encounter content or behaviour on the Platform that you believe violates this Policy, please report it to us promptly.</p>
  <p>To report a violation, contact us at <a href="mailto:${email}">${email}</a> with the following information:</p>
  <ul>
    <li>A description of the content or conduct you are reporting</li>
    <li>The location of the content (e.g. URL, username, or message ID)</li>
    <li>The reason you believe it violates this Policy</li>
    <li>Your contact details (so we can follow up if necessary)</li>
  </ul>
  <p>We will review all reports and take action where we determine a violation has occurred. We are not obligated to act on every report, and we will not disclose the outcome of investigations to the reporting party unless required to do so by law. We ask that you act in good faith when submitting reports — submitting false or malicious reports is itself a violation of this Policy.</p>
</section>`);

  // ─── 11. Law Enforcement Cooperation (conditional) ───────────────────────
  if (a.cooperatesWithLawEnforcement) {
    sections.push(`<section>
  <h2>${next()}. Law Enforcement Cooperation</h2>
  <p><strong>${company}</strong> will cooperate fully with law enforcement agencies, regulatory bodies, and judicial authorities where required by applicable law, or where we have a good faith belief that such cooperation is necessary to:</p>
  <ul>
    <li>Comply with a legal obligation, court order, or lawful request from a competent authority</li>
    <li>Protect the rights, property, or safety of <strong>${company}</strong>, our users, or the public</li>
    <li>Investigate, prevent, or take action against illegal activities, suspected fraud, or violations of this Policy</li>
  </ul>
  <p>This may include disclosing account information, user data, or content to authorities, subject to and in accordance with our Privacy Policy and applicable data protection law. Where legally permitted, we will endeavour to notify affected users of any such disclosure.</p>
  ${a.dataRetentionAfterTermination ? `<p><strong>Data retention following termination:</strong> Where an account is terminated due to a suspected policy violation, we may retain relevant account data, logs, and associated content for a period sufficient to support any ongoing investigation, legal proceedings, or regulatory inquiry, notwithstanding our standard data retention schedule.</p>` : ''}
</section>`);
  }

  // ─── 12. Changes to This Policy ──────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Changes to This Policy</h2>
  <p>We reserve the right to update or amend this Policy at any time to reflect changes in the law, our practices, or the nature of the Platform. When we make material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page and, where appropriate, notify you via email or a prominent notice on the Platform.</p>
  <p>Your continued use of the Platform after any changes are posted constitutes your acceptance of the revised Policy. If you do not agree to the updated Policy, you must stop using the Platform.</p>
  <p>We encourage you to review this Policy periodically to stay informed of our expectations.</p>
</section>`);

  // ─── 13. Contact Us ───────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Contact Us</h2>
  <p>If you have questions about this Acceptable Use Policy, wish to report a violation, or need to discuss a specific use case, please contact us:</p>
  <ul>
    ${a.companyName ? `<li><strong>Company:</strong> ${a.companyName}</li>` : ''}
    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
    ${a.websiteUrl ? `<li><strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a></li>` : ''}
  </ul>
  <p>These Terms are governed by and construed in accordance with the laws of <strong>${jurisdiction}</strong>. ${disputeText}</p>
</section>`);

  return `
<h1>${a.policyTitle || 'Acceptable Use Policy'}</h1>
<p class="policy-meta">Last updated: ${effectiveDateStr}</p>

${sections.join('\n\n')}
`.trim();
}
