import { storeInfo } from '../config.js';

/**
 * Formatting helpers. Prices and quantities render with
 * `font-variant-numeric: tabular-nums` in the stylesheet so figures line up
 * between rows.
 */

/**
 * The hotline as each audience writes it — `070 779 6663` in Vietnamese, the
 * international `+84 70 779 6663` in English. Same digits either way; only the
 * grouping differs, and `storeInfo.hotlineHref` remains the dialable form.
 */
export function hotlineFor(lang) {
  return storeInfo.hotline[lang === 'en' ? 'en' : 'vi'];
}

/**
 * Money, e.g. 175000 → "175.000₫" (vi) or "175,000₫" (en).
 *
 * DEVIATION FROM THE PROTOTYPE, deliberate: the prototype formatted with
 * `toLocaleString('vi-VN')` in both languages, which put dot separators next to
 * its own English copy ("orders over 300,000₫"). Grouping now follows the active
 * language so the two agree. The symbol stays a trailing ₫ in both.
 */
export function money(amount, lang = 'vi') {
  const locale = lang === 'en' ? 'en-US' : 'vi-VN';
  return `${Math.round(amount).toLocaleString(locale)}₫`;
}

/**
 * Fold a string for searching: no diacritics, no case.
 *
 * Vietnamese shoppers type without tone marks — "gao" for "Gạo", "quan lot" for
 * "Quần lót" — and a plain `includes()` on the raw name finds neither. NFD
 * splits each letter from its accents so the combining marks can be dropped;
 * đ/Đ carry no combining mark and are mapped by hand.
 */
export function fold(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/** Discount as a whole percent; 0 when the product has no previous price. */
export function discountPercent(price, was) {
  if (!was || was <= price) return 0;
  return Math.round((1 - price / was) * 100);
}

/** Seconds → zero-padded `{ h, m, s }` for the flash-sale chips. */
export function countdownParts(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const pad = (n) => String(n).padStart(2, '0');
  return {
    h: pad(Math.floor(safe / 3600)),
    m: pad(Math.floor((safe % 3600) / 60)),
    s: pad(safe % 60),
  };
}

/**
 * Vietnamese mobile / landline numbers, accepting the shapes people actually
 * type: 0909000000, 0909 000 000, 0909-000-000, +84909000000, 84909000000.
 */
export function isValidVnPhone(input) {
  const digits = String(input).replace(/[\s.\-()]/g, '');
  return /^(?:\+?84|0)(?:3|5|7|8|9|1\d)\d{7,8}$/.test(digits);
}

/** Order numbers are `7M-` plus five digits, as in the design. */
export function generateOrderNumber() {
  const n = 20000 + Math.floor(Math.random() * 9000);
  return `7M-${n}`;
}
