import { h } from '../core/dom.js';
import { asset } from '../core/base.js';
import { responsiveSources } from '../lib/images.js';

/**
 * An image well: a warm-tinted, fixed-ratio frame with a real `<img>` inside.
 *
 * The design prototype used drag-and-drop `<image-slot>` placeholders. Those are
 * a prototyping affordance and are not ported — every well here renders an
 * ordinary `<img>` backed by the product/category record. Because the client has
 * not supplied photography yet, a labelled placeholder sits behind the image and
 * shows through if the file 404s, rather than a broken-image icon. Drop real
 * files at the record's path and nothing else has to change.
 *
 * The placeholder comes first in the DOM so the loaded image paints over it.
 */
export function imageWell({
  src,
  alt = '',
  hint = '',
  label,
  className = '',
  eager = false,
  sizes,
}) {
  // Most of the imported catalogue has no web-sized photo yet. An `<img src="">`
  // resolves to the page itself and behaves differently in every browser, so a
  // record without an image gets no `<img>` at all — just the placeholder that
  // would have shown through anyway.
  // Pre-generated size variants, so a 262px card does not download an 800px
  // photo. See lib/images.js — the widths must match tools/make_variants.py.
  const sources = responsiveSources(src);
  const img = src
    ? h('img', {
        class: 'well__img',
        src: asset(sources ? sources.src : src),
        srcset: sources
          ? sources.candidates.map(([path, width]) => `${asset(path)} ${width}w`).join(', ')
          : null,
        alt,
        loading: eager ? 'eager' : 'lazy',
        decoding: 'async',
        sizes: sources ? sizes : null,
      })
    : null;

  const well = h(
    'div',
    { class: ['well', className].filter(Boolean).join(' ') },
    h(
      'div',
      { class: 'well__placeholder', 'aria-hidden': 'true' },
      label && h('span', { class: 'well__placeholder-label' }, label),
      hint && h('span', { class: 'well__placeholder-hint' }, hint),
    ),
    img,
  );

  if (img) {
    img.addEventListener('error', () => {
      // A missing variant should degrade to the master, not to a placeholder.
      // Dropping srcset makes the browser retry with `src` alone; only if that
      // fails too is the photo genuinely absent.
      if (img.hasAttribute('srcset')) {
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.src = asset(src);
        return;
      }
      well.classList.add('is-missing');
    });
  }
  return well;
}
