import { h } from '../core/dom.js';
import { routes, href, navigate } from '../core/router.js';
import { clearCart } from '../core/store.js';
import { cartLines, orderTotals } from '../lib/catalog.js';
import { totalsRows } from '../components/order-summary.js';
import { isValidVnPhone, generateOrderNumber } from '../lib/format.js';
import { submitOrder } from '../lib/orders.js';
import { field } from '../components/field.js';

/**
 * Checkout.
 *
 * The confirmation lives at `/thanh-toan?order=7M-24816` rather than in a
 * component flag, so the confirmed state is a real, reloadable URL and going
 * back to a bare /thanh-toan shows a fresh form instead of a stale receipt.
 */
export function checkoutPage(ctx) {
  const { t, lang, state, route } = ctx;

  if (route.query.order) return confirmation(route.query.order, ctx);

  const lines = cartLines(state.cart, lang, t);
  if (!lines.length) return emptyCheckout(ctx);

  const totals = orderTotals(lines, lang, t);

  // The submit button lives in the summary aside, outside the form element, so
  // both it and the form's own submit event route through one action.
  const action = { run: () => {} };
  const form = checkoutForm(ctx, action);

  return h(
    'section',
    { class: 'page page--checkout page-top' },
    h('h1', { class: 'page-title page-title--view' }, t('checkoutTitle')),
    h('div', { class: 'checkout-layout' }, form.node, checkoutSummary(lines, totals, ctx, form, action)),
  );
}

/* ----------------------------------------------------------------- form -- */

function checkoutForm(ctx, action) {
  const { t } = ctx;

  const name = field({ t, key: 'name', label: t('fName'), placeholder: t('fNamePh'), autocomplete: 'name' });
  const phone = field({
    t,
    key: 'phone',
    label: t('fPhone'),
    placeholder: t('fPhonePh'),
    type: 'tel',
    autocomplete: 'tel',
    inputmode: 'tel',
  });
  const address = field({
    t,
    key: 'address',
    label: t('fAddr'),
    placeholder: t('fAddrPh'),
    autocomplete: 'street-address',
  });
  const note = field({ t, key: 'note', label: t('fNote'), placeholder: t('fNotePh'), multiline: true, rows: 3 });

  const fields = [name, phone, address, note];

  const node = h(
    'form',
    {
      class: 'checkout-form',
      id: 'checkout-form',
      novalidate: true,
      onSubmit: (event) => {
        event.preventDefault();
        action.run();
      },
    },
    h('h2', { class: 'form-label' }, t('coInfo')),
    h('div', { class: 'form-row' }, name.node, phone.node),
    address.node,
    note.node,
    h('div', { class: 'rule' }),
    h('h2', { class: 'form-label' }, t('coPay')),
    paymentMethods(ctx),
  );

  /** Returns the order payload, or null after marking the invalid fields. */
  function validate() {
    const values = Object.fromEntries(fields.map((f) => [f.key, f.value().trim()]));
    const errors = {};

    if (!values.name) errors.name = t('errName');
    if (!values.phone) errors.phone = t('errRequired');
    else if (!isValidVnPhone(values.phone)) errors.phone = t('errPhone');
    if (!values.address) errors.address = t('errAddr');

    for (const f of fields) f.setError(errors[f.key] || null);

    const firstInvalid = fields.find((f) => errors[f.key]);
    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }

    return {
      ...values,
      payment: node.querySelector('input[name="pay"]:checked')?.value || 'cod',
    };
  }

  return { node, validate };
}

function paymentMethods({ t }) {
  const methods = [
    { id: 'cod', label: t('payCod'), sub: t('payCodSub') },
    { id: 'bank', label: t('payBank'), sub: t('payBankSub') },
    { id: 'store', label: t('payStore'), sub: t('payStoreSub') },
  ];

  return h(
    'fieldset',
    { class: 'pay-list' },
    h('legend', { class: 'u-visually-hidden' }, t('coPay')),
    ...methods.map((method) =>
      h(
        'label',
        { class: 'pay-option' },
        h('input', { type: 'radio', name: 'pay', value: method.id, checked: method.id === 'cod' }),
        h('span', { class: 'pay-option__dot', 'aria-hidden': 'true' }),
        h(
          'span',
          { class: 'pay-option__text' },
          h('span', { class: 'pay-option__label' }, method.label),
          h('span', { class: 'pay-option__sub' }, method.sub),
        ),
      ),
    ),
  );
}

/* -------------------------------------------------------------- summary -- */

function checkoutSummary(lines, totals, ctx, form, action) {
  const { t } = ctx;

  const error = h('p', { class: 'field__error', role: 'alert', hidden: true });

  const submit = h(
    'button',
    { type: 'submit', form: 'checkout-form', class: 'btn btn--primary btn--block' },
    t('placeOrder'),
  );

  action.run = async () => {
    if (submit.disabled) return;

    const payload = form.validate();
    if (!payload) {
      error.hidden = false;
      error.textContent = t('errSummary');
      return;
    }

    error.hidden = true;
    submit.disabled = true;
    submit.textContent = t('submitting');

    const orderNo = generateOrderNumber();
    try {
      await submitOrder({ ...payload, orderNo, lines, totals });
    } catch (failure) {
      // The order did not reach the store — keep the cart and let them retry.
      console.error('[7map] order submission failed', failure);
      submit.disabled = false;
      submit.textContent = t('placeOrder');
      error.hidden = false;
      error.textContent = t('errSummary');
      return;
    }

    clearCart();
    navigate(href(routes.checkout, { order: orderNo }));
  };

  return h(
    'aside',
    { class: 'summary summary--checkout' },
    h('h2', { class: 'card__title' }, t('summary')),
    ...lines.map((line) =>
      h(
        'div',
        { class: 'summary__line' },
        h('span', { class: 'summary__line-name' }, `${line.name} × ${line.qty}`),
        h('span', { class: 'summary__line-value' }, line.lineTotalStr),
      ),
    ),
    h('div', { class: 'rule' }),
    ...totalsRows(totals, t),
    h(
      'div',
      { class: 'summary__total summary__total--checkout' },
      h('span', { class: 'summary__total-label' }, t('grandTotal')),
      h('span', { class: 'summary__total-value summary__total-value--checkout' }, totals.totalStr),
    ),
    error,
    submit,
    h('p', { class: 'summary__fine' }, t('coFine')),
  );
}

/* --------------------------------------------------------- other states -- */

function confirmation(orderNo, { t }) {
  return h(
    'section',
    { class: 'page page--checkout page-top' },
    h(
      'div',
      { class: 'order-done' },
      h('div', { class: 'order-done__mark', 'aria-hidden': 'true' }, '✓'),
      h('h1', { class: 'order-done__title' }, t('doneTitle')),
      h('p', { class: 'order-done__sub' }, t('doneSub')),
      h('p', { class: 'order-done__no' }, `${t('orderNo')} `, h('strong', null, orderNo)),
      h('a', { class: 'btn btn--primary order-done__cta', href: routes.home }, t('backHome')),
    ),
  );
}

function emptyCheckout({ t }) {
  return h(
    'section',
    { class: 'page page--checkout page-top' },
    h('h1', { class: 'page-title page-title--view' }, t('checkoutTitle')),
    h(
      'div',
      { class: 'empty-state' },
      h('div', { class: 'empty-state__title' }, t('cartEmpty')),
      h('div', { class: 'empty-state__sub' }, t('cartEmptySub')),
      h('a', { class: 'btn btn--primary', href: routes.categories }, t('heroCta')),
    ),
  );
}
