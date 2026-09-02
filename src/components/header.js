import { h } from '../core/dom.js';
import { routes, href, navigate } from '../core/router.js';
import { setLang, cartCount } from '../core/store.js';
import { storeInfo, config } from '../config.js';
import { LANGS } from '../i18n/index.js';
import { asset } from '../core/base.js';
import { queryCatalogue } from '../lib/catalog.js';

/**
 * Global chrome above the page: the orange utility bar, the sticky header with
 * search and cart, and the four-item nav.
 */
export function siteHeader(ctx) {
  return h('div', { class: 'site-chrome' }, utilityBar(ctx), header(ctx), nav(ctx));
}

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
          h('a', { href: `tel:${storeInfo.hotlineHref}` }, storeInfo.hotline),
        ),
        h('span', { class: 'utility-bar__ship' }, t('topShip')),
      ),
      langToggle({ t, lang }),
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
    ...config.trendingSearches
      .filter((term) => queryCatalogue({ query: term }).length > 0)
      .map((term) =>
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
          h('span', { class: 'brand__name' }, storeInfo.name),
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
    { name: 'programs', label: t('navPrograms'), url: routes.programs },
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
