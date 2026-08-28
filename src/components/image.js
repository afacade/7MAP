import { h } from '../core/dom.js';
import { asset } from '../core/base.js';

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
  const img = h('img', {
    class: 'well__img',
    src: asset(src),
    alt,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    sizes,
  });

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

  img.addEventListener('error', () => well.classList.add('is-missing'));
  return well;
}
