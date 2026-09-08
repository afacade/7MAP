import { h } from '../core/dom.js';
import { routes, href, navigate, policyHref } from '../core/router.js';
import { setLang, cartCount } from '../core/store.js';
import { storeInfo, config } from '../config.js';
import { hotlineFor } from '../lib/format.js';
import { LANGS } from '../i18n/index.js';
import { asset } from '../core/base.js';
import { queryCatalogue } from '../lib/catalog.js';
import { isLoaded } from '../data/catalogue.js';

/**
 * Global chrome above the page: the orange utility bar, the sticky header with
 * search and cart, and the four-item nav.
 */

/**
 * Trending chips, cached.
 *
 * A suggestion that leads to an empty shelf is worse than no suggestion, so
 * each term has to be tried against the catalogue — but the header re-renders
 * on every route change, cart change and language switch, and at ~8,800
 * products eight full scans per render is real work on the critical path. The
 * answer only changes when the catalogue finishes loading, so it is computed
 * at most twice.
 */
let trendingCache = null;
let trendingCachedFor = null;

function trendingTerms() {
  const state = isLoaded();
  if (trendingCache && trendingCachedFor === state) return trendingCache;
  trendingCachedFor = state;
  trendingCache = config.trendingSearches.filter((term) => queryCatalogue({ query: term }).total > 0);
  return trendingCache;
}
export function siteHeader(ctx) {
  return h('div', { class: 'site-chrome' }, utilityBar(ctx), header(ctx), nav(ctx));
}

/**
 * The right-hand side of the utility bar, modelled on the marketplace layout
 * the shop pointed at. Entries without an `href` are deliberate placeholders —
 * rendered but inert — so the structure is visible before the features exist.
 */
const UTILITY_LINKS = [
  { key: 'utilSupport', href: () => routes.contact },
  { key: 'utilZalo', href: storeInfo.zaloUrl, external: true },
  { key: 'utilWholesale', href: () => policyHref('giao-hang') },
  { key: 'utilTrack' },
  { key: 'utilAccount' },
];

function utilityBar({ t, lang }) {
  return h(
    'div',
    { class: 'utility-bar' },
    h(
      'div',
      { class: 'utility-bar__inner' },
      h(
        'div',
        { class: 'utility-bar__group' },
        h(
          'span',
          { class: 'utility-bar__hotline' },
          h('span', { class: 'pulse-dot', 'aria-hidden': 'true' }),
          `${t('topHotline')} `,
          h('a', { href: `tel:${storeInfo.hotlineHref}` }, hotlineFor(lang)),
        ),
        h('span', { class: 'utility-bar__ship' }, t('topShip')),
      ),
      h(
        'div',
        { class: 'utility-bar__group utility-bar__group--end' },
        // Marketplace-style links, sketched at the shop's request for later
        // build-out. Only entries with a real destination are rendered as
        // links; anything not built yet carries `is-soon` and is inert, so the
        // bar shows the intended shape without promising a page that 404s.
        ...UTILITY_LINKS.map((item) =>
          item.href
            ? h(
                'a',
                {
                  class: 'utility-bar__link',
                  href: typeof item.href === 'function' ? item.href() : item.href,
                  ...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
                },
                t(item.key),
              )
            : h(
                'span',
                { class: 'utility-bar__link is-soon', title: t('comingSoon') },
                t(item.key),
              ),
        ),
        langToggle({ t, lang }),
      ),
    ),
  );
}

function langToggle({ t, lang }) {
  return h(
    'div',
    { class: 'lang-toggle', role: 'group', 'aria-label': t('langLabel') },
    ...LANGS.map((code) =>
      h(
        'button',
        {
          type: 'button',
          class: 'lang-toggle__btn',
          'aria-pressed': String(code === lang),
          lang: code,
          onClick: () => setLang(code),
        },
        code.toUpperCase(),
      ),
    ),
  );
}

function header({ t, state, route }) {
  const count = cartCount(state);

  const input = h('input', {
    class: 'search__input',
    type: 'search',
    name: 'q',
    id: 'site-search',
    // Reflects the query the current results are for, so the box never
    // disagrees with the listing behind it. `data-field` keeps half-typed text
    // through a re-render caused by adding to the cart or switching language.
    dataset: { field: 'search' },
    value: route.query.q || '',
    placeholder: t('searchPh'),
    'aria-label': t('searchLabel'),
  });

  // Search submits to the category page; filters there compose with the query.
  const form = h(
    'form',
    {
      class: 'search',
      role: 'search',
      onSubmit: (event) => {
        event.preventDefault();
        navigate(href(routes.categories, { q: input.value.trim() }));
      },
    },
    input,
    h('button', { class: 'search__btn', type: 'submit' }, t('searchBtn')),
  );

  // Popular searches, sitting under the field they act on.
  const suggestions = h(
    'div',
    { class: 'search-suggest' },
    h('span', { class: 'search-suggest__label' }, t('trendingLabel')),
    ...trendingTerms().map((term) =>
      h('a', { class: 'search-suggest__chip', href: href(routes.categories, { q: term }) }, term),
    ),
  );

  const searchColumn = h('div', { class: 'search-col' }, form, suggestions);

  return h(
    'header',
    { class: 'site-header' },
    h(
      'div',
      { class: 'site-header__bar' },
      h(
        'a',
        { class: 'brand', href: routes.home, 'aria-label': t('homeLink') },
        // alt="" on purpose: the shop name sits right beside it, so a screen
        // reader would otherwise announce the brand twice.
        h('img', { class: 'brand__logo', src: asset('/images/logo-7map-white.png'), alt: '', width: '360', height: '77' }),
        h(
          'span',
          { class: 'brand__text' },
          h('span', { class: 'brand__name' }, t('brandName')),
          h('span', { class: 'brand__tagline' }, t('tagline')),
        ),
      ),
      searchColumn,
      h(
        'div',
        { class: 'header__actions' },
        h(
          'a',
          { class: 'cart-btn', href: routes.cart },
          t('cart'),
          h(
            'span',
            { class: 'cart-btn__count tnum' },
            String(count),
            h('span', { class: 'u-visually-hidden' }, ` ${t('cartCountLabel')}`),
          ),
        ),
      ),
    ),
  );
}

function nav({ t, route }) {
  // The product detail page keeps "Danh mục sản phẩm" lit, as specified.
  const active = route.name === 'product' ? 'categories' : route.name;

  const items = [
    { name: 'home', label: t('navHome'), url: routes.home },
    { name: 'categories', label: t('navCats'), url: routes.categories },
    { name: 'contact', label: t('navContact'), url: routes.contact },
    { name: 'policies', label: t('navPolicy'), url: routes.policies },
  ];

  const bar = h(
    'nav',
    { class: 'site-nav', 'aria-label': t('mainNavLabel') },
    ...items.map((item) =>
      h(
        'a',
        {
          class: `site-nav__link${item.name === active ? ' is-active' : ''}`,
          href: item.url,
          'aria-current': item.name === active ? 'page' : null,
        },
        item.label,
      ),
    ),
    h('span', { class: 'site-nav__note' }, t('navNote')),
  );

  // Full-bleed darker band behind the tabs.
  return h('div', { class: 'site-nav-bar' }, bar);
}
