import { asset, stripBase } from './base.js';

/**
 * History-API router.
 *
 * The prototype used a single `page` state variable; the handoff asks for real
 * routes and URLs, so every view is addressable and shareable:
 *
 *   /                       home
 *   /danh-muc               category listing  ?cat= &band= &sort= &q=
 *   /san-pham/:id           product detail
 *   /gio-hang               cart
 *   /thanh-toan             checkout
 *   /lien-he                contact
 *   /chinh-sach/:slug       policy document
 *
 * Filters live in the query string rather than in the store, so a filtered
 * listing survives a reload and can be linked to. Deep links need the server to
 * fall back to index.html — server.py does this; see README.md for nginx/Apache.
 */

/** Route paths as the app thinks of them — no base prefix. */
const PATHS = {
  home: '/',
  categories: '/danh-muc',
  product: '/san-pham',
  cart: '/gio-hang',
  checkout: '/thanh-toan',
  programs: '/chuong-trinh',
  contact: '/lien-he',
  policies: '/chinh-sach',
};

/**
 * The same routes as browser URLs, base included. These are what goes into an
 * `href`; `PATTERNS` below match the base-stripped path instead.
 */
export const routes = Object.fromEntries(
  Object.entries(PATHS).map(([name, path]) => [name, asset(path)]),
);

const PATTERNS = [
  { name: 'home', re: /^\/$/ },
  { name: 'categories', re: /^\/danh-muc\/?$/ },
  { name: 'product', re: /^\/san-pham\/([^/]+)\/?$/, keys: ['id'] },
  { name: 'cart', re: /^\/gio-hang\/?$/ },
  { name: 'checkout', re: /^\/thanh-toan\/?$/ },
  { name: 'programs', re: /^\/chuong-trinh\/?$/ },
  { name: 'contact', re: /^\/lien-he\/?$/ },
  { name: 'policies', re: /^\/chinh-sach(?:\/([^/]+))?\/?$/, keys: ['slug'] },
];

let listeners = new Set();

/** Parse the current location into `{ name, params, query, path }`. */
export function currentRoute() {
  const path = stripBase(decodeURI(window.location.pathname)) || '/';
  const query = Object.fromEntries(new URLSearchParams(window.location.search));

  for (const { name, re, keys } of PATTERNS) {
    const match = path.match(re);
    if (!match) continue;
    const params = {};
    (keys || []).forEach((key, i) => {
      const raw = match[i + 1];
      if (raw !== undefined) params[key] = decodeURIComponent(raw);
    });
    return { name, params, query, path };
  }
  return { name: 'notFound', params: {}, query, path };
}

/** Build a URL from a path plus a query object, dropping empty values. */
export function href(path, query) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function productHref(id) {
  return `${routes.product}/${encodeURIComponent(id)}`;
}

export function policyHref(slug) {
  return `${routes.policies}/${encodeURIComponent(slug)}`;
}

/**
 * Navigate. Every navigation scrolls to top, as specified in the handoff.
 * `replace: true` is used for canonicalising redirects so the Back button
 * does not bounce through them.
 */
export function navigate(url, { replace = false, scroll = true } = {}) {
  const current = window.location.pathname + window.location.search;
  if (url === current && !replace) {
    if (scroll) window.scrollTo(0, 0);
    return;
  }
  if (replace) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
  emit({ scroll });
}

export function onRouteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(detail) {
  for (const fn of listeners) fn(currentRoute(), detail);
}

/**
 * Start the router. Intercepts same-origin left-clicks on `<a href="/...">` so
 * links are ordinary anchors — right-click, middle-click and "open in new tab"
 * keep working, and the markup stays crawlable.
 */
export function startRouter() {
  window.addEventListener('popstate', () => emit({ scroll: true }));

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a');
    if (!anchor) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    if (anchor.origin !== window.location.origin) return;
    if (anchor.getAttribute('href')?.startsWith('#')) return;

    event.preventDefault();
    navigate(anchor.pathname + anchor.search);
  });
}
