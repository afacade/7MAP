/**
 * Where the site is served from.
 *
 * Locally that is the domain root (`/`); on GitHub Pages this repo is a project
 * site, so everything lives under `/7MAP/`. `index.html` sets a `<base>` tag
 * before the first stylesheet is parsed, which is what makes the CSS and module
 * imports resolve. This module reads that same value back so routes and image
 * URLs agree with it.
 *
 * Nothing in the app should ever emit a bare root-absolute URL — run it through
 * `asset()` and it works under any base.
 */

/** Always has a trailing slash: '/' or '/7MAP/'. */
export const BASE = new URL(document.baseURI).pathname.replace(/\/*$/, '/');

/** '/images/banner.jpg' → '/7MAP/images/banner.jpg' (or unchanged locally). */
export function asset(path) {
  if (!path) return path;
  if (/^[a-z]+:/i.test(path) || path.startsWith('//')) return path; // already absolute
  return path.startsWith('/') ? BASE + path.slice(1) : path;
}

/**
 * The inverse: turn a browser pathname into the app-level route path the
 * router matches against. `/7MAP/danh-muc` → `/danh-muc`.
 */
export function stripBase(pathname) {
  if (BASE === '/') return pathname || '/';
  if (pathname.startsWith(BASE)) return `/${pathname.slice(BASE.length)}`;
  // `/7MAP` with no trailing slash is still the home route.
  if (pathname === BASE.slice(0, -1)) return '/';
  return pathname;
}
