import { h } from '../core/dom.js';
import { routes, href, policyHref } from '../core/router.js';
import { config, storeInfo } from '../config.js';
import { hotlineFor, money } from '../lib/format.js';
import { imageWell } from '../components/image.js';
import { SIZES } from '../lib/images.js';
import { asset } from '../core/base.js';
import { productCard, bestSellerCard, flashCard, feedCard } from '../components/product-card.js';
import { flashCountdown } from '../components/countdown.js';
import { carousel } from '../components/carousel.js';
import { categoryStrip } from '../components/category-strip.js';
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
    // The Shopee-style "Danh mục" row comes first, at the shop's request.
    band('plain', categoryStrip(ctx, { className: 'section' })),
    // "Gợi ý cho bạn" sits above the hero, at the shop's request — the first
    // thing a returning customer sees is stock, not artwork.
    band('tint', shelfSection(ctx, {
      shelf: 'suggested',
      title: ctx.t('suggestedTitle'),
      sub: ctx.t('suggestedSub'),
      look: 'feed',
    })),
    storeHero(ctx),
    storeReel(ctx),
    config.showHeroPanel || config.showPromoBanners ? heroRow(ctx) : null,
    trustStrip(ctx),
    band('plain', bestSellerSection(ctx)),
    config.showFlashSale ? flashSection(ctx) : null,
    // The shop asked for this one to scroll down the page rather than page
    // sideways — it is the browse-everything shelf, so all 36 are laid out.
    // Same marketplace cell as "Gợi ý cho bạn", with two policy tiles woven in.
    band('tint', shelfSection(ctx, {
      shelf: 'for-you',
      title: ctx.t('forYouTitle'),
      sub: ctx.t('forYouSub'),
      mode: 'grid',
      look: 'feed',
      tiles: feedTiles(ctx),
    })),
    storeBand(ctx),
  );
}

/** Full-bleed ground behind a shelf, so consecutive shelves stay distinct. */
function band(kind, section) {
  if (!section) return null;
  return h('div', { class: `band band--${kind}` }, section);
}

/* ----------------------------------------------------------------- hero -- */

/** The shop's banner artwork, full width. */
function storeHero(ctx) {
  const { t } = ctx;
  return h(
    'section',
    { class: 'section home-hero-row' },
    h('h1', { class: 'u-visually-hidden' }, t('homeH1')),
    h('div', { class: 'home-hero-row__banner' }, storeBanner(ctx)),
  );
}

/* ---------------------------------------------------------------- reel -- */

/**
 * The shop's phone-shot store video, with copy and a Zalo call to action.
 *
 * It is vertical — the shop films on a phone for TikTok — so it gets a
 * portrait frame of its own rather than the wide slot beside the banner it
 * used to share. A 9:16 clip cropped into a 2.6:1 box loses about three
 * quarters of the frame, which is most of the point of the video.
 *
 * The frame is capped by height, not width: left to fill half a desktop grid
 * it would stand over a thousand pixels tall. On a phone the row stacks and
 * the video runs full width, which is the shape it was shot in.
 */
function storeReel(ctx) {
  const { t } = ctx;
  return h(
    'section',
    { class: 'section section--spaced reel' },
    h('div', { class: 'reel__media' }, storeVideo(ctx)),
    h(
      'div',
      { class: 'reel__copy' },
      h('span', { class: 'reel__kicker' }, t('reelKicker')),
      h('h2', { class: 'reel__title' }, t('reelTitle')),
      h('p', { class: 'reel__body' }, t('reelSub')),
      h(
        'div',
        { class: 'reel__actions' },
        h(
          'a',
          {
            class: 'btn btn--primary',
            href: storeInfo.zaloUrl,
            target: '_blank',
            rel: 'noopener',
          },
          t('reelCta'),
        ),
        h('a', { class: 'btn btn--outline', href: routes.contact }, t('storeCta')),
      ),
    ),
  );
}

/**
 * The video itself: muted, looping, `playsinline` — the only combination
 * browsers let start without a tap — with a button to turn the sound on,
 * since a reel shot for TikTok carries a voiceover worth hearing.
 *
 * Two things keep it off the critical path. The file is not fetched until the
 * reel is actually scrolled near (`preload="none"` until then), and the
 * element only joins the DOM once the browser reports a decoded frame, so a
 * missing or broken file leaves the placeholder rather than a black rectangle.
 */
function storeVideo({ t }) {
  const frame = h(
    'div',
    { class: 'video-well' },
    h(
      'div',
      { class: 'well__placeholder', 'aria-hidden': 'true' },
      h('span', { class: 'well__placeholder-label' }, t('videoPending')),
      h('span', { class: 'well__placeholder-hint' }, t('videoHint')),
    ),
  );

  const video = h('video', {
    class: 'video-well__media',
    src: asset('/videos/store.mp4'),
    loop: true,
    playsinline: true,
    preload: 'none',
    'aria-label': t('videoLabel'),
  });
  // Autoplay is gated on the *property* being set before play() is called;
  // the attribute alone is not enough in Safari.
  video.muted = true;

  const sound = h('button', {
    class: 'video-well__sound',
    type: 'button',
    'aria-pressed': 'false',
  });
  const label = () => {
    sound.textContent = video.muted ? t('videoUnmute') : t('videoMute');
    sound.setAttribute('aria-pressed', String(!video.muted));
  };
  label();
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    label();
    // A tap is a user gesture, so this is also the moment playback can start
    // if the browser refused to autoplay earlier.
    video.play().catch(() => {});
  });

  video.addEventListener(
    'loadeddata',
    () => {
      frame.classList.add('is-playing');
      frame.appendChild(video);
      frame.appendChild(sound);
      video.play().catch(() => {});
    },
    { once: true },
  );

  // Nearly two megabytes is not worth spending on a phone before the reel is
  // anywhere near the viewport.
  const fetchNow = () => {
    video.preload = 'auto';
    video.load();
  };
  if (typeof IntersectionObserver === 'function') {
    const watcher = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        watcher.disconnect();
        fetchNow();
      },
      { rootMargin: '200px' },
    );
    watcher.observe(frame);
  } else {
    fetchNow();
  }

  return frame;
}

