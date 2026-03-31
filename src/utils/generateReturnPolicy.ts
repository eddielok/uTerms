export interface ReturnPolicyAnswers {
  // Step 1: Business Info
  companyName: string;
  websiteUrl: string;
  country: string;
  contactEmail: string;

  // Step 2: Return Window & Eligibility
  returnWindowDays: string;
  returnWindowStart: 'purchase' | 'delivery';
  productTypes: ('physical' | 'digital' | 'services')[];
  eligibleItems: 'all' | 'select';
  eligibleItemsDescription: string;
  // Non-returnable exclusions
  excludeFinalSale: boolean;
  excludePerishables: boolean;
  excludeDigitalDownloads: boolean;
  excludeCustomised: boolean;
  excludeHazardous: boolean;
  excludeHygiene: boolean;
  excludeOpened: boolean;
  customExclusions: string;

  // Step 3: Refund Method & Timing
  refundToOriginal: boolean;
  refundToStoreCredit: boolean;
  refundAsExchange: boolean;
  refundProcessingDays: string;
  returnShippingPaidBy: 'customer' | 'seller' | 'depends';
  hasRestockingFee: boolean;
  restockingFeePercent: string;

  // Step 4: Return Process
  initiateByEmail: boolean;
  initiateByPortal: boolean;
  initiateInStore: boolean;
  requiresRMA: boolean;
  requiresUnused: boolean;
  requiresOriginalPackaging: boolean;
  requiresTags: boolean;
  requiresProofOfPurchase: boolean;

  // Step 5: Special Cases
  defectivePolicy: 'full-refund' | 'replacement' | 'either';
  saleItemsFinalSale: boolean;
  acceptsGiftReturns: boolean;
  giftRefundMethod: 'store-credit' | 'original-payment';
  acceptsInternationalReturns: boolean;
  internationalCustomerPaysDuties: boolean;

  // Step 6: Contact & Effective Date
  customerServicePhone: string;
  customerServiceAddress: string;
  companyRegNumber: string;
  vatNumber: string;
  effectiveDate: string;
  policyTitle: string;

  // Compliance
  gdprApplies: boolean;
  ccpaApplies: boolean;
  privacyPolicyUrl: string;
}

