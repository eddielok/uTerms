export type ComplianceStatus = 'fully' | 'partially' | 'non';
export type WCAGVersion = '2.1' | '2.2';
export type ConformanceLevel = 'A' | 'AA' | 'AAA';
export type StandardReferenced = 'wcag' | 'en301549' | 'section508';
export type Sector = 'public' | 'private' | 'non-profit' | 'education';

export interface KnownIssue {
  title: string;
  description: string;
  workaround: string;
}

import { escapeHtml, safeUrl } from './html';

export interface AccessibilityAnswers {
  // Step 1: Organisation & Website
  organisationName: string;
  websiteName: string;
  websiteUrl: string;
  sector: Sector;
  country: string;

  // Step 2: Compliance Status
  wcagVersion: WCAGVersion;
  conformanceLevel: ConformanceLevel;
  complianceStatus: ComplianceStatus;
  standardReferenced: StandardReferenced;

  // Step 3: Known Issues
  hasKnownIssues: boolean;
  knownIssues: KnownIssue[];
  claimsDisproportionateBurden: boolean;
  disproportionateBurdenJustification: string;
  hasOutOfScopeContent: boolean;
  outOfScopeDescription: string;

  // Step 4: Technical Information
  technologiesReliedOn: string[];
  testingApproaches: string[];

  // Step 5: Feedback & Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  responseTimeDays: string;
  feedbackProcess: string;

  // Step 6: Enforcement & Generate
  includeFormalComplaints: boolean;
  datePrepared: string;
  dateLastReviewed: string;
  effectiveDate: string;
  policyTitle: string;
}

export const DEFAULT_ACCESSIBILITY_ANSWERS: AccessibilityAnswers = {
  organisationName: '',
  websiteName: '',
  websiteUrl: '',
  sector: 'private',
  country: 'United Kingdom',
  wcagVersion: '2.1',
  conformanceLevel: 'AA',
  complianceStatus: 'partially',
  standardReferenced: 'wcag',
  hasKnownIssues: false,
  knownIssues: [{ title: '', description: '', workaround: '' }],
  claimsDisproportionateBurden: false,
  disproportionateBurdenJustification: '',
  hasOutOfScopeContent: false,
  outOfScopeDescription: '',
  technologiesReliedOn: ['HTML', 'CSS', 'JavaScript', 'WAI-ARIA'],
  testingApproaches: ['self-assessment', 'automated-tools'],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  responseTimeDays: '5',
  feedbackProcess: '',
  includeFormalComplaints: false,
  datePrepared: new Date().toISOString().split('T')[0],
  dateLastReviewed: new Date().toISOString().split('T')[0],
  effectiveDate: new Date().toISOString().split('T')[0],
  policyTitle: 'Accessibility Statement',
};

export const ALL_TECHNOLOGIES = [
  'HTML', 'CSS', 'JavaScript', 'WAI-ARIA',
  'PDF documents', 'Microsoft Office documents',
  'SVG images', 'Video', 'Audio', 'Web forms',
];

export const ALL_TESTING_APPROACHES: { id: string; label: string }[] = [
  { id: 'self-assessment', label: 'Self-assessment by our team' },
  { id: 'third-party-audit', label: 'Third-party accessibility audit' },
  { id: 'automated-tools', label: 'Automated testing tools (e.g. axe, WAVE, Lighthouse)' },
  { id: 'screen-reader', label: 'Screen reader testing (NVDA, JAWS, VoiceOver)' },
  { id: 'user-testing', label: 'User testing with assistive technology users' },
];

interface EnforcementInfo {
  body: string;
  url: string;
  process: string;
  complaints?: string;
}

