import { h } from '../core/dom.js';
import { productHref } from '../core/router.js';
import { addToCart } from '../core/store.js';
import { announce } from '../core/announce.js';
import { imageWell } from './image.js';
import { SIZES } from '../lib/images.js';

/**
 * The product card used on the homepage, the category listing and the PDP's
 * related row. One component, three shapes:
 *   default   image, badge, category, title, price row, unit, add button
 *   plain     related products — image, title, price only
 *   flash     the flash-sale variant with a discount chip and a sold bar
 */
export function productCard(product, ctx) {
  const { t } = ctx;

  return h(
    'article',
    { class: 'product-card' },
    h(
      'a',
      { class: 'product-card__media', href: productHref(product.id), tabindex: '-1', 'aria-hidden': 'true' },
      imageWell({ src: product.image, alt: '', label: t('imagePending'), sizes: SIZES.card }),
      product.badge && h('span', { class: 'product-card__badge' }, product.badge),
    ),
    h('div', { class: 'product-card__cat' }, product.categoryName),
    h('h3', null, h('a', { class: 'product-card__title', href: productHref(product.id) }, product.name)),
    priceRow(product),
    h('div', { class: 'product-card__unit' }, product.unit),
    addButton(product, ctx, 'product-card__add'),
  );
}

/**
 * The best-seller card: the same anatomy as `productCard` plus a rank chip and
 * the shop's own description. Used only on the "Sản phẩm bán chạy" shelf, where
 * five products get more room than a normal grid row.
 */
export function bestSellerCard(product, ctx) {
  const { t } = ctx;

  return h(
    'article',
    { class: 'product-card best-card' },
    h(
      'a',
      { class: 'product-card__media', href: productHref(product.id), tabindex: '-1', 'aria-hidden': 'true' },
      imageWell({ src: product.image, alt: '', label: t('imagePending'), sizes: SIZES.card }),
      product.rank &&
        h('span', { class: 'best-card__rank' }, `#${product.rank}`),
    ),
    h('div', { class: 'product-card__cat' }, product.categoryName),
    h('h3', null, h('a', { class: 'product-card__title', href: productHref(product.id) }, product.name)),
    product.description && h('p', { class: 'best-card__desc' }, product.description),
    priceRow(product),
    h('div', { class: 'product-card__unit' }, product.unit),
    addButton(product, ctx, 'product-card__add'),
  );
}

export function relatedCard(product, ctx) {
  const { t } = ctx;

  return h(
    'article',
    { class: 'product-card product-card--plain' },
    h(
      'a',
      { class: 'product-card__media', href: productHref(product.id), tabindex: '-1', 'aria-hidden': 'true' },
      imageWell({ src: product.image, alt: '', label: t('imagePending'), sizes: SIZES.card }),
    ),
    h('h3', null, h('a', { class: 'product-card__title', href: productHref(product.id) }, product.name)),
    h('span', { class: 'price', style: { fontSize: '16.5px' } }, product.priceStr),
  );
}

export function flashCard(product, ctx) {
  const { t } = ctx;

  return h(
    'article',
    { class: 'flash-card' },
    h(
      'a',
      { class: 'product-card__media', href: productHref(product.id), tabindex: '-1', 'aria-hidden': 'true' },
      imageWell({ src: product.image, alt: '', label: t('imagePending'), sizes: SIZES.card }),
      h('span', { class: 'product-card__badge product-card__badge--discount' }, product.discountLabel),
    ),
    h('h3', null, h('a', { class: 'flash-card__title', href: productHref(product.id) }, product.name)),
    h(
      'div',
      { class: 'price-row price-row--flash' },
      h('span', { class: 'flash-card__price' }, product.priceStr),
      product.hasWas && h('span', { class: 'price--was' }, product.wasStr),
    ),
    h(
      'div',
      {
        class: 'flash-card__bar',
        role: 'progressbar',
        'aria-valuenow': String(product.claimedPct),
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-label': product.claimedLabel,
      },
      h('div', { class: 'flash-card__fill', style: { width: `${product.claimedPct}%` } }),
    ),
    h('div', { class: 'flash-card__sold' }, product.claimedLabel),
    addButton(product, ctx, 'flash-card__add'),
  );
}

/** The price row must wrap — unwrapped it overflows a narrow card. */
function priceRow(product) {
  return h(
    'div',
    { class: 'price-row' },
    h('span', { class: 'price' }, product.priceStr),
    product.hasWas && h('span', { class: 'price--was' }, product.wasStr),
  );
}

function addButton(product, { t }, className) {
  return h(
    'button',
    {
      type: 'button',
      class: className,
      'aria-label': t('addToCartOf', { name: product.name }),
      onClick: () => {
        addToCart(product.id, 1);
        announce(t('addedToCart', { name: product.name }));
      },
    },
    t('addToCart'),
  );
}
