// Called only with a Checkout Session fetched through the authenticated Stripe client.
// Never take tax amounts, prices or totals from the browser or webhook snapshot.
const cents = value => Number.isSafeInteger(value) && value >= 0;
export function exclusiveTaxTotal(session, config) {
  const tax = session.automatic_tax;
  const totals = session.total_details;
  const line = session.line_items?.data?.[0];
  const price = line?.price;
  const exclusivePrice = price?.tax_behavior === 'exclusive' ||
    (price?.tax_behavior === 'unspecified' && config.exclusiveDefaultVerified === true);

  if (config.taxMode !== 'stripe-exclusive' || tax?.enabled !== true || tax.status !== 'complete' ||
      tax.provider !== 'stripe' || (tax.liability !== null && tax.liability?.type !== 'self') ||
      !exclusivePrice || price.currency !== config.currency || price.unit_amount !== config.amount ||
      price.type !== 'one_time' || line.currency !== config.currency ||
      !cents(totals?.amount_tax) || totals.amount_discount !== 0 || totals.amount_shipping !== 0 ||
      session.amount_subtotal !== config.amount || !cents(session.amount_total) ||
      session.amount_total !== config.amount + totals.amount_tax ||
      line.amount_subtotal !== config.amount || line.amount_discount !== 0 ||
      line.amount_tax !== totals.amount_tax || line.amount_total !== session.amount_total ||
      session.allow_promotion_codes === true || (session.discounts?.length ?? 0) !== 0) {
    throw Error('TAX_TOTAL_REJECTED');
  }
  // Complete automatic calculation can legitimately be zero. No local tax-rate guess.
  return session.amount_total;
}
