import { curated } from './products.js';
import { asset } from '../core/base.js';
import { fold } from '../lib/format.js';

/**
 * The catalogue: the shop's 55 curated records plus everything the POS says is
 * in stock.
 *
 * The imported half is a static JSON file rather than a JS module because it is
 * ~1.2 MB — as a module it would sit in the import graph of every page and be
 * parsed before first paint, including on the cart and the contact form. Here it
 * is fetched once, lazily, and only the pages that actually browse the
 * catalogue wait for it. The homepage renders from `curated` alone and never
 * blocks.
 *
 * Callers that need the whole catalogue check `isLoaded()` first and render a
 * skeleton until it flips; `main.js` re-renders once when the fetch resolves.
 * Nothing here is async from the caller's point of view.
 */

const SOURCE = '/data/catalogue.json';

/**
 * Everything a record needs before the read model in `lib/catalog.js` touches
 * it. Both halves of the catalogue go through this, so a curated record and an
 * imported one are indistinguishable downstream.
 */
function prepare(record) {
  const image = record.image || '';
  return {
    was: 0,
    ...record,
    image,
    // The old `id.slice(0, 8)` collided in the thousands once ids became
    // barcodes. Whole id, no collisions.
    sku: `7M-${String(record.id).toUpperCase()}`,
    // One photograph per product today. When the shop sends alternate angles,
    // push them onto this array and the product page grows a thumbnail strip.
    images: image ? [image] : [],
    // Folded once here rather than per product per keystroke in queryCatalogue.
    search: fold(`${record.nameVi || ''} ${record.nameEn || ''}`),
  };
}

let all = curated.map(prepare);
let byId = new Map(all.map((p) => [p.id, p]));
let counts = countUp(all);
let loaded = false;
let pending = null;

function countUp(list) {
  const map = new Map();
  for (const product of list) map.set(product.cat, (map.get(product.cat) || 0) + 1);
  return map;
}

function index(list) {
  all = list;
  byId = new Map(list.map((p) => [p.id, p]));
  counts = countUp(list);
}

/**
 * Fetch the imported catalogue once.
 *
 * Resolves either way — a storefront that has lost its catalogue file should
 * still sell the 55 curated products rather than show an error page, so a
 * failure is logged and the curated set stands.
 */
export function loadCatalogue() {
  if (pending) return pending;

  pending = fetch(asset(SOURCE))
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response.json();
    })
    .then((imported) => {
      // Curated records win on id: the shop wrote copy and chose a photo for
      // those, and a barcode collision should not overwrite that.
      const merged = curated.map(prepare);
      const seen = new Set(merged.map((p) => p.id));
      for (const record of imported) {
        if (!seen.has(record.id)) merged.push(prepare(record));
      }
      index(merged);
      loaded = true;
      return all;
    })
    .catch((error) => {
      console.error('Catalogue failed to load; showing curated products only.', error);
      loaded = true;
      return all;
    });

  return pending;
}

/** Has the imported half arrived (or definitively failed)? */
export function isLoaded() {
  return loaded;
}

/** Every product, curated and imported. */
export function allProducts() {
  return all;
}

export function getProduct(id) {
  return byId.get(id) || null;
}

/** Precomputed — the sidebar asks for all 18 of these on every render. */
export function countByCategory(catId) {
  return counts.get(catId) || 0;
}
