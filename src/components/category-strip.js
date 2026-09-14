import { h } from '../core/dom.js';
import { routes, href } from '../core/router.js';
import { imageWell } from './image.js';
import { carousel } from './carousel.js';
import { SIZES } from '../lib/images.js';
import { stripCategories } from '../lib/catalog.js';

/**
 * The "Danh mục" strip: every department as a round photo over its name,
 * modelled on the marketplace category row the shop pointed at. Two rows,
 * paged sideways by the shared carousel, so a phone swipes through what a
 * desktop shows at once. The column count comes from `--cats-per-row`.
 *
 * Sits at the top of the home page and the products page. `active` marks the
 * department being browsed; `className` lets the home page give it the same
 * width as its other sections.
 */
export function categoryStrip(ctx, { active = null, className = '' } = {}) {
  const { t, lang } = ctx;
  const items = stripCategories(lang);
  if (!items.length) return null;

  const strip = carousel({
    items,
    renderItem: (item) => tile(item, item.id === active),
    ctx,
    gridClass: 'cat-strip__grid',
    colsVar: '--cats-per-row',
    label: t('catsTitle'),
  });

  return h(
    'section',
    { class: ['cat-strip', className].filter(Boolean).join(' ') },
    h(
      'div',
      { class: 'cat-strip__head' },
      h('h2', { class: 'cat-strip__title' }, t('catsTitle')),
      strip.controls,
    ),
    strip.node,
  );
}

function tile(item, isActive) {
  return h(
    'a',
    {
      class: `cat-strip__tile${isActive ? ' is-active' : ''}`,
      href: href(routes.categories, { cat: item.id }),
      'aria-current': isActive ? 'page' : null,
    },
    // A well fills a positioned frame, as everywhere else on the site; the
    // frame carries the size and the circle.
    h('span', { class: 'cat-strip__icon' }, imageWell({ src: item.image, alt: '', sizes: SIZES.icon })),
    h('span', { class: 'cat-strip__name' }, item.name),
  );
}