export const DEFAULT_RETURN_POLICY_ANSWERS: ReturnPolicyAnswers = {
  companyName: '',
  websiteUrl: '',
  country: 'England and Wales',
  contactEmail: '',
  returnWindowDays: '30',
  returnWindowStart: 'delivery',
  productTypes: ['physical'],
  eligibleItems: 'all',
  eligibleItemsDescription: '',
  excludeFinalSale: false,
  excludePerishables: false,
  excludeDigitalDownloads: true,
  excludeCustomised: true,
  excludeHazardous: false,
  excludeHygiene: true,
  excludeOpened: false,
  customExclusions: '',
  refundToOriginal: true,
  refundToStoreCredit: false,
  refundAsExchange: false,
  refundProcessingDays: '5–10',
  returnShippingPaidBy: 'customer',
  hasRestockingFee: false,
  restockingFeePercent: '',
  initiateByEmail: true,
  initiateByPortal: false,
  initiateInStore: false,
  requiresRMA: false,
  requiresUnused: true,
  requiresOriginalPackaging: true,
  requiresTags: false,
  requiresProofOfPurchase: true,
  defectivePolicy: 'either',
  saleItemsFinalSale: false,
  acceptsGiftReturns: false,
  giftRefundMethod: 'store-credit',
  acceptsInternationalReturns: false,
  internationalCustomerPaysDuties: true,
  customerServicePhone: '',
  customerServiceAddress: '',
  companyRegNumber: '',
  vatNumber: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  policyTitle: 'Return & Refund Policy',
  gdprApplies: false,
  ccpaApplies: false,
  privacyPolicyUrl: '',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function generateReturnPolicy(a: ReturnPolicyAnswers): string {
  const company = a.companyName || 'We';
  const site = a.websiteUrl || '#';
  const email = a.contactEmail || 'returns@yourcompany.com';
  const effectiveDateStr = formatDate(a.effectiveDate);
  const windowDays = a.returnWindowDays || '30';
  const windowStart = a.returnWindowStart === 'purchase' ? 'date of purchase' : 'date of delivery';

  // Build refund methods list
  const refundMethods: string[] = [];
  if (a.refundToOriginal) refundMethods.push('original payment method');
  if (a.refundToStoreCredit) refundMethods.push('store credit');
  if (a.refundAsExchange) refundMethods.push('exchange for another item');

  // Build initiation channels
  const initChannels: string[] = [];
  if (a.initiateByEmail) initChannels.push(`emailing us at <a href="mailto:${email}">${email}</a>`);
  if (a.initiateByPortal) initChannels.push('submitting a request through our online returns portal');
  if (a.initiateInStore) initChannels.push('visiting us in store');

  // Build item conditions
  const conditions: string[] = [];
  if (a.requiresUnused) conditions.push('unused and in the same condition as received');
  if (a.requiresOriginalPackaging) conditions.push('in the original packaging');
  if (a.requiresTags) conditions.push('with all tags and labels still attached');
  if (a.requiresProofOfPurchase) conditions.push('accompanied by proof of purchase (e.g. order confirmation or receipt)');

  // Build non-returnable exclusions
  const exclusions: string[] = [];
  if (a.excludeFinalSale) exclusions.push('Items marked as final sale or non-returnable at the time of purchase');
  if (a.excludePerishables) exclusions.push('Perishable goods (e.g. food, flowers, or other items with an expiry date)');
  if (a.excludeDigitalDownloads) exclusions.push(
    a.gdprApplies
      ? 'Digital content (e.g. downloads, software licences) — where you have expressly requested immediate delivery and acknowledged in writing that you thereby waive your statutory 14-day right to cancel, in accordance with Regulation 36(1)(b) of the Consumer Contracts Regulations 2013. We will obtain this express consent before download begins.'
      : 'Digital downloads or software licences once accessed or downloaded'
  );
  if (a.excludeCustomised) exclusions.push('Custom-made, personalised, or bespoke items made to your specifications');
  if (a.excludeHazardous) exclusions.push('Hazardous materials, flammable liquids, or gases');
  if (a.excludeHygiene) exclusions.push('Intimate apparel, swimwear, pierced jewellery, or other hygiene-sensitive items where the seal has been broken');
  if (a.excludeOpened) exclusions.push('Items that have been opened and are no longer in a resalable condition');
  if (a.customExclusions.trim()) {
    a.customExclusions.split('\n').map(l => l.trim()).filter(Boolean).forEach(l => exclusions.push(l));
  }

  const sections: string[] = [];
  let n = 0;
  const next = () => ++n;

  // ─── 1. Overview ─────────────────────────────────────────────────────────
  const productTypeText = a.productTypes.length > 0
    ? a.productTypes.map(t => t === 'physical' ? 'physical goods' : t === 'digital' ? 'digital products' : 'services').join(', ')
    : 'our products';

  sections.push(`<section>
  <h2>${next()}. Overview</h2>
  <p>At <strong>${company}</strong>, we want you to be completely satisfied with your purchase. This Return &amp; Refund Policy explains your rights and our procedures for returning ${productTypeText} and obtaining refunds.</p>
  <p>Please read this policy carefully before making a purchase. By completing a purchase on our website, you agree to the terms set out below.</p>
  ${a.websiteUrl ? `<p>This policy applies to purchases made at <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a>.</p>` : ''}
</section>`);

  // ─── 2. Return Window & Eligibility ──────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Return Window &amp; Eligibility</h2>
  <p>You may return eligible items within <strong>${windowDays} days</strong> of the <strong>${windowStart}</strong> for a refund or exchange, subject to the conditions described in this policy.</p>
  ${a.eligibleItems === 'select' && a.eligibleItemsDescription
    ? `<p><strong>Eligible items:</strong> ${a.eligibleItemsDescription}</p>`
    : '<p>All items are eligible for return unless otherwise stated on the product page or excluded under Section 3 of this policy.</p>'
  }
  ${conditions.length > 0 ? `<p>To be accepted for a return, items must be:</p>
  <ul>
    ${conditions.map(c => `<li>${c}</li>`).join('')}
  </ul>` : ''}
  ${a.gdprApplies ? `<p><em>Nothing in this policy affects your statutory rights under the <strong>UK Consumer Rights Act 2015</strong> or the <strong>EU Consumer Rights Directive 2011/83/EU</strong>. Your statutory rights apply in addition to, and are not limited by, the terms described above.</em></p>` : ''}
</section>`);

  // ─── 3. Statutory Right to Cancel — UK / EU (conditional) ───────────────
  if (a.gdprApplies) {
    const coolingOffExceptions: string[] = [];
    if (a.excludeDigitalDownloads) coolingOffExceptions.push('Digital content (e.g. software, downloads) once download has begun with your prior consent and acknowledgement that the right to cancel is lost');
    if (a.excludeCustomised) coolingOffExceptions.push('Goods made to your specification or clearly personalised');
    if (a.excludePerishables) coolingOffExceptions.push('Goods liable to deteriorate or expire rapidly');
    if (a.excludeHygiene) coolingOffExceptions.push('Goods not suitable for return due to health protection or hygiene reasons if unsealed after delivery');
    coolingOffExceptions.push('Sealed audio or video recordings or sealed computer software if unsealed after delivery');

    sections.push(`<section>
  <h2>${next()}. Statutory Right to Cancel (UK &amp; EU)</h2>
  <p>In addition to our standard return policy above, if you are located in the United Kingdom or European Union you have a <strong>statutory right to cancel your order within 14 days</strong> for any reason, without giving any explanation, under the <em>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013</em> (UK) and the <em>EU Consumer Rights Directive 2011/83/EU</em>.</p>
  <p>The cancellation period expires 14 days from the day you (or a third party you nominate, other than the carrier) receive(s) the goods. To exercise the right to cancel, you must inform us of your decision by a clear statement (e.g. by email) before the 14-day period has expired. You may use the model cancellation form at the end of this section, but it is not obligatory.</p>
  <p><strong>Effects of cancellation:</strong> If you cancel your order under this right, we will reimburse all payments received from you, including the cost of standard delivery (excluding any additional costs arising if you chose a type of delivery other than the least expensive type offered), no later than <strong>14 days</strong> from the day we receive the goods back or from the day you provide evidence of having returned the goods, whichever is the earlier. We will use the same means of payment as you used for the initial transaction unless you have expressly agreed otherwise. We may withhold the reimbursement until we have received the goods back.</p>
  <p>You must send back or hand over the goods without undue delay and in any event no later than 14 days from the day you communicate your cancellation. You bear the direct cost of returning the goods unless otherwise agreed.</p>
  <p>You are only liable for any diminished value of the goods resulting from handling beyond what is necessary to establish the nature, characteristics, and functioning of the goods.</p>
  <p><strong>Exceptions — the right to cancel does not apply to:</strong></p>
  <ul>
    ${coolingOffExceptions.map(e => `<li>${e}</li>`).join('')}
  </ul>
  <p><strong>Model Cancellation Form</strong> (complete and return only if you wish to cancel):</p>
  <blockquote style="border-left:3px solid #d1d5db;padding:0.75rem 1rem;margin:0.75rem 0;background:#f9fafb;">
    <p>To: ${company}${a.customerServiceAddress ? `, ${a.customerServiceAddress}` : ''}<br>
    Email: <a href="mailto:${email}">${email}</a></p>
    <p>I hereby give notice that I cancel my contract of sale for the following goods: [description of goods ordered]<br>
    Ordered on [date] / Received on [date]<br>
    Name of consumer: [your full name]<br>
    Address of consumer: [your address]<br>
    Date: [date]</p>
  </blockquote>
</section>`);
  }

  // ─── Non-Returnable Items (conditional) ───────────────────────────────────
  if (exclusions.length > 0) {
    sections.push(`<section>
  <h2>${next()}. Non-Returnable Items</h2>
  <p>The following items are not eligible for return or refund:</p>
  <ul>
    ${exclusions.map(e => `<li>${e}</li>`).join('')}
  </ul>
  <p>If you are unsure whether your item qualifies for a return, please contact us before initiating a return.</p>
</section>`);
  }

  // ─── 4. How to Initiate a Return ─────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. How to Initiate a Return</h2>
  ${initChannels.length > 0
    ? `<p>To start a return, please contact us by ${initChannels.join(', or by ')} within the return window.</p>`
    : `<p>To start a return, please contact us at <a href="mailto:${email}">${email}</a> within the return window.</p>`
  }
  ${a.requiresRMA ? `<p><strong>Return Authorisation (RMA):</strong> A return must be authorised before you ship any item back to us. We will provide you with a Return Merchandise Authorisation (RMA) number and return instructions. Items returned without an RMA number may be refused or subject to delay.</p>` : ''}
  <p>Please include in your message: your order number, the item(s) you wish to return, and the reason for your return. We will respond within 2 business days with further instructions.</p>
  ${a.gdprApplies ? `<p><strong>Data privacy:</strong> Any personal data you provide during the return process (such as your name, address, order details, or correspondence) will be collected and processed solely for the purpose of handling your return. This data is processed in accordance with our ${a.privacyPolicyUrl ? `<a href="${a.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>` : 'Privacy Policy'}, which sets out your rights under the UK GDPR / EU GDPR, including your rights of access, rectification, and erasure.</p>` : ''}
</section>`);

  // ─── 5. Refund Method & Processing ───────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Refund Method &amp; Processing Time</h2>
  ${refundMethods.length > 0
    ? `<p>Refunds will be issued via your choice of: <strong>${refundMethods.join(', ')}</strong>, subject to eligibility.</p>`
    : '<p>Refunds will be issued to the original payment method used at the time of purchase.</p>'
  }
  <p>Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed within <strong>${a.refundProcessingDays || '5–10'} business days</strong>. Please note that your bank or card issuer may require additional time to post the credit to your account.</p>
  ${a.gdprApplies ? `<p><strong>UK &amp; EU statutory requirement:</strong> Where you cancel an order under your statutory 14-day right to cancel, we will issue your refund within <strong>14 days</strong> of receiving the returned goods or receiving proof of return postage (whichever is earlier). This legal deadline applies regardless of our standard processing timeline.</p>` : ''}
  <p>We reserve the right to refuse a refund if the item does not meet the return conditions set out in this policy.</p>
</section>`);

  // ─── 6. Return Shipping ───────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Return Shipping</h2>
  ${a.returnShippingPaidBy === 'seller'
    ? `<p>We will cover the cost of return shipping. We will provide you with a prepaid return shipping label upon approval of your return request.</p>`
    : a.returnShippingPaidBy === 'depends'
    ? `<p>Return shipping costs depend on the reason for the return. If the item is defective, damaged, or we made an error, we will cover the return shipping cost and provide a prepaid label. For all other returns (e.g. change of mind), return shipping is at your own cost.</p>`
    : `<p>You are responsible for paying the cost of return shipping. Shipping costs are non-refundable. We recommend using a trackable shipping service or purchasing shipping insurance, as we cannot guarantee receipt of your returned item.</p>`
  }
  ${a.hasRestockingFee && a.restockingFeePercent
    ? a.gdprApplies
      ? `<p><strong>Restocking Fee:</strong> A restocking fee of <strong>${a.restockingFeePercent}%</strong> applies to returns made outside the statutory cancellation period (i.e. after 14 days from delivery for UK / EU customers). <strong>This fee is automatically waived for any return initiated within the 14-day statutory cancellation window.</strong> Within that window, we may only deduct value where the item has been handled beyond what is necessary to establish its nature, characteristics, and functioning — and only to the extent of the actual diminution in value.</p>`
      : `<p><strong>Restocking Fee:</strong> A restocking fee of <strong>${a.restockingFeePercent}%</strong> of the item price may be deducted from your refund for certain returns. We will notify you if a restocking fee applies before processing your return.</p>`
    : a.gdprApplies
    ? `<p><strong>UK &amp; EU customers:</strong> We do not charge a restocking fee. Under UK and EU consumer law, we may only make a deduction from your refund where you have handled an item beyond what is necessary to establish its nature, characteristics, and functioning, and only to the extent of any diminution in value.</p>`
    : ''
  }
</section>`);

  // ─── 7. Exchanges (conditional) ───────────────────────────────────────────
  if (a.refundAsExchange) {
    sections.push(`<section>
  <h2>${next()}. Exchanges</h2>
  <p>If you would like to exchange an item for a different size, colour, or product, please initiate a return as described above and indicate that you would prefer an exchange. Exchanges are subject to product availability.</p>
  <p>If the replacement item is of greater value, you will be charged the difference. If it is of lesser value, we will refund the difference to your original payment method or as store credit.</p>
</section>`);
  }

  // ─── 8. Damaged, Defective, or Incorrect Items ───────────────────────────
  sections.push(`<section>
  <h2>${next()}. Damaged, Defective, or Incorrect Items</h2>
  <p>If you receive an item that is damaged, defective, or not what you ordered, please contact us within <strong>7 days</strong> of receiving your order at <a href="mailto:${email}">${email}</a>. Please include your order number and a description (and photo where possible) of the issue.</p>
  ${a.defectivePolicy === 'full-refund'
    ? '<p>We will arrange a full refund, including any original and return shipping costs, for all confirmed damaged, defective, or incorrect items.</p>'
    : a.defectivePolicy === 'replacement'
    ? '<p>We will ship a replacement item at no additional cost for all confirmed damaged, defective, or incorrect items.</p>'
    : '<p>We will offer you the choice of a full refund (including shipping costs) or a replacement item for all confirmed damaged, defective, or incorrect items.</p>'
  }
  <p>We will cover all return shipping costs for items that are confirmed to be defective, damaged in transit, or incorrectly fulfilled.</p>
</section>`);

  // ─── 9. Sale & Promotional Items (conditional) ────────────────────────────
  if (a.saleItemsFinalSale) {
    sections.push(`<section>
  <h2>${next()}. Sale &amp; Promotional Items</h2>
  <p>Items purchased at a reduced price during a sale, promotional event, or using a discount code are considered final sale and are not eligible for return or refund unless they are defective or damaged upon arrival.</p>
  <p>This includes items purchased during seasonal sales, clearance events, flash sales, and promotional bundles.</p>
  ${a.gdprApplies ? `<p><strong>UK &amp; EU customers — important:</strong> Notwithstanding the above, the "final sale" designation does <strong>not</strong> override your statutory rights. If you purchased online and are located in the UK or EU, you retain the full 14-day right to cancel under the Consumer Contracts Regulations 2013 and EU Consumer Rights Directive 2011/83/EU, regardless of whether an item was discounted or purchased during a sale. Exceptions apply only to bespoke, perishable, hygiene-sensitive, and digital items as described in the Non-Returnable Items section of this policy.</p>` : ''}
</section>`);
  }

  // ─── 10. Gift Returns (conditional) ──────────────────────────────────────
  if (a.acceptsGiftReturns) {
    sections.push(`<section>
  <h2>${next()}. Gift Returns</h2>
  <p>If you received an item as a gift and wish to return it, you are welcome to do so within the standard return window from the date of original purchase, subject to the conditions in this policy.</p>
  <p>Gift returns will be refunded as ${a.giftRefundMethod === 'store-credit' ? '<strong>store credit</strong> to the gift recipient' : 'a refund to the <strong>original purchaser&rsquo;s payment method</strong>'}. Please contact us at <a href="mailto:${email}">${email}</a> with your order number (found on the gift receipt or packing slip) to arrange a gift return.</p>
</section>`);
  }

  // ─── 11. International Returns (conditional) ──────────────────────────────
  if (a.acceptsInternationalReturns) {
    sections.push(`<section>
  <h2>${next()}. International Returns</h2>
  <p>We accept returns from international orders. The return must be initiated and the item shipped back to us within the standard return window from the date of delivery.</p>
  ${a.internationalCustomerPaysDuties
    ? '<p>International customers are responsible for all return shipping costs, import duties, taxes, and customs fees. We strongly recommend using a tracked and insured shipping service. We are not responsible for items lost or damaged in return transit.</p>'
    : '<p>We will provide a prepaid return shipping label for international returns. Please note that duties, taxes, and customs clearance are handled by us upon receipt of your return.</p>'
  }
  <p>Original shipping charges are non-refundable for international orders unless the item was defective, damaged, or incorrect.</p>
</section>`);
  }

  // ─── CCPA / CPRA (conditional) ────────────────────────────────────────────
  if (a.ccpaApplies) {
    sections.push(`<section>
  <h2>${next()}. California Consumer Privacy Rights (CCPA / CPRA)</h2>
  <p>If you are a California resident, the <em>California Consumer Privacy Act (CCPA)</em> and <em>California Privacy Rights Act (CPRA)</em> grant you certain rights regarding personal information we collect in connection with your purchases and returns.</p>
  <p><strong>Your rights include:</strong></p>
  <ul>
    <li><strong>Right to Know:</strong> You may request disclosure of the categories and specific pieces of personal information we have collected about you, including purchase and return history, and how that information is used or shared.</li>
    <li><strong>Right to Delete:</strong> You may request that we delete personal information we have collected from you. Note that we may retain certain data as required or permitted by law (e.g. for tax records, fraud prevention, warranty fulfilment, or legal compliance).</li>
    <li><strong>Right to Correct:</strong> You may request that we correct inaccurate personal information we hold about you.</li>
    <li><strong>Right to Non-Discrimination:</strong> Exercising any CCPA right will not affect your ability to make a return, receive a refund, or otherwise use our services under this policy. We will not deny, charge a different price for, or provide a different level of service because you exercised a privacy right.</li>
  </ul>
  ${a.privacyPolicyUrl
    ? `<p>For full details on how we collect, use, and disclose personal information, and to submit a CCPA / CPRA rights request, please see our <a href="${a.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>`
    : '<p>For full details on how we collect, use, and disclose personal information, and to submit a rights request, please refer to our Privacy Policy.</p>'
  }
  <p>To submit a request, contact us at <a href="mailto:${email}">${email}</a>. We will respond within the timeframe required by applicable law.</p>
</section>`);
  }

  // ─── Contact ─────────────────────────────────────────────────────────────
  sections.push(`<section>
  <h2>${next()}. Contact Us</h2>
  <p>If you have any questions about our Return &amp; Refund Policy, please get in touch:</p>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
    ${a.customerServicePhone ? `<li><strong>Phone:</strong> ${a.customerServicePhone}</li>` : ''}
    ${a.customerServiceAddress ? `<li><strong>Address:</strong> ${a.customerServiceAddress}</li>` : ''}
    ${a.companyName ? `<li><strong>Company:</strong> ${a.companyName}</li>` : ''}
    ${a.companyRegNumber ? `<li><strong>Company Registration Number:</strong> ${a.companyRegNumber}</li>` : ''}
    ${a.vatNumber ? `<li><strong>VAT Number:</strong> ${a.vatNumber}</li>` : ''}
    ${a.websiteUrl ? `<li><strong>Website:</strong> <a href="${site}" target="_blank" rel="noopener noreferrer">${a.websiteUrl}</a></li>` : ''}
  </ul>
</section>`);

  return `
<h1>${a.policyTitle || 'Return &amp; Refund Policy'}</h1>
<p class="policy-meta">Last updated: ${effectiveDateStr}</p>

${sections.join('\n\n')}
`.trim();
}
