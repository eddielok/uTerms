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
  euODR: false,
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
  const address = [a.street, `${a.postcode} ${a.city}`.trim(), a.state, a.country]
    .filter(Boolean).join('<br>');
  const reps = a.representatives.filter(Boolean);
  const hasReg = REGISTERED_IN_HANDELSREGISTER.includes(a.entityType);
  const needsRep = REGISTERED_ENTITIES.includes(a.entityType);

  let blocks: string[] = [];

  // Header
  blocks.push(`<p><strong>${legalBasisDE(a.operatingCountry)}</strong></p>`);

  // Company info
  blocks.push(`<p>
  <strong>${a.companyName}${entityLabel ? ` ${entityLabel}` : ''}</strong><br>
  ${address}
</p>`);

  // Handelsregister
  if (hasReg && (a.registrationCourt || a.registrationNumber)) {
    blocks.push(`<p>
  <strong>Handelsregister:</strong><br>
  ${a.registrationCourt ? `Registergericht: ${a.registrationCourt}<br>` : ''}
  ${a.registrationNumber ? `Registernummer: ${a.registrationNumber}` : ''}
</p>`);
  }

  // VAT
  if (a.vatId) {
    blocks.push(`<p>
  <strong>Umsatzsteuer:</strong><br>
  Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br>
  ${a.vatId}
</p>`);
  } else if (a.taxNumber) {
    blocks.push(`<p>
  <strong>Steuernummer:</strong> ${a.taxNumber}
</p>`);
  }

  // Contact
  const contactLines: string[] = [];
  if (a.phone) contactLines.push(`Telefon: ${a.phone}`);
  if (a.fax) contactLines.push(`Telefax: ${a.fax}`);
  if (a.email) contactLines.push(`E-Mail: <a href="mailto:${a.email}">${a.email}</a>`);
  if (a.websiteUrl) contactLines.push(`Web: <a href="${a.websiteUrl}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a>`);
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
  if (a.hasEditorialContent && a.editorialPerson) {
    blocks.push(`<p>
  <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong><br>
  ${a.editorialPerson}${a.editorialAddress ? `<br>${a.editorialAddress}` : ''}
</p>`);
  }

  // Professional info
  if (a.isRegulatedProfession) {
    const profLines: string[] = [];
    if (a.professionalTitle) profLines.push(`Berufsbezeichnung: ${a.professionalTitle}`);
    if (a.titleAwardedIn) profLines.push(`Verliehen in: ${a.titleAwardedIn}`);
    if (a.chamber) profLines.push(`Kammer: ${a.chamber}`);
    if (a.supervisoryAuthority) profLines.push(`Aufsichtsbehörde: ${a.supervisoryAuthority}`);
    if (a.professionalRegulations) profLines.push(`Berufsrechtliche Regelungen: ${a.professionalRegulations}`);
    if (a.hasInsurance && a.insuranceProvider) {
      profLines.push(`Berufshaftpflichtversicherung: ${a.insuranceProvider}`);
      if (a.insuranceCoverage) profLines.push(`Geltungsbereich: ${a.insuranceCoverage}`);
    }
    if (profLines.length > 0) {
      blocks.push(`<p>
  <strong>Berufsrechtliche Angaben:</strong><br>
  ${profLines.join('<br>')}
</p>`);
    }
  }

  // EU ODR
  if (a.euODR) {
    blocks.push(`<p>
  <strong>EU-Streitschlichtung:</strong><br>
  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br>
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
  const address = [a.street, `${a.postcode} ${a.city}`.trim(), a.state, a.country]
    .filter(Boolean).join('<br>');
  const reps = a.representatives.filter(Boolean);
  const hasReg = REGISTERED_IN_HANDELSREGISTER.includes(a.entityType);
  const needsRep = REGISTERED_ENTITIES.includes(a.entityType);

  let blocks: string[] = [];

  // Header
  blocks.push(`<p><strong>${legalBasisEN(a.operatingCountry)}</strong></p>`);

  // Company info
  blocks.push(`<p>
  <strong>${a.companyName}${entityLabel ? ` — ${entityLabel}` : ''}</strong><br>
  ${address}
</p>`);

  // Commercial register
  if (hasReg && (a.registrationCourt || a.registrationNumber)) {
    blocks.push(`<p>
  <strong>Commercial Register:</strong><br>
  ${a.registrationCourt ? `Registry Court: ${a.registrationCourt}<br>` : ''}
  ${a.registrationNumber ? `Registration Number: ${a.registrationNumber}` : ''}
</p>`);
  }

  // VAT
  if (a.vatId) {
    blocks.push(`<p>
  <strong>VAT:</strong><br>
  VAT Identification Number pursuant to § 27a German VAT Act (UStG):<br>
  ${a.vatId}
</p>`);
  } else if (a.taxNumber) {
    blocks.push(`<p>
  <strong>Tax Number:</strong> ${a.taxNumber}
</p>`);
  }

  // Contact
  const contactLines: string[] = [];
  if (a.phone) contactLines.push(`Phone: ${a.phone}`);
  if (a.fax) contactLines.push(`Fax: ${a.fax}`);
  if (a.email) contactLines.push(`Email: <a href="mailto:${a.email}">${a.email}</a>`);
  if (a.websiteUrl) contactLines.push(`Web: <a href="${a.websiteUrl}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a>`);
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
  if (a.hasEditorialContent && a.editorialPerson) {
    blocks.push(`<p>
  <strong>Responsible for editorial content pursuant to § 18 para. 2 MStV:</strong><br>
  ${a.editorialPerson}${a.editorialAddress ? `<br>${a.editorialAddress}` : ''}
</p>`);
  }

  // Professional info
  if (a.isRegulatedProfession) {
    const profLines: string[] = [];
    if (a.professionalTitle) profLines.push(`Professional Title: ${a.professionalTitle}`);
    if (a.titleAwardedIn) profLines.push(`Awarded in: ${a.titleAwardedIn}`);
    if (a.chamber) profLines.push(`Chamber / Association: ${a.chamber}`);
    if (a.supervisoryAuthority) profLines.push(`Supervisory Authority: ${a.supervisoryAuthority}`);
    if (a.professionalRegulations) profLines.push(`Professional Regulations: ${a.professionalRegulations}`);
    if (a.hasInsurance && a.insuranceProvider) {
      profLines.push(`Professional Liability Insurance: ${a.insuranceProvider}`);
      if (a.insuranceCoverage) profLines.push(`Coverage Area: ${a.insuranceCoverage}`);
    }
    if (profLines.length > 0) {
      blocks.push(`<p>
  <strong>Professional Information:</strong><br>
  ${profLines.join('<br>')}
</p>`);
    }
  }

  // EU ODR
  if (a.euODR) {
    blocks.push(`<p>
  <strong>EU Online Dispute Resolution:</strong><br>
  The European Commission provides a platform for online dispute resolution (ODR):<br>
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
  const title = a.policyTitle || 'Impressum';
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
