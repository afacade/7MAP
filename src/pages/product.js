import { h } from '../core/dom.js';
import { routes, href, navigate } from '../core/router.js';
import { getProduct } from '../data/products.js';
import { addToCart } from '../core/store.js';
import { announce } from '../core/announce.js';
import { imageWell } from '../components/image.js';
import { asset } from '../core/base.js';
import { relatedCard } from '../components/product-card.js';
import { decorate, productSpecs, relatedProducts } from '../lib/catalog.js';

export function productPage(ctx) {
  const { t, lang, route } = ctx;
  const product = getProduct(route.params.id);

  if (!product) return notFound(ctx);

  const d = decorate(product, lang, t);
  const gallery = productGallery(d, ctx);

  return h(
    'section',
    { class: 'page page-top--tight' },
    h(
      'nav',
      { class: 'breadcrumb', 'aria-label': t('breadcrumbLabel'), style: { marginBottom: '20px' } },
      h('a', { href: routes.home }, t('crumbHome')),
      ' / ',
      h('a', { href: href(routes.categories, { cat: d.categoryId }) }, d.categoryName),
      ' / ',
      h('span', { class: 'breadcrumb__current' }, d.name),
    ),
    h('div', { class: 'pdp' }, gallery, productInfo(d, ctx)),
    relatedSection(product, ctx),
  );
}

/* ------------------------------------------------------------- gallery --- */

function productGallery(d, { t }) {
  const main = imageWell({ src: d.images[0], alt: d.name, label: t('imagePending'), eager: true });
  const mainImg = main.querySelector('.well__img');

  const thumbs = d.images.map((src, index) =>
    h(
      'button',
      {
        type: 'button',
        class: `pdp__thumb${index === 0 ? ' is-selected' : ''}`,
        'aria-label': t('viewNumber', { n: index + 1 }),
        'aria-pressed': String(index === 0),
        onClick: (event) => selectView(event.currentTarget, src),
      },
      imageWell({ src, alt: '', label: t('imagePending') }),
    ),
  );

  function selectView(button, src) {
    for (const thumb of thumbs) {
      const isCurrent = thumb === button;
      thumb.classList.toggle('is-selected', isCurrent);
      thumb.setAttribute('aria-pressed', String(isCurrent));
    }
    main.classList.remove('is-missing');
    mainImg.src = asset(src);
  }

  return h(
    'div',
    { class: 'pdp__gallery' },
    h('div', { class: 'pdp__main' }, main),
    thumbs.length > 1 ? h('div', { class: 'pdp__thumbs' }, ...thumbs) : null,
  );
}

/* ---------------------------------------------------------------- info --- */

function productInfo(d, ctx) {
  const { t } = ctx;
  let qty = 1;

  const qtyValue = h('span', { class: 'stepper__value', 'aria-live': 'polite' }, '1');
  const setQtyValue = (next) => {
    qty = Math.max(1, next);
    qtyValue.textContent = String(qty);
  };

  const stepper = h(
    'div',
    { class: 'stepper', role: 'group', 'aria-label': t('quantity') },
    h(
      'button',
      { type: 'button', class: 'stepper__btn', 'aria-label': t('decrease'), onClick: () => setQtyValue(qty - 1) },
      '−',
    ),
    qtyValue,
    h(
      'button',
      { type: 'button', class: 'stepper__btn', 'aria-label': t('increase'), onClick: () => setQtyValue(qty + 1) },
      '+',
    ),
  );

  return h(
    'div',
    { class: 'pdp__info' },
    h(
      'div',
      { class: 'pdp__meta' },
      h('a', { class: 'pdp__chip', href: href(routes.categories, { cat: d.categoryId }) }, d.categoryName),
      h('span', { class: 'pdp__sku' }, `${t('sku')} ${d.sku}`),
    ),
    h('h1', { class: 'page-title' }, d.name),
    h(
      'div',
      { class: 'pdp__price-row' },
      h('span', { class: 'pdp__price' }, d.priceStr),
      d.hasWas && h('span', { class: 'pdp__was' }, d.wasStr),
    ),
    h('div', { class: 'pdp__unit' }, `${d.unit} · `, h('span', { class: 'pdp__stock' }, t('inStock'))),
    h('p', { class: 'pdp__desc' }, d.description || t('pdpDesc')),
    h(
      'div',
      { class: 'pdp__actions' },
      stepper,
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn--primary pdp__add',
          onClick: () => {
            addToCart(d.id, qty);
            announce(t('addedToCart', { name: d.name }));
          },
        },
        t('addToCart'),
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn--teal',
          onClick: () => {
            addToCart(d.id, qty);
            navigate(routes.checkout);
          },
        },
        t('buyNow'),
      ),
    ),
    specTable(d, ctx),
  );
}

function specTable(d, { t }) {
  const specs = productSpecs(d, t);

  return h(
    'div',
    { class: 'pdp__specs' },
    h('h2', { class: 'pdp__specs-head' }, t('specs')),
    h(
      'dl',
      { style: { margin: '0' } },
      ...specs.map((spec) =>
        h('div', { class: 'pdp__spec' }, h('dt', null, spec.k), h('dd', null, spec.v)),
      ),
    ),
  );
}

/* ------------------------------------------------------------- related --- */

function relatedSection(product, ctx) {
  const { t, lang } = ctx;
  const items = relatedProducts(product).map((p) => decorate(p, lang, t));
  if (!items.length) return null;

  return h(
    'div',
    { class: 'pdp__related' },
    h('h2', { class: 'pdp__related-title' }, t('related')),
    h('div', { class: 'product-grid product-grid--four' }, ...items.map((item) => relatedCard(item, ctx))),
  );
}

function notFound({ t }) {
  return h(
    'section',
    { class: 'page page-top' },
    h('h1', { class: 'page-title page-title--view' }, t('notFoundTitle')),
    h(
      'div',
      { class: 'empty-state' },
      h('div', { class: 'empty-state__sub' }, t('notFoundSub')),
      h('a', { class: 'btn btn--primary', href: routes.categories }, t('heroCta')),
    ),
  );
}