/** The shop's own artwork. All of its messaging is in the image, so nothing is
 *  overlaid on it. */
function storeBanner({ t }) {
  return h(
    'div',
    { class: 'home-banner' },
    h(
      'a',
      { class: 'home-banner__link', href: href(routes.categories, { cat: 'food' }) },
      h('img', {
        class: 'home-banner__img',
        // Full-bleed, so it gets its own widths rather than the 320/800 pair
        // the image wells use. Generated by tools/make_variants.py --banner.
        src: asset('/images/banner-1280.webp'),
        srcset: [640, 960, 1280]
          .map((w) => `${asset(`/images/banner-${w}.webp`)} ${w}w`)
          .join(', '),
        sizes: '(max-width: 1280px) 100vw, 1232px',
        alt: t('bannerAlt'),
        width: '1280',
        height: '487',
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
              sizes: SIZES.hero,
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
      imageWell({
        src: image,
        alt: '',
        className: 'well--cover well--banner',
        label: t('imagePending'),
        hint,
        sizes: SIZES.wide,
      }),
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
    [t('tr5'), t('tr5s')],
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

/**
 * One of the curated homepage shelves.
 *
 *   mode 'carousel'  two rows, the rest on swipeable pages (default)
 *   mode 'grid'      every product laid out vertically; the page scrolls
 *   look 'feed'      marketplace-style cells (feedCard) instead of the card
 *   tiles            `[{ at, node }]` woven into a grid at those indices
 */
function shelfSection(ctx, { shelf, title, sub, mode = 'carousel', look = 'card', tiles = [] }) {
  const { t, lang } = ctx;
  const items = shelfProducts(shelf).map((p) => decorate(p, lang, t));
  if (!items.length) return null;

  // 'feed' is the marketplace-style cell the shop asked for on both "Gợi ý"
  // shelves: its own card, a tighter grid, and two columns even on the
  // smallest phones.
  const feed = look === 'feed';
  const card = feed ? feedCard : productCard;
  const gridClass = feed ? 'feed-grid' : 'product-grid';

  if (mode === 'grid') {
    const cells = items.map((item) => card(item, ctx));
    // Back to front, so an earlier tile's index is not shifted by a later one.
    [...tiles]
      .sort((a, b) => b.at - a.at)
      .forEach(({ at, node }) => {
        if (node && at <= cells.length) cells.splice(at, 0, node);
      });

    return h(
      'section',
      { class: 'section section--spaced' },
      sectionHead({ title, sub }),
      h('div', { class: `${gridClass}${feed ? ' feed-grid--flow' : ''}` }, ...cells),
    );
  }

  const strip = carousel({
    items,
    renderItem: (item) => card(item, ctx),
    ctx,
    gridClass,
    colsVar: feed ? '--feed-per-row' : '--products-per-row',
    label: title,
  });

  return h(
    'section',
    { class: 'section section--spaced' },
    sectionHead({ title, sub, controls: strip.controls }),
    strip.node,
  );
}

/* ----------------------------------------------------------- feed tiles -- */

/**
 * The two tiles woven into "Gợi ý riêng cho bạn".
 *
 * Both describe services the shop already runs — wholesale quotes over Zalo,
 * and the loyalty scheme in config.loyalty — so neither carries a countdown or
 * an expiry, and neither needs campaign data to render. The shop is running no
 * promotions; if that changes, a sale banner is a new tile, not an edit to
 * these two.
 *
 * Positions are counted in cells, so a tile lands at the start of a row on a
 * four-wide desktop grid and mid-row on a two-wide phone.
 */
function feedTiles(ctx) {
  const { t, lang } = ctx;
  const { dongPerPoint, pointsPerVoucher, voucherValue, voucherValidMonths } = config.loyalty;

  return [
    {
      at: 4,
      node: feedTile({
        url: storeInfo.zaloUrl,
        external: true,
        kicker: t('tileZaloKicker'),
        title: t('tileZaloTitle'),
        sub: t('tileZaloSub'),
        cta: t('tileZaloCta'),
      }),
    },
    {
      at: 13,
      node: feedTile({
        url: policyHref('tich-diem'),
        alt: true,
        kicker: t('tilePointsKicker'),
        title: t('tilePointsTitle', { dong: money(dongPerPoint, lang) }),
        sub: t('tilePointsSub', {
          points: pointsPerVoucher,
          value: money(voucherValue, lang),
          months: voucherValidMonths,
        }),
        cta: t('tilePointsCta'),
      }),
    },
  ];
}

function feedTile({ url, external, alt, kicker, title, sub, cta }) {
  return h(
    'a',
    {
      class: `feed-tile${alt ? ' feed-tile--alt' : ''}`,
      href: url,
      target: external ? '_blank' : null,
      rel: external ? 'noopener' : null,
    },
    h('span', { class: 'feed-tile__kicker' }, kicker),
    h('span', { class: 'feed-tile__title' }, title),
    h('span', { class: 'feed-tile__sub' }, sub),
    h('span', { class: 'feed-tile__cta' }, cta),
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

function storeBand({ t, lang }) {
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
        bandField(t('hotlineH'), h('a', { href: `tel:${storeInfo.hotlineHref}` }, hotlineFor(lang))),
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