const ENFORCEMENT_MAP: Record<string, EnforcementInfo> = {
  'United Kingdom': {
    body: 'Equality and Human Rights Commission (EHRC)',
    url: 'https://www.equalityhumanrights.com/',
    process: 'If you are not happy with how we respond to your complaint, contact the Equality Advisory and Support Service (EASS) at <a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noopener noreferrer">www.equalityadvisoryservice.com</a>.',
    complaints: 'The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the "accessibility regulations"). If you are not happy with how we respond to your complaint, <a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noopener noreferrer">contact the Equality Advisory and Support Service (EASS)</a>.',
  },
  'Germany': {
    body: 'Federal Government Commissioner for Matters relating to Persons with Disabilities',
    url: 'https://www.behindertenbeauftragter.de/',
    process: 'If you are not satisfied with our response, you may contact the Schlichtungsstelle nach dem Behindertengleichstellungsgesetz (BGG) at <a href="https://www.schlichtungsstelle-bgg.de/" target="_blank" rel="noopener noreferrer">www.schlichtungsstelle-bgg.de</a>.',
  },
  'Austria': {
    body: 'Austrian Monitoring Body for Web Accessibility (Monitoringstelle)',
    url: 'https://www.digitalaustria.gv.at/',
    process: 'If you are not satisfied with our response, you may contact the Austrian Monitoring Body for Web Accessibility.',
  },
  'United States': {
    body: 'U.S. Department of Justice, Disability Rights Section',
    url: 'https://www.ada.gov/',
    process: 'If you are not satisfied with our response, you may file a complaint with the U.S. Department of Justice Disability Rights Section at <a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer">www.ada.gov</a> or contact the relevant Office for Civil Rights.',
  },
  'Australia': {
    body: 'Australian Human Rights Commission (AHRC)',
    url: 'https://www.humanrights.gov.au/',
    process: 'If you are not satisfied with our response, you may contact the Australian Human Rights Commission (AHRC) at <a href="https://www.humanrights.gov.au/" target="_blank" rel="noopener noreferrer">www.humanrights.gov.au</a>.',
  },
  'Canada': {
    body: 'Canadian Human Rights Commission (CHRC)',
    url: 'https://www.chrc-ccdp.gc.ca/',
    process: 'If you are not satisfied with our response, you may contact the Canadian Human Rights Commission (CHRC) at <a href="https://www.chrc-ccdp.gc.ca/" target="_blank" rel="noopener noreferrer">www.chrc-ccdp.gc.ca</a>.',
  },
};

