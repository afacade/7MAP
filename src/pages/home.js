import { h } from '../core/dom.js';
import { routes, href } from '../core/router.js';
import { config, storeInfo } from '../config.js';
import { imageWell } from '../components/image.js';
import { asset } from '../core/base.js';
import { productCard, bestSellerCard, flashCard } from '../components/product-card.js';
import { flashCountdown } from '../components/countdown.js';
import { carousel } from '../components/carousel.js';
import { decorate, bestSellers, shelfProducts, flashProducts } from '../lib/catalog.js';

/**
 * Home.
 *
 * Everything the shop curated lives here, in the order they asked for: their
 * banner, then the three shelves they grouped by hand — "Gợi ý cho bạn"
 * first, then best sellers, then "Gợi ý riêng cho bạn".
 *
 * Each shelf shows at most two rows; anything beyond that becomes a carousel
 * page, swipeable on touch and driven by the arrows in the section header.
 *
 * The hero panel, promo banners and flash sale from the design prototype are
 * behind config flags; see src/config.js for why they are off.
 */
export function homePage(ctx) {
  return h(
    'div',
    null,
    storeBanner(ctx),
    config.showHeroPanel || config.showPromoBanners ? heroRow(ctx) : null,
    trustStrip(ctx),
    // "Gợi ý cho bạn" leads the shelves, at the shop's request.
    shelfSection(ctx, {
      shelf: 'suggested',
      title: ctx.t('suggestedTitle'),
      sub: ctx.t('suggestedSub'),
    }),
    bestSellerSection(ctx),
    config.showFlashSale ? flashSection(ctx) : null,
    shelfSection(ctx, {
      shelf: 'for-you',
      title: ctx.t('forYouTitle'),
      sub: ctx.t('forYouSub'),
    }),
    storeBand(ctx),
  );
}

/* --------------------------------------------------------------- banner -- */

/** The shop's own artwork, full width. All of its messaging is in the image,
 *  so nothing is overlaid on it. */
function storeBanner({ t }) {
  return h(
    'section',
    { class: 'section home-banner' },
    h('h1', { class: 'u-visually-hidden' }, t('homeH1')),
    h(
      'a',
      { class: 'home-banner__link', href: href(routes.categories, { cat: 'food' }) },
      h('img', {
        class: 'home-banner__img',
        src: asset('/images/banner.jpg'),
        alt: t('bannerAlt'),
        decoding: 'async',
      }),
    ),
  );
}

/* ------------------------------------------------------------- hero row -- */

function heroRow(ctx) {
  const { t } = ctx;

  return h(
    'section',
    { class: 'section home-hero' },
    config.showHeroPanel
      ? h(
          'div',
          { class: 'hero' },
          h(
            'div',
            { class: 'hero__copy' },
            h('span', { class: 'hero__eyebrow' }, t('heroKicker')),
            h('h1', { class: 'hero__title' }, t('heroTitle')),
            h('p', { class: 'hero__sub' }, t('heroSub')),
            h('a', { class: 'btn btn--on-orange hero__cta', href: routes.categories }, t('heroCta')),
          ),
          h(
            'div',
            { class: 'hero__media' },
            imageWell({
              src: '/images/hero.jpg',
              alt: '',
              className: 'well--cover well--hero',
              label: t('imagePending'),
              hint: 'Hero image — aisle or promo shot, 900×760',
              eager: true,
            }),
          ),
        )
      : null,
    config.showPromoBanners
      ? h(
          'div',
          { class: 'promos' },
          promo({
            t,
            url: href(routes.categories, { cat: 'elec' }),
            image: '/images/promo-appliances.jpg',
            hint: 'Appliances promo, 800×420',
            eyebrow: t('b2Kicker'),
            title: t('b2Title'),
            sub: t('b2Sub'),
          }),
          promo({
            t,
            url: href(routes.categories, { cat: 'toys' }),
            image: '/images/promo-toys.jpg',
            hint: 'Kids & toys promo, 800×420',
            eyebrow: t('b3Kicker'),
            title: t('b3Title'),
            sub: t('b3Sub'),
          }),
        )
      : null,
  );
}

/** Copy always sits on its own plate below the image, never over it. */
function promo({ t, url, image, hint, eyebrow, title, sub }) {
  return h(
    'a',
    { class: 'promo', href: url },
    h(
      'div',
      { class: 'promo__media' },
      imageWell({ src: image, alt: '', className: 'well--cover well--banner', label: t('imagePending'), hint }),
    ),
    h(
      'div',
      { class: 'promo__plate' },
      h('span', { class: 'promo__eyebrow' }, eyebrow),
      h('span', { class: 'promo__title' }, title),
      h('span', { class: 'promo__sub' }, sub),
    ),
  );
}

