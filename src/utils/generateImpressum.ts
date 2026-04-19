import { escapeHtml, safeUrl } from './html';

export type EntityType =
  | 'individual'
  | 'sole-trader'
  | 'freelancer'
  | 'gbr'
  | 'gmbh'
  | 'ug'
  | 'ag'
  | 'ohg'
  | 'kg'
  | 'ev'
  | 'other';

export type OutputLanguage = 'de' | 'en' | 'both';
export type OperatingCountry = 'de' | 'at' | 'ch' | 'other';

export interface ImpressumAnswers {
  // Step 1: Entity & Location
  entityType: EntityType;
  companyName: string;
  operatingCountry: OperatingCountry;
  language: OutputLanguage;

  // Step 2: Address & Registration
  street: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
  registrationCourt: string;
  registrationNumber: string;
  vatId: string;
  taxNumber: string;

  // Step 3: Contact
  phone: string;
  fax: string;
  email: string;
  websiteUrl: string;

  // Step 4: Responsible Persons
  representatives: string[];
  hasEditorialContent: boolean;
  editorialPerson: string;
  editorialAddress: string;

  // Step 5: Professional & Regulatory
  isRegulatedProfession: boolean;
  professionalTitle: string;
  titleAwardedIn: string;
  chamber: string;
  supervisoryAuthority: string;
  professionalRegulations: string;
  hasInsurance: boolean;
  insuranceProvider: string;
  insuranceCoverage: string;

  // Step 6: Dispute Resolution & Generate
  euODR: boolean;
  consumerDisputeParticipation: boolean;
  includeliabilityDisclaimer: boolean;
  effectiveDate: string;
  policyTitle: string;
}

export const DEFAULT_IMPRESSUM_ANSWERS: ImpressumAnswers = {
  entityType: 'gmbh',
  companyName: '',
  operatingCountry: 'de',
  language: 'both',
  street: '',
  city: '',
  postcode: '',
  state: '',
  country: 'Deutschland',
  registrationCourt: '',
  registrationNumber: '',
  vatId: '',
  taxNumber: '',
  phone: '',
  fax: '',
  email: '',
  websiteUrl: '',
  representatives: [''],
  hasEditorialContent: false,
  editorialPerson: '',
  editorialAddress: '',
  isRegulatedProfession: false,
  professionalTitle: '',
  titleAwardedIn: '',
  chamber: '',
  supervisoryAuthority: '',
  professionalRegulations: '',
  hasInsurance: false,
  insuranceProvider: '',
  insuranceCoverage: '',
  euODR: true,
  consumerDisputeParticipation: false,
  includeliabilityDisclaimer: true,
  effectiveDate: new Date().toISOString().split('T')[0],
  policyTitle: 'Impressum',
};

// Entity types that require a registered representative declaration
const REGISTERED_ENTITIES: EntityType[] = ['gmbh', 'ug', 'ag', 'ohg', 'kg', 'ev'];
// Entity types that have a commercial register entry
const REGISTERED_IN_HANDELSREGISTER: EntityType[] = ['gmbh', 'ug', 'ag', 'ohg', 'kg'];

const ENTITY_LABELS_DE: Record<EntityType, string> = {
  individual: '',
  'sole-trader': 'Einzelunternehmen',
  freelancer: 'Freiberufler',
  gbr: 'GbR (Gesellschaft bürgerlichen Rechts)',
  gmbh: 'GmbH',
  ug: 'UG (haftungsbeschränkt)',
  ag: 'AG',
  ohg: 'OHG',
  kg: 'KG',
  ev: 'e.V.',
  other: '',
};

const ENTITY_LABELS_EN: Record<EntityType, string> = {
  individual: '',
  'sole-trader': 'Sole Trader',
  freelancer: 'Freelancer',
  gbr: 'Civil Law Partnership (GbR)',
  gmbh: 'Limited Liability Company (GmbH)',
  ug: 'Entrepreneurial Company (UG, limited liability)',
  ag: 'Stock Corporation (AG)',
  ohg: 'General Partnership (OHG)',
  kg: 'Limited Partnership (KG)',
  ev: 'Registered Association (e.V.)',
  other: '',
};