function getEnforcement(country: string): EnforcementInfo {
  return ENFORCEMENT_MAP[country] || {
    body: 'your national accessibility or equality enforcement body',
    url: '',
    process: 'If you are not satisfied with our response, you may contact your national accessibility or equality enforcement authority.',
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

function complianceStatement(a: AccessibilityAnswers): string {
  const standard = a.standardReferenced === 'en301549'
    ? `EN 301 549 (which incorporates WCAG ${a.wcagVersion} level ${a.conformanceLevel})`
    : a.standardReferenced === 'section508'
    ? 'Section 508 of the Rehabilitation Act'
    : `Web Content Accessibility Guidelines (WCAG) version ${a.wcagVersion} level ${a.conformanceLevel}`;

  const site = a.websiteName || a.websiteUrl || 'This website';

  switch (a.complianceStatus) {
    case 'fully':
      return `<em>${site}</em> is <strong>fully compliant</strong> with the ${standard}.`;
    case 'partially':
      return `<em>${site}</em> is <strong>partially compliant</strong> with the ${standard}, due to the non-compliances and exemptions listed below.`;
    case 'non':
      return `<em>${site}</em> is <strong>not compliant</strong> with the ${standard}. The non-compliances and exemptions are listed below.`;
  }
}

function testingApproachText(approaches: string[]): string {
  const labels: Record<string, string> = {
    'self-assessment': 'self-assessment carried out by our own team',
    'third-party-audit': 'an independent third-party accessibility audit',
    'automated-tools': 'automated testing tools including axe, WAVE, and Google Lighthouse',
    'screen-reader': 'manual testing with screen readers including NVDA, JAWS, and VoiceOver',
    'user-testing': 'user testing sessions conducted with participants who use assistive technologies',
  };
  const selected = approaches.map(id => labels[id]).filter(Boolean);
  if (selected.length === 0) return 'self-assessment carried out by our team';
  if (selected.length === 1) return selected[0];
  return selected.slice(0, -1).join(', ') + ', and ' + selected[selected.length - 1];
}

export function generateAccessibilityStatement(a: AccessibilityAnswers): string {
  const org = escapeHtml(a.organisationName) || 'We';
  const site = escapeHtml(a.websiteName || a.websiteUrl) || 'this website';
  const siteUrl = safeUrl(a.websiteUrl);
  const email = escapeHtml(a.contactEmail) || 'accessibility@yourorganisation.com';
  const contactName = escapeHtml(a.contactName);
  const contactPhone = escapeHtml(a.contactPhone);
  const responseTimeDays = escapeHtml(String(a.responseTimeDays || ''));
  const outOfScopeDescription = escapeHtml(a.outOfScopeDescription);
  const feedbackProcess = escapeHtml(a.feedbackProcess);
  const policyTitle = escapeHtml(a.policyTitle);
  const enforcement = getEnforcement(a.country);
  const preparedDate = formatDate(a.datePrepared);
  const reviewedDate = formatDate(a.dateLastReviewed);

  const sections: string[] = [];
  let n = 0;
  const next = () => ++n;

  // ─── 1. Overview ─────────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Overview</h2>
  <p><strong>${org}</strong> is committed to making ${siteUrl !== '#' ? `<a href="${siteUrl}" target="_blank" rel="noopener noreferrer">${site}</a>` : `<em>${site}</em>`} accessible, in accordance with applicable accessibility legislation and best practice.</p>
  <p>This accessibility statement applies to <strong>${site}</strong>.</p>
  ${a.sector === 'public' ? `<p>As a public sector body, we are required to meet the accessibility requirements of the Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 (for UK) or equivalent national implementing legislation.</p>` : ''}
  ${(a.sector === 'private' || a.sector === 'non-profit') && a.country !== 'United States' ? `<p>The European Accessibility Act (EAA), applicable from June 2025, extends accessibility requirements to a wider range of private sector products and services. We are committed to meeting these obligations.</p>` : ''}
</section>`);

  // ─── 2. Compliance Status ─────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Compliance Status</h2>
  <p>${complianceStatement(a)}</p>
  ${a.complianceStatus === 'fully' ? `<p>We are confident that all pages within the scope of this statement meet the required standard. We continue to monitor and test the website to maintain this level of compliance.</p>` : ''}
</section>`);

  // ─── 3. Non-accessible Content (conditional) ──────────────────────────────
  const hasNonAccessible = a.hasKnownIssues || a.claimsDisproportionateBurden || a.hasOutOfScopeContent;
  if (hasNonAccessible) {
    const subSections: string[] = [];

    if (a.hasKnownIssues && a.knownIssues.filter(i => i.title || i.description).length > 0) {
      const issueList = a.knownIssues
        .filter(i => i.title || i.description)
        .map(i => `<li>
          ${i.title ? `<strong>${i.title}:</strong> ` : ''}${i.description}${i.workaround ? ` <em>Workaround: ${i.workaround}</em>` : ''}
        </li>`)
        .join('\n');
      subSections.push(`<h3>Non-compliance with the accessibility standard</h3>
  <p>The content listed below is not accessible for the following reasons:</p>
  <ul>${issueList}</ul>`);
    }

    if (a.claimsDisproportionateBurden) {
      subSections.push(`<h3>Disproportionate burden</h3>
  <p>We have assessed the cost of fixing certain accessibility issues and determined that doing so would impose a disproportionate burden within the meaning of the applicable accessibility regulations. ${a.disproportionateBurdenJustification ? a.disproportionateBurdenJustification : 'This assessment will be reviewed periodically.'}</p>`);
    }

    if (a.hasOutOfScopeContent) {
      subSections.push(`<h3>Content that's not within the scope of the accessibility regulations</h3>
  <p>${outOfScopeDescription || 'Certain content on this website is exempt from the accessibility regulations, including third-party content that we do not fund, develop, or control; content published before 23 September 2019 that has not been substantially revised; and live video streams.'}</p>`);
    }

    sections.push(`<section>
  <h2>${next()}. Non-accessible Content</h2>
  <p>The content listed in this section is non-accessible for the reasons given.</p>
  ${subSections.join('\n\n')}
</section>`);
  }

  // ─── 4. Technologies Relied On ────────────────────────────────────────────
  const techs = a.technologiesReliedOn.length > 0 ? a.technologiesReliedOn : ['HTML', 'CSS', 'JavaScript'];
  sections.push(`<section>
  <h2>${next()}. Technical Information about Accessibility</h2>
  <p><strong>${org}</strong> is committed to making ${site} accessible. The following web technologies are relied upon for conformance with the applicable accessibility standard:</p>
  <ul>
    ${techs.map(t => `<li>${t}</li>`).join('\n    ')}
  </ul>
  <p>These technologies are relied upon for conformance with the accessibility standard used.</p>
</section>`);

  // ─── 5. Assessment Approach ───────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Assessment Approach</h2>
  <p><strong>${org}</strong> assessed the accessibility of ${site} using the following approach${a.testingApproaches.length > 1 ? 'es' : ''}:</p>
  <ul>
    ${a.testingApproaches.map(id => {
      const found = ALL_TESTING_APPROACHES.find(t => t.id === id);
      return found ? `<li>${found.label.charAt(0).toUpperCase() + found.label.slice(1)}</li>` : '';
    }).filter(Boolean).join('\n    ')}
  </ul>
  <p>We used ${testingApproachText(a.testingApproaches)} to evaluate ${site} against the ${
    a.standardReferenced === 'en301549' ? 'EN 301 549' :
    a.standardReferenced === 'section508' ? 'Section 508' :
    `WCAG ${a.wcagVersion} level ${a.conformanceLevel}`
  } standard.</p>
</section>`);

  // ─── 6. Feedback & Contact ────────────────────────────────────────────────
  const contactLines: string[] = [];
  if (contactName) contactLines.push(`<li><strong>Name / Team:</strong> ${contactName}</li>`);
  contactLines.push(`<li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>`);
  if (contactPhone) contactLines.push(`<li><strong>Phone:</strong> ${contactPhone}</li>`);

  sections.push(`<section>
  <h2>${next()}. Feedback and Contact Information</h2>
  <p>We are always looking to improve the accessibility of ${site}. If you experience any barriers not listed in this statement, or if you think we are not meeting the requirements of the accessibility regulations, please contact us.</p>
  ${feedbackProcess ? `<p>${feedbackProcess}</p>` : ''}
  <ul>
    ${contactLines.join('\n    ')}
  </ul>
  <p>We aim to respond to accessibility feedback within <strong>${responseTimeDays || '5'} working days</strong>.</p>
  <p>If you need information on this website in a different format — such as accessible PDF, large print, easy read, audio recording, or Braille — please contact us using the details above and we will consider your request.</p>
</section>`);

  // ─── 7. Enforcement Procedure ─────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Enforcement Procedure</h2>
  <p>If you are not satisfied with how we have responded to your accessibility feedback or request, you can escalate your complaint to ${enforcement.body}${enforcement.url ? ` (<a href="${enforcement.url}" target="_blank" rel="noopener noreferrer">${enforcement.url.replace(/^https?:\/\//, '')}</a>)` : ''}.</p>
  <p>${enforcement.process}</p>
</section>`);

  // ─── 8. Formal Complaints (conditional) ───────────────────────────────────
  if (a.includeFormalComplaints || a.sector === 'public') {
    sections.push(`<section>
  <h2>${next()}. Formal Complaints</h2>
  <p>If you are not happy with how we respond to your accessibility complaint${enforcement.complaints ? ':' : ', you have the right to escalate the matter to the relevant enforcement authority.'}</p>
  ${enforcement.complaints ? `<p>${enforcement.complaints}</p>` : ''}
</section>`);
  }

  // ─── 9. Preparation of This Statement ────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Preparation of This Accessibility Statement</h2>
  <p>This statement was prepared on <strong>${preparedDate || 'the date shown above'}</strong>.</p>
  ${reviewedDate && reviewedDate !== preparedDate ? `<p>It was last reviewed on <strong>${reviewedDate}</strong>.</p>` : ''}
  <p>We will review this statement annually and whenever significant changes are made to ${site}. The accessibility of the site is tested on an ongoing basis.</p>
</section>`);

  return `
<h1>${policyTitle || 'Accessibility Statement'}</h1>
<p class="policy-meta">Last updated: ${preparedDate}</p>

${sections.join('\n\n')}
`.trim();
}
