import { h } from '../core/dom.js';
import { routes, href, navigate } from '../core/router.js';
import { storeInfo } from '../config.js';
import { getCategory, sortOptions } from '../data/categories.js';
import { decorate, decorateCategories, decoratePriceBands, queryCatalogue } from '../lib/catalog.js';
import { productCard } from '../components/product-card.js';

/**
 * Category listing. Filters live in the query string — `?cat=&band=&sort=&q=` —
 * so a filtered view is linkable and survives a reload. They compose as
 * category ∧ price band ∧ query, then sort.
 */
export function categoriesPage(ctx) {
  const { t, lang, route } = ctx;

  const cat = route.query.cat || 'all';
  const band = route.query.band || 'all';
  const sort = sortOptions.includes(route.query.sort) ? route.query.sort : 'pop';
  const query = route.query.q || '';

  const results = queryCatalogue({ cat, band, sort, query }).map((p) => decorate(p, lang, t));
  const category = getCategory(cat);
  const title = category ? (lang === 'vi' ? category.nameVi : category.nameEn) : t('filterAll');

  /** Keep the other filters when one of them changes. Defaults are omitted so
   *  the URL only ever names what the visitor actually chose. */
  const withFilters = (patch) => {
    const next = { cat, band, sort, q: query, ...patch };
    if (next.sort === 'pop') next.sort = '';
    return href(routes.categories, next);
  };

  const sidebar = filterSidebar(ctx, { cat, band, withFilters });
  const drawer = drawerControls(ctx, sidebar);

  return h(
    'section',
    { class: 'page page-top--tight' },
    h(
      'nav',
      { class: 'breadcrumb', 'aria-label': t('breadcrumbLabel') },
      h('a', { href: routes.home }, t('crumbHome')),
      ' / ',
      h('span', { class: 'breadcrumb__current' }, t('navCats')),
    ),
    h(
      'div',
      { class: 'catalogue' },
      sidebar,
      h(
        'div',
        null,
        h(
          'div',
          { class: 'catalogue__head' },
          h(
            'div',
            null,
            h('h1', { class: 'catalogue__title' }, title),
            h(
              'p',
              { class: 'catalogue__count' },
              query ? `${t('searchingFor')} “${query}” · ` : '',
              t('productsCount', { n: results.length }),
            ),
          ),
          h(
            'div',
            { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
            drawer.button,
            sortControl(ctx, { sort, withFilters }),
          ),
        ),
        results.length
          ? h('div', { class: 'product-grid' }, ...results.map((item) => productCard(item, ctx)))
          : h(
              'div',
              { class: 'empty-state' },
              h('div', { class: 'empty-state__title' }, t('noResults')),
              h('div', { class: 'empty-state__sub' }, t('noResultsSub')),
              h('a', { class: 'btn btn--primary', href: routes.categories }, t('clearFilters')),
            ),
      ),
    ),
    drawer.backdrop,
  );
}

/* ------------------------------------------------------------- sidebar --- */

function filterSidebar(ctx, { cat, band, withFilters }) {
  const { t, lang } = ctx;
  const cats = decorateCategories(lang, t);
  const bands = decoratePriceBands(lang);

  return h(
    'aside',
    { class: 'catalogue__sidebar', id: 'catalogue-filters' },
    h(
      'nav',
      { class: 'panel', 'aria-label': t('filterCat') },
      h('div', { class: 'panel__label' }, t('filterCat')),
      h(
        'div',
        { class: 'panel__list' },
        h(
          'a',
          {
            class: `filter-link${cat === 'all' ? ' is-active' : ''}`,
            href: withFilters({ cat: 'all' }),
            'aria-current': cat === 'all' ? 'true' : null,
          },
          t('filterAll'),
        ),
        ...cats.map((c) =>
          h(
            'a',
            {
              class: `filter-link${cat === c.id ? ' is-active' : ''}`,
              // Picking a category resets the price band, as in the design.
              href: withFilters({ cat: c.id, band: 'all' }),
              'aria-current': cat === c.id ? 'true' : null,
            },
            c.name,
          ),
        ),
      ),
    ),
    h(
      'nav',
      { class: 'panel', 'aria-label': t('filterPrice') },
      h('div', { class: 'panel__label' }, t('filterPrice')),
      h(
        'div',
        { class: 'panel__list' },
        ...bands.map((b) =>
          h(
            'a',
            {
              class: `filter-link${band === b.id ? ' is-active' : ''}`,
              href: withFilters({ band: b.id }),
              'aria-current': band === b.id ? 'true' : null,
            },
            b.label,
          ),
        ),
      ),
    ),
    h(
      'div',
      { class: 'help-card' },
      h('div', { class: 'help-card__title' }, t('helpTitle')),
      h('p', { class: 'help-card__sub' }, t('helpSub')),
      h('a', { class: 'help-card__hotline', href: `tel:${storeInfo.hotlineHref}` }, storeInfo.hotline),
    ),
  );
}

function sortControl({ t }, { sort, withFilters }) {
  const select = h(
    'select',
    {
      id: 'sort-select',
      onChange: (event) => navigate(withFilters({ sort: event.target.value })),
    },
    ...[
      ['pop', t('sortPop')],
      ['asc', t('sortAsc')],
      ['desc', t('sortDesc')],
      ['disc', t('sortDisc')],
    ].map(([value, label]) => h('option', { value, selected: value === sort }, label)),
  );

  return h('label', { class: 'sort-control', for: 'sort-select' }, t('sortBy'), select);
}

/* -------------------------------------------------------------- drawer --- */

/**
 * Below 960px the sidebar becomes a slide-over. The trigger and backdrop are
 * built here so the sidebar itself stays one node shared by both layouts.
 */
function drawerControls({ t, onCleanup }, sidebar) {
  const backdrop = h('div', { class: 'drawer-backdrop', hidden: true, onClick: () => close() });

  const button = h(
    'button',
    {
      type: 'button',
      class: 'btn btn--outline btn--sm filter-toggle',
      'aria-expanded': 'false',
      'aria-controls': 'catalogue-filters',
      onClick: () => (sidebar.classList.contains('is-open') ? close() : open()),
    },
    t('openFilters'),
  );

  function open() {
    sidebar.classList.add('is-open');
    backdrop.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKeydown);
    sidebar.querySelector('a, button')?.focus();
  }

  function close() {
    sidebar.classList.remove('is-open');
    backdrop.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      close();
      button.focus();
    }
  }

  // Choosing a filter navigates, which re-renders the page and drops the drawer.
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });

  // The Escape handler lives on document, so it has to go when the view does.
  onCleanup(() => document.removeEventListener('keydown', onKeydown));

  return { button, backdrop };
}