function legalBasisDE(country: OperatingCountry): string {
  switch (country) {
    case 'at': return 'Angaben gemäß § 25 Mediengesetz (MedienG) und § 5 E-Commerce-Gesetz (ECG)';
    case 'ch': return 'Angaben gemäß Art. 3 Abs. 1 lit. s UWG';
    default:   return 'Angaben gemäß § 5 Telemediengesetz (TMG) und § 18 Abs. 2 Medienstaatsvertrag (MStV)';
  }
}

function legalBasisEN(country: OperatingCountry): string {
  switch (country) {
    case 'at': return 'Information pursuant to § 25 Austrian Media Act (MedienG) and § 5 E-Commerce Act (ECG)';
    case 'ch': return 'Information pursuant to Art. 3 para. 1 lit. s Swiss UCA (UWG)';
    default:   return 'Information pursuant to § 5 German Telemedia Act (TMG) and § 18 para. 2 State Media Treaty (MStV)';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Block builders ─────────────────────────────────────────────────────────

function buildDE(a: ImpressumAnswers): string {
  const entityLabel = ENTITY_LABELS_DE[a.entityType];
  const companyName = escapeHtml(a.companyName);
  const street = escapeHtml(a.street);
  const postcode = escapeHtml(a.postcode);
  const city = escapeHtml(a.city);
  const state = escapeHtml(a.state);
  const country = escapeHtml(a.country);
  const registrationCourt = escapeHtml(a.registrationCourt);
  const registrationNumber = escapeHtml(a.registrationNumber);
  const vatId = escapeHtml(a.vatId);
  const taxNumber = escapeHtml(a.taxNumber);
  const phone = escapeHtml(a.phone);
  const fax = escapeHtml(a.fax);
  const email = escapeHtml(a.email);
  const websiteUrl = safeUrl(a.websiteUrl);
  const websiteDisplay = escapeHtml(a.websiteUrl);
  const reps = a.representatives.filter(Boolean).map(escapeHtml);
  const editorialPerson = escapeHtml(a.editorialPerson);
  const editorialAddress = escapeHtml(a.editorialAddress);
  const professionalTitle = escapeHtml(a.professionalTitle);
  const titleAwardedIn = escapeHtml(a.titleAwardedIn);
  const chamber = escapeHtml(a.chamber);
  const supervisoryAuthority = escapeHtml(a.supervisoryAuthority);
  const professionalRegulations = escapeHtml(a.professionalRegulations);
  const insuranceProvider = escapeHtml(a.insuranceProvider);
  const insuranceCoverage = escapeHtml(a.insuranceCoverage);
  const address = [street, `${postcode} ${city}`.trim(), state, country]
    .filter(Boolean).join('<br>');
  const hasReg = REGISTERED_IN_HANDELSREGISTER.includes(a.entityType);
  const needsRep = REGISTERED_ENTITIES.includes(a.entityType);

  const blocks: string[] = [];

  // Header
  blocks.push(`<p><strong>${legalBasisDE(a.operatingCountry)}</strong></p>`);

  // Company info
  blocks.push(`<p>
  <strong>${companyName}${entityLabel ? ` ${entityLabel}` : ''}</strong><br>
  ${address}
</p>`);

  // Handelsregister
  if (hasReg && (registrationCourt || registrationNumber)) {
    blocks.push(`<p>
  <strong>Handelsregister:</strong><br>
  ${registrationCourt ? `Registergericht: ${registrationCourt}<br>` : ''}
  ${registrationNumber ? `Registernummer: ${registrationNumber}` : ''}
</p>`);
  }

  // VAT
  if (vatId) {
    blocks.push(`<p>
  <strong>Umsatzsteuer:</strong><br>
  Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br>
  ${vatId}
</p>`);
  } else if (taxNumber) {
    blocks.push(`<p>
  <strong>Steuernummer:</strong> ${taxNumber}
</p>`);
  }

  // Contact
  const contactLines: string[] = [];
  if (phone) contactLines.push(`Telefon: ${phone}`);
  if (fax) contactLines.push(`Telefax: ${fax}`);
  if (email) contactLines.push(`E-Mail: <a href="mailto:${email}">${email}</a>`);
  if (websiteUrl !== '#') contactLines.push(`Web: <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">${websiteDisplay}</a>`);
  if (contactLines.length > 0) {
    blocks.push(`<p>
  <strong>Kontakt:</strong><br>
  ${contactLines.join('<br>')}
</p>`);
  }

  // Representatives
  if (needsRep && reps.length > 0) {
    const label = a.entityType === 'ev' ? 'Vorstand' : 'Vertreten durch';
    blocks.push(`<p>
  <strong>${label}:</strong><br>
  ${reps.join('<br>')}
</p>`);
  }

  // Editorial responsibility
  if (a.hasEditorialContent && editorialPerson) {
    blocks.push(`<p>
  <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong><br>
  ${editorialPerson}${editorialAddress ? `<br>${editorialAddress}` : ''}
</p>`);
  }

  // Professional info
  if (a.isRegulatedProfession) {
    const profLines: string[] = [];
    if (professionalTitle) profLines.push(`Berufsbezeichnung: ${professionalTitle}`);
    if (titleAwardedIn) profLines.push(`Verliehen in: ${titleAwardedIn}`);
    if (chamber) profLines.push(`Kammer: ${chamber}`);
    if (supervisoryAuthority) profLines.push(`Aufsichtsbehörde: ${supervisoryAuthority}`);
    if (professionalRegulations) profLines.push(`Berufsrechtliche Regelungen: ${professionalRegulations}`);
    if (a.hasInsurance && insuranceProvider) {
      profLines.push(`Berufshaftpflichtversicherung: ${insuranceProvider}`);
      if (insuranceCoverage) profLines.push(`Geltungsbereich: ${insuranceCoverage}`);
    }
    if (profLines.length > 0) {
      blocks.push(`<p>
  <strong>Berufsrechtliche Angaben:</strong><br>
  ${profLines.join('<br>')}
</p>`);
    }
  }

  // EU ODR — mandatory under EU Regulation 524/2013 for all EU/EEA online sellers (de, at)
  if (a.euODR || a.operatingCountry === 'de' || a.operatingCountry === 'at') {
    blocks.push(`<p>
  <strong>EU-Streitschlichtung:</strong><br>
  Gemäß Verordnung (EU) Nr. 524/2013 sind wir verpflichtet, auf die Plattform der Europäischen Kommission zur Online-Streitbeilegung (OS) hinzuweisen:<br>
  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a><br>
  Unsere E-Mail-Adresse finden Sie oben im Impressum.
</p>`);
  }

  // Consumer dispute resolution
  blocks.push(`<p>
  <strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle:</strong><br>
  ${a.consumerDisputeParticipation
    ? `Wir nehmen an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil. Die zuständige Universalschlichtungsstelle ist das Zentrum für Schlichtung e.V., Straßburger Straße 8, 77694 Kehl am Rhein (<a href="https://www.verbraucher-schlichter.de" target="_blank" rel="noopener noreferrer">https://www.verbraucher-schlichter.de</a>).`
    : `Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`
  }
</p>`);

  // Liability disclaimer
  if (a.includeliabilityDisclaimer) {
    blocks.push(`<p>
  <strong>Haftung für Inhalte:</strong><br>
  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
</p>
<p>
  <strong>Haftung für Links:</strong><br>
  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
</p>
<p>
  <strong>Urheberrecht:</strong><br>
  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
</p>`);
  }

  return blocks.join('\n\n');
}

function buildEN(a: ImpressumAnswers): string {
  const entityLabel = ENTITY_LABELS_EN[a.entityType];
  const companyName = escapeHtml(a.companyName);
  const street = escapeHtml(a.street);
  const postcode = escapeHtml(a.postcode);
  const city = escapeHtml(a.city);
  const state = escapeHtml(a.state);
  const country = escapeHtml(a.country);
  const registrationCourt = escapeHtml(a.registrationCourt);
  const registrationNumber = escapeHtml(a.registrationNumber);
  const vatId = escapeHtml(a.vatId);
  const taxNumber = escapeHtml(a.taxNumber);
  const phone = escapeHtml(a.phone);
  const fax = escapeHtml(a.fax);
  const email = escapeHtml(a.email);
  const websiteUrl = safeUrl(a.websiteUrl);
  const websiteDisplay = escapeHtml(a.websiteUrl);
  const reps = a.representatives.filter(Boolean).map(escapeHtml);
  const editorialPerson = escapeHtml(a.editorialPerson);
  const editorialAddress = escapeHtml(a.editorialAddress);
  const professionalTitle = escapeHtml(a.professionalTitle);
  const titleAwardedIn = escapeHtml(a.titleAwardedIn);
  const chamber = escapeHtml(a.chamber);
  const supervisoryAuthority = escapeHtml(a.supervisoryAuthority);
  const professionalRegulations = escapeHtml(a.professionalRegulations);
  const insuranceProvider = escapeHtml(a.insuranceProvider);
  const insuranceCoverage = escapeHtml(a.insuranceCoverage);
  const address = [street, `${postcode} ${city}`.trim(), state, country]
    .filter(Boolean).join('<br>');
  const hasReg = REGISTERED_IN_HANDELSREGISTER.includes(a.entityType);
  const needsRep = REGISTERED_ENTITIES.includes(a.entityType);

  const blocks: string[] = [];

  // Header
  blocks.push(`<p><strong>${legalBasisEN(a.operatingCountry)}</strong></p>`);

  // Company info
  blocks.push(`<p>
  <strong>${companyName}${entityLabel ? ` — ${entityLabel}` : ''}</strong><br>
  ${address}
</p>`);

  // Commercial register
  if (hasReg && (registrationCourt || registrationNumber)) {
    blocks.push(`<p>
  <strong>Commercial Register:</strong><br>
  ${registrationCourt ? `Registry Court: ${registrationCourt}<br>` : ''}
  ${registrationNumber ? `Registration Number: ${registrationNumber}` : ''}
</p>`);
  }

  // VAT
  if (vatId) {
    blocks.push(`<p>
  <strong>VAT:</strong><br>
  VAT Identification Number pursuant to § 27a German VAT Act (UStG):<br>
  ${vatId}
</p>`);
  } else if (taxNumber) {
    blocks.push(`<p>
  <strong>Tax Number:</strong> ${taxNumber}
</p>`);
  }

  // Contact
  const contactLines: string[] = [];
  if (phone) contactLines.push(`Phone: ${phone}`);
  if (fax) contactLines.push(`Fax: ${fax}`);
  if (email) contactLines.push(`Email: <a href="mailto:${email}">${email}</a>`);
  if (websiteUrl !== '#') contactLines.push(`Web: <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">${websiteDisplay}</a>`);
  if (contactLines.length > 0) {
    blocks.push(`<p>
  <strong>Contact:</strong><br>
  ${contactLines.join('<br>')}
</p>`);
  }

  // Representatives
  if (needsRep && reps.length > 0) {
    const label = a.entityType === 'ev' ? 'Board of Directors' : 'Represented by';
    blocks.push(`<p>
  <strong>${label}:</strong><br>
  ${reps.join('<br>')}
</p>`);
  }

  // Editorial responsibility
  if (a.hasEditorialContent && editorialPerson) {
    blocks.push(`<p>
  <strong>Responsible for editorial content pursuant to § 18 para. 2 MStV:</strong><br>
  ${editorialPerson}${editorialAddress ? `<br>${editorialAddress}` : ''}
</p>`);
  }

  // Professional info
  if (a.isRegulatedProfession) {
    const profLines: string[] = [];
    if (professionalTitle) profLines.push(`Professional Title: ${professionalTitle}`);
    if (titleAwardedIn) profLines.push(`Awarded in: ${titleAwardedIn}`);
    if (chamber) profLines.push(`Chamber / Association: ${chamber}`);
    if (supervisoryAuthority) profLines.push(`Supervisory Authority: ${supervisoryAuthority}`);
    if (professionalRegulations) profLines.push(`Professional Regulations: ${professionalRegulations}`);
    if (a.hasInsurance && insuranceProvider) {
      profLines.push(`Professional Liability Insurance: ${insuranceProvider}`);
      if (insuranceCoverage) profLines.push(`Coverage Area: ${insuranceCoverage}`);
    }
    if (profLines.length > 0) {
      blocks.push(`<p>
  <strong>Professional Information:</strong><br>
  ${profLines.join('<br>')}
</p>`);
    }
  }

  // EU ODR — mandatory under EU Regulation 524/2013 for all EU/EEA online sellers (de, at)
  if (a.euODR || a.operatingCountry === 'de' || a.operatingCountry === 'at') {
    blocks.push(`<p>
  <strong>EU Online Dispute Resolution:</strong><br>
  Pursuant to EU Regulation No. 524/2013, we are required to provide a link to the European Commission's Online Dispute Resolution (ODR) platform:<br>
  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a><br>
  Our email address can be found above in this legal notice.
</p>`);
  }

  // Consumer dispute resolution
  blocks.push(`<p>
  <strong>Consumer Dispute Resolution:</strong><br>
  ${a.consumerDisputeParticipation
    ? `We participate in dispute resolution proceedings before a consumer arbitration board. The competent universal arbitration board is: Zentrum für Schlichtung e.V., Straßburger Straße 8, 77694 Kehl am Rhein, Germany (<a href="https://www.verbraucher-schlichter.de" target="_blank" rel="noopener noreferrer">www.verbraucher-schlichter.de</a>).`
    : `We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.`
  }
</p>`);

  // Liability disclaimer
  if (a.includeliabilityDisclaimer) {
    blocks.push(`<p>
  <strong>Liability for Content:</strong><br>
  As a service provider, we are responsible for our own content on these pages in accordance with general law pursuant to § 7 para. 1 TMG. However, pursuant to §§ 8 to 10 TMG, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
</p>
<p>
  <strong>Liability for Links:</strong><br>
  Our website contains links to external third-party websites over whose content we have no influence. We therefore cannot accept any liability for this external content. The respective provider or operator of the linked pages is always responsible for the content of those pages.
</p>
<p>
  <strong>Copyright:</strong><br>
  The content and works on these pages created by the site operators are subject to German copyright law. Reproduction, editing, distribution and any kind of exploitation outside the limits of copyright law require the written consent of the respective author or creator.
</p>`);
  }

  return blocks.join('\n\n');
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function generateImpressum(a: ImpressumAnswers): string {
  const title = escapeHtml(a.policyTitle) || 'Impressum';
  const effectiveDateStr = formatDate(a.effectiveDate);

  let body = '';

  if (a.language === 'de') {
    body = buildDE(a);
  } else if (a.language === 'en') {
    body = buildEN(a);
  } else {
    // Both — German first, then a divider, then English
    body = `${buildDE(a)}

<hr style="border:none;border-top:1px solid #e5e7eb;margin:2rem 0;" />

<p style="color:#6b7280;font-size:0.85rem;font-style:italic;">English version below / Englische Version unten</p>

${buildEN(a)}`;
  }

  return `
<h1>${title}</h1>
${effectiveDateStr ? `<p class="policy-meta">Stand: ${effectiveDateStr}</p>` : ''}

${body}
`.trim();
}
