export interface ShippingPolicyAnswers {
  // Step 1: Business Info
  companyName: string;
  websiteUrl: string;
  country: string;
  businessType: string;

  // Step 2: Shipping Destinations
  shipsInternationally: boolean;
  internationalCoverage: 'worldwide' | 'europe' | 'north-america' | 'asia-pacific' | 'custom';
  customCoverageDescription: string;
  excludedCountries: string;

  // Step 3: Shipping Methods & Costs
  currency: string;
  offersFreeShipping: boolean;
  freeShippingThreshold: string;
  offersStandard: boolean;
  standardCost: string;
  standardDays: string;
  offersExpress: boolean;
  expressCost: string;
  expressDays: string;
  offersOvernight: boolean;
  overnightCost: string;
  overnightDays: string;
  offersClickAndCollect: boolean;

  // Step 4: Processing & Dispatch
  processingTime: string;
  cutoffTime: string;
  dispatchDays: 'mon-fri' | 'mon-sat' | 'everyday';
  peakPeriodWarning: boolean;
  handlesPreorders: boolean;

  // Step 5: Carriers & Tracking
  carriers: string[];
  otherCarrier: string;
  providesTracking: boolean;
  trackingNotification: 'email' | 'sms' | 'both' | 'none';
  requiresSignature: boolean;

  // Step 6: Special Cases
  lostPackagePolicy: 'replacement' | 'refund' | 'either';
  damagedPolicy: 'replacement' | 'refund' | 'either';
  handleUndeliverable: boolean;
  acceptsPOBox: boolean;
  remoteAreaSurcharge: boolean;
  customerPaysCustoms: boolean;

  // Step 7: Contact & Generate
  contactEmail: string;
  effectiveDate: string;
  policyTitle: string;
}

