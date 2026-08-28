import { config } from '../config.js';
import { LANGS } from '../i18n/index.js';

/**
 * Application state that outlives a single page render.
 *
 * Deliberately small: filters, sort and the current product live in the URL
 * (see core/router.js), and per-component scratch state (the PDP stepper, the
 * chosen payment method) stays inside its component. The order confirmation is
 * a URL too (/thanh-toan?order=…). What is left is the only two things that
 * must survive a reload: `lang` and `cart`.
 *
 * `cart` is `{ [productId]: qty }`, exactly as specified in the handoff.
 */

const STORAGE_KEY = '7map.store.v1';

function readPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const out = {};
    if (LANGS.includes(parsed.lang)) out.lang = parsed.lang;
    if (parsed.cart && typeof parsed.cart === 'object') {
      // Drop anything that is not a positive integer quantity — a hand-edited
      // localStorage entry must not be able to poison the totals.
      const cart = {};
      for (const [id, qty] of Object.entries(parsed.cart)) {
        const n = Math.floor(Number(qty));
        if (Number.isFinite(n) && n > 0) cart[id] = n;
      }
      out.cart = cart;
    }
    return out;
  } catch {
    // Private mode, disabled storage, corrupt JSON — start clean rather than crash.
    return {};
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: state.lang, cart: state.cart }));
  } catch {
    /* storage unavailable — the cart is simply not durable this session */
  }
}

const persisted = readPersisted();

let state = {
  lang: persisted.lang || (LANGS.includes(config.defaultLang) ? config.defaultLang : 'vi'),
  cart: persisted.cart || {},
};

const listeners = new Set();

export function getState() {
  return state;
}

/** Merge a patch into state, persist, and notify subscribers. */
export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...next };
  persist(state);
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------------------------------------------------------------- actions ---

export function setLang(lang) {
  if (!LANGS.includes(lang) || lang === state.lang) return;
  setState({ lang });
}

export function addToCart(id, qty = 1) {
  const n = Math.max(1, Math.floor(qty));
  setState((s) => ({ cart: { ...s.cart, [id]: (s.cart[id] || 0) + n } }));
}

/** Set an explicit quantity; 0 or less removes the line. */
export function setQty(id, qty) {
  setState((s) => {
    const cart = { ...s.cart };
    const n = Math.floor(qty);
    if (n > 0) cart[id] = n;
    else delete cart[id];
    return { cart };
  });
}

export function removeFromCart(id) {
  setState((s) => {
    const cart = { ...s.cart };
    delete cart[id];
    return { cart };
  });
}

export function clearCart() {
  setState({ cart: {} });
}

/** Total number of units in the cart — what the header badge shows. */
export function cartCount(s = state) {
  return Object.values(s.cart).reduce((n, q) => n + q, 0);
}
