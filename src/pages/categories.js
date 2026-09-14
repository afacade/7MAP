import { h } from '../core/dom.js';
import { routes, href, navigate } from '../core/router.js';
import { storeInfo } from '../config.js';
import { hotlineFor } from '../lib/format.js';
import { getCategory, sortOptions } from '../data/categories.js';
import { isLoaded } from '../data/catalogue.js';
import { decorate, decorateCategories, decoratePriceBands, queryCatalogue } from '../lib/catalog.js';
import { productCard } from '../components/product-card.js';
import { categoryStrip } from '../components/category-strip.js';

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
  const page = Number(route.query.page) || 1;

  const found = queryCatalogue({ cat, band, sort, query, page });
  const results = found.items.map((p) => decorate(p, lang, t));
  const category = getCategory(cat);
  const title = category ? (lang === 'vi' ? category.nameVi : category.nameEn) : t('filterAll');

  /** Keep the other filters when one of them changes. Defaults are omitted so
   *  the URL only ever names what the visitor actually chose. Changing any
   *  filter returns to page 1 — page 7 of the old result set means nothing in
   *  the new one. */
  const withFilters = (patch) => {
    const next = { cat, band, sort, q: query, page: 1, ...patch };
    if (next.sort === 'pop') next.sort = '';
    if (Number(next.page) === 1) next.page = '';
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
    categoryStrip(ctx, { active: category ? cat : null }),
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
              t('productsCount', { n: found.total }),
              found.pages > 1 ? ` · ${t('pageOf', { page: found.page, pages: found.pages })}` : '',
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
          : isLoaded()
            ? h(
                'div',
                { class: 'empty-state' },
                h('div', { class: 'empty-state__title' }, t('noResults')),
                h('div', { class: 'empty-state__sub' }, t('noResultsSub')),
                h('a', { class: 'btn btn--primary', href: routes.categories }, t('clearFilters')),
              )
            : h(
                'div',
                { class: 'empty-state' },
                h('div', { class: 'empty-state__sub' }, t('loadingCatalogue')),
              ),
        pager(ctx, { found, withFilters }),
      ),
    ),
    drawer.backdrop,
  );
}

/* --------------------------------------------------------------- pager --- */

/**
 * The catalogue runs to thousands of lines per department, so the listing is
 * paged rather than rendered whole. Pages are ordinary links carrying the
 * current filters, which keeps a paged view linkable and reloadable like every
 * other filter here.
 *
 * The window is first · … · current−1 · current · current+1 · … · last, so the
 * control stays the same width whether there are 3 pages or 300.
 */
function pager({ t }, { found, withFilters }) {
  if (found.pages <= 1) return null;

  const { page, pages } = found;
  const numbers = [];
  for (let n = 1; n <= pages; n += 1) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) numbers.push(n);
    else if (numbers[numbers.length - 1] !== null) numbers.push(null); // gap
  }

  const step = (target, label, disabled) =>
    disabled
      ? h('span', { class: 'pager__step is-disabled', 'aria-hidden': 'true' }, label)
      : h('a', { class: 'pager__step', href: withFilters({ page: target }), rel: target < page ? 'prev' : 'next' }, label);

  return h(
    'nav',
    { class: 'pager', 'aria-label': t('pagerLabel') },
    step(page - 1, t('pagePrev'), page <= 1),
    ...numbers.map((n) =>
      n === null
        ? h('span', { class: 'pager__gap', 'aria-hidden': 'true' }, '…')
        : h(
            'a',
            {
              class: `pager__page${n === page ? ' is-current' : ''}`,
              href: withFilters({ page: n }),
              'aria-current': n === page ? 'page' : null,
              'aria-label': t('pageNumber', { n }),
            },
            String(n),
          ),
    ),
    step(page + 1, t('pageNext'), page >= pages),
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
      h('a', { class: 'help-card__hotline', href: `tel:${storeInfo.hotlineHref}` }, hotlineFor(lang)),
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
