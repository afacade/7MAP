import { h } from '../core/dom.js';
import { pointsFor } from '../lib/loyalty.js';
import { config } from '../config.js';

/** One label/value line in the cart and checkout summaries. */
export function summaryRow(label, value, { free = false } = {}) {
  return h(
    'div',
    { class: 'summary__row' },
    h('span', { class: 'summary__row-label' }, label),
    h('span', { class: `summary__row-value${free ? ' summary__row-value--free' : ''}` }, value),
  );
}

/**
 * What this order earns under the loyalty programme. Shown on the goods value,
 * since delivery does not earn points. Hidden when the order earns nothing, so
 * a small basket is not taunted with "+0 điểm".
 */
export function loyaltyRow(totals, t) {
  const points = pointsFor(totals.subtotal);
  if (points <= 0) return null;
  return h(
    'div',
    { class: 'summary__loyalty' },
    h('span', { class: 'summary__loyalty-points' }, t('pointsEarned', { n: points })),
    h('span', { class: 'summary__loyalty-note' }, t('pointsRule', {
      per: config.loyalty.pointsPerVoucher,
      value: config.loyalty.voucherValue.toLocaleString('vi-VN'),
    })),
  );
}

/** Subtotal + delivery, shared by both summaries. */
export function totalsRows(totals, t) {
  return [
    summaryRow(t('subtotal'), totals.subtotalStr),
    summaryRow(t('shipping'), totals.shippingStr, { free: totals.shippingIsFree }),
  ];
}
