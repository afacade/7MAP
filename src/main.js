import { h, mount } from './core/dom.js';
import { currentRoute, startRouter, onRouteChange, routes } from './core/router.js';
import { getState, subscribe } from './core/store.js';
import { mountAnnouncer } from './core/announce.js';
import { translator, assertCataloguesMatch } from './i18n/index.js';
import { config, storeInfo } from './config.js';
import { siteHeader } from './components/header.js';
import { siteFooter } from './components/footer.js';
import { zaloButton } from './components/zalo-button.js';
import { homePage } from './pages/home.js';
import { categoriesPage } from './pages/categories.js';
import { productPage } from './pages/product.js';
import { cartPage } from './pages/cart.js';
import { checkoutPage } from './pages/checkout.js';
import { contactPage } from './pages/contact.js';
import { policiesPage } from './pages/policies.js';
import { programsPage } from './pages/programs.js';
import { getProduct } from './data/products.js';
import { getCategory } from './data/categories.js';
import { getPolicy } from './data/policies.js';

const root = document.getElementById('app');

const PAGES = {
  home: homePage,
  categories: categoriesPage,
  product: productPage,
  cart: cartPage,
  checkout: checkoutPage,
  programs: programsPage,
  contact: contactPage,
  policies: policiesPage,
};

/**
 * Teardown callbacks registered by the current view (the flash countdown's
 * interval, the filter drawer's document listener). Run before every re-render
 * so nothing outlives the DOM it belongs to.
 */
let cleanups = [];
const onCleanup = (fn) => cleanups.push(fn);

/** URL of the last render, so we know whether this one is a navigation. */
let lastUrl = null;

function render({ scroll = false } = {}) {
  for (const fn of cleanups) fn();
  cleanups = [];

  const state = getState();
  const route = currentRoute();
  const t = translator(state.lang);
  const ctx = { t, lang: state.lang, state, route, onCleanup };

  const url = route.path + window.location.search;
  const isSameView = url === lastUrl;
  const snapshot = isSameView ? snapshotFields() : null;

  document.documentElement.lang = state.lang;
  document.title = titleFor(ctx);

  const page = PAGES[route.name];
  mount(
    root,
    h(
      'div',
      { style: { display: 'contents' } },
      h('a', { class: 'skip-link', href: '#main' }, t('skipToContent')),
      siteHeader(ctx),
      h('main', { id: 'main', tabindex: '-1' }, page ? page(ctx) : notFoundPage(ctx)),
      siteFooter(ctx),
      zaloButton(ctx),
    ),
  );

  if (snapshot) restoreFields(snapshot);
  lastUrl = url;
  if (scroll) window.scrollTo(0, 0);
}

/* -------------------------------------------------- form-value carry-over -- */

/**
 * A cart or language change re-renders the whole page. Uncontrolled inputs would
 * lose whatever the visitor had typed, so their values (and the caret) are
 * carried across — but only when the view is the same one, never on navigation.
 */
function snapshotFields() {
  const values = {};
  for (const el of root.querySelectorAll('[data-field]')) values[el.dataset.field] = el.value;

  const active = document.activeElement;
  const activeField = active && active.dataset ? active.dataset.field : null;

  return {
    values,
    activeField,
    selectionStart: activeField && 'selectionStart' in active ? active.selectionStart : null,
    selectionEnd: activeField && 'selectionEnd' in active ? active.selectionEnd : null,
  };
}

function restoreFields(snapshot) {
  for (const el of root.querySelectorAll('[data-field]')) {
    const value = snapshot.values[el.dataset.field];
    if (value !== undefined) el.value = value;
  }
  if (!snapshot.activeField) return;

  const target = root.querySelector(`[data-field="${CSS.escape(snapshot.activeField)}"]`);
  if (!target) return;
  target.focus();
  if (snapshot.selectionStart !== null && 'setSelectionRange' in target) {
    try {
      target.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
    } catch {
      /* selection is not supported on this input type */
    }
  }
}

/* ------------------------------------------------------------------ misc -- */

function titleFor({ t, lang, route }) {
  let page;
  switch (route.name) {
    case 'home':
      return `${storeInfo.name} · ${t('tagline')}`;
    case 'categories': {
      const category = getCategory(route.query.cat);
      page = category ? (lang === 'vi' ? category.nameVi : category.nameEn) : t('navCats');
      break;
    }
    case 'product': {
      const product = getProduct(route.params.id);
      page = product ? (lang === 'vi' ? product.nameVi : product.nameEn) : t('notFoundTitle');
      break;
    }
    case 'cart':
      page = t('cartTitle');
      break;
    case 'checkout':
      page = t('checkoutTitle');
      break;
    case 'programs':
      page = t('programsTitle');
      break;
    case 'contact':
      page = t('navContact');
      break;
    case 'policies':
      page = getPolicy(lang, route.params.slug).title;
      break;
    default:
      page = t('pageNotFoundTitle');
  }
  return t('documentTitle', { page });
}

function notFoundPage({ t }) {
  return h(
    'section',
    { class: 'page page-top' },
    h('h1', { class: 'page-title page-title--view' }, t('pageNotFoundTitle')),
    h(
      'div',
      { class: 'empty-state' },
      h('div', { class: 'empty-state__sub' }, t('pageNotFoundSub')),
      h('a', { class: 'btn btn--primary', href: routes.home }, t('backHome')),
    ),
  );
}

/* ----------------------------------------------------------------- boot -- */

if (config.productsPerRow === 3) document.documentElement.classList.add('cols-3');

mountAnnouncer(document.body);
assertCataloguesMatch();
startRouter();
onRouteChange((route, detail) => render({ scroll: detail?.scroll !== false }));
subscribe(() => render());
render();