/* ---------------------------------------------------------- trust strip -- */

function trustStrip({ t }) {
  const cells = [
    [t('tr1'), t('tr1s')],
    [t('tr2'), t('tr2s')],
    [t('tr3'), t('tr3s')],
    [t('tr4'), t('tr4s')],
  ];

  return h(
    'section',
    { class: 'section trust' },
    h(
      'div',
      { class: 'trust__grid' },
      ...cells.map(([title, sub]) =>
        h(
          'div',
          { class: 'trust__cell' },
          h('div', { class: 'trust__title' }, title),
          h('div', { class: 'trust__sub' }, sub),
        ),
      ),
    ),
  );
}

/* --------------------------------------------------------- best sellers -- */

function bestSellerSection(ctx) {
  const { t, lang } = ctx;
  const items = bestSellers().map((p) => decorate(p, lang, t));
  if (!items.length) return null;

  const shelf = carousel({
    items,
    renderItem: (item) => bestSellerCard(item, ctx),
    ctx,
    gridClass: 'best-grid',
    colsVar: '--best-per-row',
    label: t('featTitle'),
  });

  return h(
    'section',
    { class: 'section section--spaced' },
    sectionHead({ title: t('featTitle'), sub: t('featSub'), controls: shelf.controls }),
    shelf.node,
  );
}

/* --------------------------------------------------------------- shelves -- */

/** One of the curated homepage shelves. */
function shelfSection(ctx, { shelf, title, sub }) {
  const { t, lang } = ctx;
  const items = shelfProducts(shelf).map((p) => decorate(p, lang, t));
  if (!items.length) return null;

  const strip = carousel({
    items,
    renderItem: (item) => productCard(item, ctx),
    ctx,
    gridClass: 'product-grid',
    colsVar: '--products-per-row',
    label: title,
  });

  return h(
    'section',
    { class: 'section section--spaced' },
    sectionHead({ title, sub, controls: strip.controls }),
    strip.node,
  );
}

/* ----------------------------------------------------------- flash sale -- */

function flashSection(ctx) {
  const { t, lang } = ctx;
  const items = flashProducts().map((p) => decorate(p, lang, t));
  if (!items.length) return null;

  return h(
    'section',
    { class: 'section section--spaced' },
    h(
      'div',
      { class: 'flash' },
      h(
        'div',
        { class: 'flash__head' },
        h(
          'div',
          { class: 'flash__head-left' },
          h('h2', { class: 'flash__title' }, t('flashTitle')),
          h('span', { class: 'flash__sub' }, t('flashSub')),
        ),
        flashCountdown(ctx),
      ),
      h('div', { class: 'flash__grid' }, ...items.map((item) => flashCard(item, ctx))),
    ),
  );
}

/* ----------------------------------------------------------- store band -- */

function storeBand({ t }) {
  return h(
    'section',
    { class: 'section section--spaced' },
    h(
      'div',
      { class: 'store-band' },
      h(
        'div',
        { class: 'store-band__intro' },
        h('div', { class: 'store-band__eyebrow' }, t('storeKicker')),
        h('h2', { class: 'store-band__title' }, t('storeTitle')),
        h('p', { class: 'store-band__body' }, t('storeSub')),
        h('a', { class: 'btn btn--on-orange store-band__cta', href: routes.contact }, t('storeCta')),
      ),
      h(
        'div',
        { class: 'store-band__col' },
        bandField(t('addressH'), storeInfo.addressShort),
        bandField(t('hoursH'), t('hoursVal')),
      ),
      h(
        'div',
        { class: 'store-band__col' },
        bandField(t('hotlineH'), h('a', { href: `tel:${storeInfo.hotlineHref}` }, storeInfo.hotline)),
        bandField(t('orderH'), t('orderVal')),
      ),
    ),
  );
}

function bandField(label, value) {
  return h(
    'div',
    null,
    h('div', { class: 'store-band__label' }, label),
    h('div', { class: 'store-band__value' }, value),
  );
}

/* ---------------------------------------------------------------- utils -- */

function sectionHead({ title, sub, controls, ctaLabel, ctaUrl }) {
  return h(
    'div',
    { class: 'section-head' },
    h(
      'div',
      null,
      h('h2', { class: 'section-head__title' }, title),
      h('p', { class: 'section-head__sub' }, sub),
    ),
    controls || (ctaUrl && h('a', { class: 'btn btn--outline btn--sm', href: ctaUrl }, ctaLabel)),
  );
}
