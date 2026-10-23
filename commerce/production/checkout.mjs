import { configuration } from './core.mjs';
// Pure server-side parameter builder. No SDK call, endpoint, session creation or credentials.
// Deployment must first verify registration, product classification and exclusive price behavior.
export function checkoutParameters(config) {
  const c = configuration(config);
  return {
    mode: 'payment',
    customer_creation: 'if_required',
    line_items: [{ price: c.price, quantity: 1 }],
    metadata: { sku: c.sku },
    automatic_tax: { enabled: true, liability: { type: 'self' } },
    billing_address_collection: 'required',
    allow_promotion_codes: false,
    adaptive_pricing: { enabled: false },
    success_url: `${c.origin}/api/workbook/success`,
    cancel_url: `${c.origin}/api/workbook/cancel`,
    integration_identifier: 'bluedobie_workbook_tax_v1_qmztpkra'
  };
}
