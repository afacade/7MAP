import vi from './vi.js';
import en from './en.js';

export const LANGS = ['vi', 'en'];

const catalogues = { vi, en };

/**
 * Returns a translate function bound to one language.
 *
 * `t('addToCartOf', { name: 'Gạo ST25' })` interpolates `{name}` placeholders.
 * A missing key returns the key itself so the gap is visible rather than blank.
 */
export function translator(lang) {
  const dict = catalogues[lang] || catalogues.vi;
  return function t(key, vars) {
    const raw = dict[key];
    if (raw === undefined) {
      console.warn(`[i18n] missing key "${key}" for "${lang}"`);
      return key;
    }
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (whole, name) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
    );
  };
}

/** Whole catalogue, for the rare place that needs to read many keys at once. */
export function messages(lang) {
  return catalogues[lang] || catalogues.vi;
}

/** Dev-only guard: the handoff requires every string to exist in both languages. */
export function assertCataloguesMatch() {
  const viKeys = Object.keys(vi);
  const enKeys = new Set(Object.keys(en));
  const missingEn = viKeys.filter((k) => !enKeys.has(k));
  const missingVi = Object.keys(en).filter((k) => !(k in vi));
  if (missingEn.length) console.warn('[i18n] missing in en.js:', missingEn);
  if (missingVi.length) console.warn('[i18n] missing in vi.js:', missingVi);
  return missingEn.length === 0 && missingVi.length === 0;
}
