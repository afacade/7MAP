import { h } from '../core/dom.js';

/** One label/value line in the cart and checkout summaries. */
export function summaryRow(label, value, { free = false } = {}) {
  return h(
    'div',
    { class: 'summary__row' },
    h('span', { class: 'summary__row-label' }, label),
    h('span', { class: `summary__row-value${free ? ' summary__row-value--free' : ''}` }, value),
  );
}

/** Subtotal + delivery, shared by both summaries. */
export function totalsRows(totals, t) {
  return [
    summaryRow(t('subtotal'), totals.subtotalStr),
    summaryRow(t('shipping'), totals.shippingStr, { free: totals.shippingIsFree }),
  ];
}
