import { h } from '../core/dom.js';
import { routes, productHref } from '../core/router.js';
import { setQty, removeFromCart } from '../core/store.js';
import { imageWell } from '../components/image.js';
import { totalsRows } from '../components/order-summary.js';
import { cartLines, orderTotals } from '../lib/catalog.js';

export function cartPage(ctx) {
  const { t, lang, state } = ctx;
  const lines = cartLines(state.cart, lang, t);
  const totals = orderTotals(lines, lang, t);

  return h(
    'section',
    { class: 'page page--cart page-top' },
    h('h1', { class: 'page-title page-title--view' }, t('cartTitle')),
    lines.length
      ? h(
          'div',
          { class: 'cart-layout' },
          h('div', { class: 'cart-list' }, ...lines.map((line) => cartRow(line, ctx))),
          cartSummary(totals, ctx),
        )
      : emptyCart(ctx),
  );
}

/**
 * Rows are stacked, not tabular — the design's five-column table did not fit and
 * was removed. Line two wraps under pressure.
 */
function cartRow(line, { t }) {
  return h(
    'div',
    { class: 'cart-row' },
    h(
      'div',
      { class: 'cart-row__thumb' },
      imageWell({ src: line.image, alt: '', label: '' }),
    ),
    h(
      'div',
      { class: 'cart-row__body' },
      h(
        'div',
        { class: 'cart-row__head' },
        h(
          'div',
          { style: { minWidth: '0' } },
          h('a', { class: 'cart-row__title', href: productHref(line.id) }, line.name),
          h('div', { class: 'cart-row__unit' }, line.unit),
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'cart-row__remove',
            'aria-label': t('removeItem', { name: line.name }),
            onClick: () => removeFromCart(line.id),
          },
          '×',
        ),
      ),
      h(
        'div',
        { class: 'cart-row__foot' },
        h(
          'div',
          { class: 'cart-row__qty' },
          h(
            'div',
            { class: 'stepper stepper--sm', role: 'group', 'aria-label': t('quantity') },
            h(
              'button',
              {
                type: 'button',
                class: 'stepper__btn',
                'aria-label': t('decrease'),
                // Decrementing to zero removes the line.
                onClick: () => setQty(line.id, line.qty - 1),
              },
              '−',
            ),
            h('span', { class: 'stepper__value' }, String(line.qty)),
            h(
              'button',
              {
                type: 'button',
                class: 'stepper__btn',
                'aria-label': t('increase'),
                onClick: () => setQty(line.id, line.qty + 1),
              },
              '+',
            ),
          ),
          h('span', { class: 'cart-row__unit-price tnum' }, `× ${line.priceStr}`),
        ),
        h('span', { class: 'cart-row__total' }, line.lineTotalStr),
      ),
    ),
  );
}

function cartSummary(totals, { t }) {
  return h(
    'aside',
    { class: 'summary' },
    h('h2', { class: 'card__title' }, t('summary')),
    ...totalsRows(totals, t),
    h('p', { class: 'summary__note' }, totals.note),
    h('div', { class: 'rule' }),
    h(
      'div',
      { class: 'summary__total' },
      h('span', { class: 'summary__total-label' }, t('grandTotal')),
      h('span', { class: 'summary__total-value' }, totals.totalStr),
    ),
    h('a', { class: 'btn btn--primary btn--block', href: routes.checkout }, t('checkout')),
    h('a', { class: 'btn btn--outline btn--block', href: routes.categories }, t('keepShopping')),
  );
}

function emptyCart({ t }) {
  return h(
    'div',
    { class: 'empty-state' },
    h('div', { class: 'empty-state__title' }, t('cartEmpty')),
    h('div', { class: 'empty-state__sub' }, t('cartEmptySub')),
    h('a', { class: 'btn btn--primary', href: routes.categories }, t('heroCta')),
  );
}