export const DEFAULT_SHIPPING_POLICY_ANSWERS: ShippingPolicyAnswers = {
  companyName: '',
  websiteUrl: '',
  country: 'United Kingdom',
  businessType: 'E-commerce Store',
  shipsInternationally: false,
  internationalCoverage: 'worldwide',
  customCoverageDescription: '',
  excludedCountries: '',
  currency: 'GBP (£)',
  offersFreeShipping: true,
  freeShippingThreshold: '50',
  offersStandard: true,
  standardCost: '3.99',
  standardDays: '3–5',
  offersExpress: false,
  expressCost: '',
  expressDays: '1–2',
  offersOvernight: false,
  overnightCost: '',
  overnightDays: '1',
  offersClickAndCollect: false,
  processingTime: '1–2',
  cutoffTime: '14:00',
  dispatchDays: 'mon-fri',
  peakPeriodWarning: true,
  handlesPreorders: false,
  carriers: ['Royal Mail'],
  otherCarrier: '',
  providesTracking: true,
  trackingNotification: 'email',
  requiresSignature: false,
  lostPackagePolicy: 'either',
  damagedPolicy: 'either',
  handleUndeliverable: true,
  acceptsPOBox: false,
  remoteAreaSurcharge: false,
  customerPaysCustoms: true,
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  policyTitle: 'Shipping Policy',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

const COVERAGE_LABELS: Record<string, string> = {
  worldwide: 'worldwide',
  europe: 'to countries across Europe',
  'north-america': 'to the United States and Canada',
  'asia-pacific': 'to countries in the Asia-Pacific region',
  custom: '',
};

const DISPATCH_DAYS_LABELS: Record<string, string> = {
  'mon-fri': 'Monday to Friday (excluding public holidays)',
  'mon-sat': 'Monday to Saturday (excluding public holidays)',
  'everyday': 'seven days a week (excluding public holidays)',
};

export function generateShippingPolicy(a: ShippingPolicyAnswers): string {
  const company = a.companyName || 'We';
  const site = a.websiteUrl || '#';
  const email = a.contactEmail || 'support@yourcompany.com';
  const effectiveDateStr = formatDate(a.effectiveDate);
  const currencySymbol = a.currency.includes('£') ? '£' : a.currency.includes('$') ? '$' : a.currency.includes('€') ? '€' : '';

  const sections: string[] = [];
  let n = 0;
  const next = () => ++n;

  // ─── 1. Overview ─────────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Overview</h2>
  <p>Thank you for shopping with <strong>${company}</strong>${a.websiteUrl ? ` at <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a>` : ''}. This Shipping Policy explains how we process, dispatch, and deliver your orders, and what to do if something goes wrong.</p>
  <p>By placing an order with us, you agree to the terms set out in this policy. Please read it carefully before completing your purchase.</p>
</section>`);

  // ─── 2. Shipping Destinations ────────────────────────────────────────────
  const coverageText = a.internationalCoverage === 'custom' && a.customCoverageDescription
    ? a.customCoverageDescription
    : COVERAGE_LABELS[a.internationalCoverage] || 'worldwide';

  sections.push(`<section>
  <h2>${next()}. Shipping Destinations</h2>
  ${a.shipsInternationally
    ? `<p>We ship ${coverageText}. If your country or region is not listed at checkout, unfortunately we are unable to fulfil your order at this time.</p>`
    : `<p>We currently ship to addresses within <strong>${a.country}</strong> only. We do not offer international shipping at this time. Please check back in the future as we plan to expand our delivery regions.</p>`
  }
  ${a.excludedCountries.trim()
    ? `<p><strong>We do not currently ship to the following countries or regions:</strong></p><p>${a.excludedCountries.trim().replace(/\n/g, ', ')}</p>`
    : ''
  }
  ${!a.acceptsPOBox ? `<p>We are currently unable to deliver to PO Box addresses. Please provide a full street address when placing your order.</p>` : ''}
</section>`);

  // ─── 3. Shipping Methods & Delivery Timeframes ───────────────────────────
  const methods: string[] = [];
  if (a.offersFreeShipping) methods.push(`<tr><td><strong>Free Shipping</strong></td><td>Orders over ${currencySymbol}${a.freeShippingThreshold}</td><td>Same as standard delivery</td></tr>`);
  if (a.offersStandard) methods.push(`<tr><td><strong>Standard Delivery</strong></td><td>${currencySymbol}${a.standardCost}</td><td>${a.standardDays} business days</td></tr>`);
  if (a.offersExpress) methods.push(`<tr><td><strong>Express Delivery</strong></td><td>${currencySymbol}${a.expressCost}</td><td>${a.expressDays} business days</td></tr>`);
  if (a.offersOvernight) methods.push(`<tr><td><strong>Next-Day Delivery</strong></td><td>${currencySymbol}${a.overnightCost}</td><td>${a.overnightDays} business day</td></tr>`);
  if (a.offersClickAndCollect) methods.push(`<tr><td><strong>Click &amp; Collect</strong></td><td>Free</td><td>Ready within 1–2 business days</td></tr>`);

  sections.push(`<section>
  <h2>${next()}. Shipping Methods &amp; Delivery Timeframes</h2>
  <p>We offer the following shipping options at checkout:</p>
  ${methods.length > 0
    ? `<table style="width:100%;border-collapse:collapse;margin:0.75rem 0;">
    <thead><tr style="background:#f3f4f6;"><th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Method</th><th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Cost</th><th style="text-align:left;padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">Estimated Delivery</th></tr></thead>
    <tbody>${methods.map(m => m.replace(/<td>/g, '<td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;">')).join('')}</tbody>
  </table>`
    : ''
  }
  <p>Delivery timeframes are <strong>estimates only</strong> and begin from the date your order is dispatched, not the date of purchase. Actual delivery times may vary due to carrier delays, customs processing, or circumstances outside our control.</p>
  <p>In any event, if your order has not been delivered within <strong>30 days</strong> of the dispatch date, you are entitled to a full refund. This right is in addition to any other remedy available to you under applicable consumer protection law.</p>
  ${a.requiresSignature ? `<p>Some deliveries may require a signature upon receipt. If you are not available when delivery is attempted, the carrier will leave a card with instructions for re-delivery or collection.</p>` : ''}
</section>`);

  // ─── 4. Order Processing Times ───────────────────────────────────────────
  const dispatchDaysLabel = DISPATCH_DAYS_LABELS[a.dispatchDays] || 'Monday to Friday';

  sections.push(`<section>
  <h2>${next()}. Order Processing Times</h2>
  <p>All orders are subject to a processing period before dispatch. Orders are typically processed within <strong>${a.processingTime} business days</strong> of payment confirmation.</p>
  ${a.cutoffTime ? `<p>Orders placed before <strong>${a.cutoffTime}</strong> on a business day will begin processing the same day. Orders placed after this time, or on weekends and public holidays, will begin processing the next business day.</p>` : ''}
  <p>We dispatch orders <strong>${dispatchDaysLabel}</strong>. Orders placed on non-dispatch days will be processed and dispatched on the next available business day.</p>
  ${a.peakPeriodWarning ? `<p><strong>Peak periods:</strong> During busy periods such as Christmas, Black Friday, and other sale events, processing and delivery times may be longer than usual. We will endeavour to communicate any significant delays via our website or by email.</p>` : ''}
  ${a.handlesPreorders ? `<p><strong>Pre-orders and back-orders:</strong> Items available for pre-order or listed as back-ordered will be dispatched as soon as stock is available. The estimated dispatch date will be noted on the product page or in your order confirmation email.</p>` : ''}
  <p>You will receive a dispatch confirmation email once your order has been shipped.</p>
</section>`);

  // ─── 5. Free Shipping (conditional) ──────────────────────────────────────
  if (a.offersFreeShipping) {
    sections.push(`<section>
  <h2>${next()}. Free Shipping</h2>
  <p>We offer <strong>free standard shipping</strong> on all orders over <strong>${currencySymbol}${a.freeShippingThreshold}</strong>${a.shipsInternationally ? ' (applies to domestic orders only unless otherwise stated at checkout)' : ''}. The free shipping threshold is calculated on the order subtotal after any discounts are applied, and before taxes and other fees.</p>
  <p>Free shipping is delivered via our standard delivery service. If you require express or next-day delivery, standard shipping charges will apply regardless of order value.</p>
</section>`);
  }

  // ─── 6. Carriers & Tracking ──────────────────────────────────────────────
  const allCarriers = [...a.carriers];
  if (a.otherCarrier.trim()) allCarriers.push(a.otherCarrier.trim());

  sections.push(`<section>
  <h2>${next()}. Shipping Carriers &amp; Tracking</h2>
  ${allCarriers.length > 0
    ? `<p>We use the following carrier${allCarriers.length > 1 ? 's' : ''} to deliver your orders: <strong>${allCarriers.join(', ')}</strong>. The carrier used for your specific order will depend on your location, the size and weight of your parcel, and the shipping method selected.</p>`
    : `<p>We work with a range of trusted shipping carriers to deliver your orders. The carrier used will depend on your location and chosen delivery method.</p>`
  }
  ${a.providesTracking
    ? `<p><strong>Order tracking:</strong> Once your order has been dispatched, you will receive a ${a.trackingNotification === 'email' ? 'confirmation email' : a.trackingNotification === 'sms' ? 'SMS notification' : 'confirmation email and SMS'} containing your tracking number and a link to track your parcel. Please allow up to 24 hours for tracking information to update after your dispatch notification.</p>`
    : `<p>We do not currently offer order tracking for all shipments. You will receive a dispatch confirmation when your order has been sent.</p>`
  }
  ${a.remoteAreaSurcharge ? `<p><strong>Remote and rural areas:</strong> Deliveries to certain remote, rural, or island locations may be subject to an additional surcharge or extended delivery timeframe. Any applicable surcharge will be displayed at checkout before you complete your order.</p>` : ''}
</section>`);

  // ─── 7. International Shipping & Customs (conditional) ───────────────────
  if (a.shipsInternationally) {
    sections.push(`<section>
  <h2>${next()}. International Shipping &amp; Customs</h2>
  <p>We ship internationally ${coverageText}. International delivery timeframes vary by destination and are estimates only. Please allow additional time for customs clearance, which can add several business days to the delivery.</p>
  ${a.customerPaysCustoms
    ? `<p><strong>Customs, duties, and taxes:</strong> International orders may be subject to import duties, taxes, VAT, and customs clearance fees imposed by the destination country. These charges are <strong>the responsibility of the recipient</strong> and are not included in the price of your order or shipping cost. We have no control over these charges and cannot predict their amount. We recommend contacting your local customs office for information before placing your order.</p>
  <p>If you refuse to pay customs duties and the package is returned to us, we reserve the right to deduct the return shipping cost and any customs handling fees from your refund.</p>`
    : `<p>We cover the cost of customs duties and import taxes for international orders where possible. However, in some jurisdictions, local regulations require that duties be paid by the recipient. If this applies to your order, we will notify you in advance.</p>`
  }
  <p><strong>EU customers — VAT and import handling fees:</strong> Since 1 July 2021, VAT is due on all goods entering the EU, including items valued under €150. Unless VAT is collected at the point of sale (via the Import One-Stop Shop, or IOSS), it will be collected by the carrier upon delivery, along with a carrier handling fee. Unless otherwise stated at checkout, VAT and any carrier handling fees are the responsibility of the recipient and will be collected before delivery is made.</p>
  <p>International shipments may be subject to customs inspection, which is outside our control. <strong>${company}</strong> is not responsible for delays caused by customs processing.</p>
</section>`);
  }

  // ─── 8. Lost, Missing & Damaged Packages ─────────────────────────────────
  const lostResolution = a.lostPackagePolicy === 'refund'
    ? 'a full refund of the order value'
    : a.lostPackagePolicy === 'replacement'
    ? 'a replacement shipment at no additional cost'
    : 'a full refund or a replacement shipment (at your choice)';

  const damagedResolution = a.damagedPolicy === 'refund'
    ? 'a full refund'
    : a.damagedPolicy === 'replacement'
    ? 'a replacement item dispatched at no additional cost'
    : 'a full refund or a replacement item (at your choice)';

  sections.push(`<section>
  <h2>${next()}. Lost, Missing &amp; Damaged Packages</h2>
  <p><strong>Lost or missing packages:</strong> If your tracked order has not arrived within <strong>5 business days</strong> after the estimated delivery date, please contact us at <a href="mailto:${email}">${email}</a> with your order number. We will open an investigation with the carrier on your behalf. Investigations can take up to 10 business days. If the package is confirmed lost, we will provide ${lostResolution}.</p>
  <p><strong>Damaged in transit:</strong> If your order arrives damaged, please contact us within <strong>48 hours</strong> of delivery with your order number and clear photographs of the damaged item and packaging. We will arrange ${damagedResolution}. Please retain all original packaging, as the carrier may require it for a damage claim.</p>
  <p><strong>Incorrect items:</strong> If you receive an incorrect item, please contact us within <strong>7 days</strong> of delivery. We will arrange for the correct item to be sent and cover the return shipping cost for the incorrect item.</p>
  <p>We strongly recommend selecting a tracked shipping option, particularly for high-value orders. Regardless of the shipping method used, if your order does not arrive you remain entitled to a remedy under applicable consumer protection law.</p>
</section>`);

  // ─── 9. Undeliverable & Returned Packages (conditional) ──────────────────
  if (a.handleUndeliverable) {
    sections.push(`<section>
  <h2>${next()}. Undeliverable &amp; Returned Packages</h2>
  <p>A package may be returned to us if the delivery address provided was incorrect or incomplete, if the recipient was unavailable after multiple delivery attempts, if the package was refused at delivery, or if it was unclaimed from a collection point.</p>
  <p>If your package is returned to us, we will contact you using the email address on your order. You will have the option to have the order reshipped (at an additional shipping cost) or receive a refund. For orders returned due to non-collection or an incorrect address provided by the customer, a refund of the item value will be issued; original shipping costs are non-refundable in these circumstances. Where a return arises from our error, or is exercised within your 14-day statutory right to cancel, the standard outbound shipping cost you paid will also be refunded.</p>
  <p>Please ensure your delivery address — including postcode, apartment or unit number, and any access instructions — is correct before completing your order. <strong>${company}</strong> is not responsible for packages that are undeliverable due to an error in the delivery address provided by the customer.</p>
</section>`);
  }

  // ─── 10. Changes to This Policy ──────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Changes to This Policy</h2>
  <p>We reserve the right to update this Shipping Policy at any time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically. Your continued use of our website and services after any changes are posted constitutes your acceptance of the updated policy.</p>
  <p>This Shipping Policy was last updated on <strong>${effectiveDateStr}</strong>.</p>
</section>`);

  // ─── 11. Contact Us ───────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Contact Us</h2>
  <p>If you have any questions about our shipping practices or need help with an order, please get in touch:</p>
  <ul>
    ${a.companyName ? `<li><strong>Company:</strong> ${a.companyName}</li>` : ''}
    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
    ${a.websiteUrl ? `<li><strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a></li>` : ''}
  </ul>
</section>`);

  return `
<h1>${a.policyTitle || 'Shipping Policy'}</h1>
<p class="policy-meta">Last updated: ${effectiveDateStr}</p>

${sections.join('\n\n')}
`.trim();
}
