import { allProducts, getProduct, countByCategory } from '../data/catalogue.js';
import { categories, getCategory, priceBands } from '../data/categories.js';
import { config } from '../config.js';
import { money, discountPercent, fold } from './format.js';

/**
 * Read model over the catalogue.
 *
 * Filtering and sorting run client-side because the catalogue is small. When
 * this moves behind an API the page components should not have to change —
 * they only ever see the shapes returned from here.
 */

const BADGE_KEYS = { hot: 'badgeHot', new: 'badgeNew', best: 'badgeBest' };

/** Turn a raw product record into everything a card or PDP needs to render. */
export function decorate(product, lang, t) {
  const category = getCategory(product.cat);
  const discount = discountPercent(product.price, product.was);
  const claimed = product.flash ?? 50;

  return {
    id: product.id,
    sku: product.sku,
    // The POS export carries no English, so English falls back to Vietnamese
    // rather than rendering the string "undefined" on 8,800 cards.
    name: (lang === 'vi' ? product.nameVi : product.nameEn) ?? product.nameVi ?? '',
    categoryId: product.cat,
    categoryName: category ? (lang === 'vi' ? category.nameVi : category.nameEn) : '',
    unit: (lang === 'vi' ? product.unitVi : product.unitEn) ?? product.unitVi ?? '',
    /** Long copy, when the shop has written some for this product. */
    description: (lang === 'vi' ? product.descVi : product.descEn) || '',
    price: product.price,
    priceStr: money(product.price, lang),
    hasWas: Boolean(product.was),
    wasStr: product.was ? money(product.was, lang) : '',
    discount,
    discountLabel: `−${discount}%`,
    badge: product.badge ? t(BADGE_KEYS[product.badge]) : null,
    rank: product.rank || null,
    claimedPct: claimed,
    claimedLabel: t('soldLabel', { n: claimed }),
    images: product.images,
    image: product.image,
  };
}

/**
 * Category tiles. Departments with nothing in stock are left out — the shop
 * lists them, but showing a tile that opens an empty shelf helps nobody. They
 * reappear on their own as soon as a product is filed under them.
 */
export function decorateCategories(lang, t) {
  return categories
    .map((c) => ({ category: c, count: countByCategory(c.id) }))
    .filter(({ count }) => count > 0)
    .map(({ category, count }) => ({
      id: category.id,
      name: lang === 'vi' ? category.nameVi : category.nameEn,
      countLabel: t('itemsCount', { n: count }),
      image: category.image || getProduct(category.heroProduct)?.image || '',
    }));
}

export function decoratePriceBands(lang) {
  return priceBands.map((b) => ({ id: b.id, label: lang === 'vi' ? b.nameVi : b.nameEn }));
}

/**
 * Category ∧ price band ∧ search query, then sort — the composition order the
 * handoff specifies.
 */
export function queryCatalogue({ cat = 'all', band = 'all', sort = 'pop', query = '', page = 1 } = {}) {
  const bandDef = priceBands.find((b) => b.id === band) || priceBands[0];
  // Fold the needle the same way the products were folded at load, so a search
  // for "gao" finds "Gạo".
  const needle = fold(query.trim());

  // One pass rather than three intermediate arrays.
  const list = allProducts().filter(
    (p) =>
      (cat === 'all' || p.cat === cat) &&
      bandDef.test(p) &&
      (!needle || p.search.includes(needle)),
  );

  /**
   * Every comparator ends on id. The imported products all carry `pop: 0`, so
   * without a tie-break the sort order would be unspecified between them and a
   * product could show up on two pages — or on none.
   */
  const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const sorted = list.slice();
  if (sort === 'asc') sorted.sort((a, b) => a.price - b.price || byId(a, b));
  else if (sort === 'desc') sorted.sort((a, b) => b.price - a.price || byId(a, b));
  else if (sort === 'disc') {
    sorted.sort(
      (a, b) =>
        discountPercent(b.price, b.was) - discountPercent(a.price, a.was) || byId(a, b),
    );
  } else sorted.sort((a, b) => b.pop - a.pop || byId(a, b));

  const pages = Math.max(1, Math.ceil(sorted.length / config.pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const start = (current - 1) * config.pageSize;

  return {
    items: sorted.slice(start, start + config.pageSize),
    total: sorted.length,
    page: current,
    pages,
  };
}

/**
 * The five the shop named as its best sellers, in the order they gave them.
 *
 * Only the curated records carry a `shelf`, so the homepage shelves are
 * unaffected by the POS import and render before the catalogue has loaded.
 */
export function bestSellers() {
  return allProducts()
    .filter((p) => p.shelf === 'best')
    .sort((a, b) => a.rank - b.rank);
}

/**
 * One of the homepage shelves the shop curated by sending us a photo group:
 * 'for-you' (Gợi ý riêng cho bạn) or 'suggested' (Gợi ý cho bạn).
 * Order follows the order of the photos in the message.
 */
export function shelfProducts(shelf) {
  return allProducts().filter((p) => p.shelf === shelf);
}

export function flashProducts() {
  return allProducts().filter((p) => p.flash);
}

/**
 * Same category first, then anything else, capped at four.
 *
 * Stops as soon as it has enough. The previous version built two arrays
 * covering the entire catalogue to return four cards, which at 8,800 products
 * meant two full-length allocations on every product view.
 */
export function relatedProducts(product, limit = 4) {
  const list = allProducts();
  const sameCat = [];
  const others = [];

  for (const candidate of list) {
    if (candidate.id === product.id) continue;
    if (candidate.cat === product.cat) {
      sameCat.push(candidate);
      if (sameCat.length >= limit) break;
    } else if (others.length < limit) {
      others.push(candidate);
    }
  }

  return sameCat.concat(others).slice(0, limit);
}

/** The spec table on the PDP. */
export function productSpecs(decorated, t) {
  return [
    { k: t('specCategory'), v: decorated.categoryName },
    { k: t('specPack'), v: decorated.unit },
    { k: t('specOrigin'), v: t('specOriginVal') },
    { k: t('specReturns'), v: t('specReturnsVal') },
  ];
}

// -------------------------------------------------------------------- cart --

/** Expand `{ id: qty }` into renderable lines, skipping ids no longer stocked. */
export function cartLines(cart, lang, t) {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const product = getProduct(id);
      if (!product) return null;
      const d = decorate(product, lang, t);
      return { ...d, qty, lineTotal: product.price * qty, lineTotalStr: money(product.price * qty, lang) };
    })
    .filter(Boolean);
}

/**
 * Subtotal, delivery and grand total.
 *
 * An empty cart is charged nothing; otherwise delivery is free at or above the
 * threshold and a flat fee below it.
 */
export function orderTotals(lines, lang, t) {
  const subtotal = lines.reduce((n, line) => n + line.lineTotal, 0);
  const isFree = subtotal >= config.freeShipThreshold;
  const shipping = subtotal === 0 || isFree ? 0 : config.shippingFee;
  const shortfall = Math.max(0, config.freeShipThreshold - subtotal);

  return {
    subtotal,
    subtotalStr: money(subtotal, lang),
    shipping,
    shippingStr: shipping === 0 ? t('freeLabel') : money(shipping, lang),
    shippingIsFree: shipping === 0,
    total: subtotal + shipping,
    totalStr: money(subtotal + shipping, lang),
    note: isFree ? t('shipFree') : t('shipShortfall', { amount: money(shortfall, lang) }),
  };
}
