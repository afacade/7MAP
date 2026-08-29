import { h } from '../core/dom.js';

/**
 * A paged product shelf: at most two rows on screen, the rest reachable by
 * swiping or by the arrows in the section header.
 *
 * Built on native scroll-snap rather than transforms, which buys three things
 * for free: a real swipe gesture on touch devices, keyboard scrolling, and
 * correct behaviour when a slide's content is focused with Tab. Nothing is
 * hidden from assistive technology — off-screen slides are scrolled to, not
 * display:none — so the whole shelf stays reachable.
 *
 * How many products fit a page depends on the breakpoint, so the column count
 * is read from a CSS custom property (the stylesheet stays the single source of
 * truth for layout) and the slides are re-chunked when it changes.
 *
 *   items      already-decorated products
 *   renderItem (item) => node
 *   gridClass  the grid class each slide uses ('product-grid', 'best-grid')
 *   colsVar    CSS custom property holding the current column count
 *   label      accessible name for the carousel region
 *   rows       rows per page (2 — the whole point of the exercise)
 *
 * Returns `{ node, controls }` so the arrows can live in the section header
 * while the track sits below it.
 */
export function carousel({ items, renderItem, ctx, gridClass, colsVar, label, rows = 2 }) {
  const { t, onCleanup } = ctx;

  const track = h('div', { class: 'carousel__track', tabindex: '0' });
  const node = h(
    'div',
    { class: 'carousel', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': label },
    track,
  );

  const prev = h(
    'button',
    { type: 'button', class: 'carousel__btn', 'aria-label': t('carouselPrev') },
    h('span', { 'aria-hidden': 'true' }, '‹'),
  );
  const next = h(
    'button',
    { type: 'button', class: 'carousel__btn', 'aria-label': t('carouselNext') },
    h('span', { 'aria-hidden': 'true' }, '›'),
  );
  const dots = h('div', { class: 'carousel__dots' });
  const controls = h('div', { class: 'carousel__controls' }, prev, dots, next);

  let cols = 0;
  let pages = 1;
  /* The page we are on or heading to. Held explicitly rather than derived from
     scrollLeft, because a smooth scroll has not moved yet when the click is
     handled — and because the arrows must respond even if a scroll event never
     arrives. The scroll listener syncs this back for swipes. */
  let index = 0;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

  /** Columns currently rendered by the grid, per the stylesheet. */
  function readCols() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(colsVar);
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 4;
  }

  function build() {
    cols = readCols();
    const perPage = cols * rows;
    pages = Math.max(1, Math.ceil(items.length / perPage));

    const slides = [];
    for (let i = 0; i < pages; i += 1) {
      const slice = items.slice(i * perPage, (i + 1) * perPage);
      slides.push(
        h(
          'div',
          {
            class: 'carousel__slide',
            role: 'group',
            'aria-roledescription': 'slide',
            'aria-label': t('carouselSlide', { n: i + 1, total: pages }),
          },
          h('div', { class: gridClass }, ...slice.map(renderItem)),
        ),
      );
    }
    track.replaceChildren(...slides);
    index = Math.min(index, pages - 1);

    // A single page needs no chrome at all.
    node.classList.toggle('carousel--single', pages === 1);
    controls.hidden = pages === 1;

    buildDots();
    goTo(index, 'auto');
  }

  function buildDots() {
    dots.replaceChildren(
      ...Array.from({ length: pages }, (_, i) =>
        h('button', {
          type: 'button',
          class: 'carousel__dot',
          'aria-label': t('carouselGoTo', { n: i + 1, total: pages }),
          onClick: () => goTo(i),
        }),
      ),
    );
  }

  /** Move to a page and reflect it immediately — no waiting on scroll events. */
  function goTo(i, how) {
    index = Math.max(0, Math.min(i, pages - 1));
    track.scrollTo({ left: index * track.clientWidth, behavior: how || behavior() });
    update();
  }

  function update() {
    prev.disabled = index <= 0;
    next.disabled = index >= pages - 1;
    [...dots.children].forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));

  /* Swiping and keyboard scrolling move the track without going through goTo,
     so read the settled position back into `index`. */
  track.addEventListener('scroll', () => {
    window.clearTimeout(track._t);
    track._t = window.setTimeout(() => {
      if (!track.clientWidth) return;
      const landed = Math.round(track.scrollLeft / track.clientWidth);
      if (landed !== index) {
        index = Math.max(0, Math.min(landed, pages - 1));
        update();
      }
    }, 90);
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
  });

  // Re-chunk only when the breakpoint actually changes the column count.
  const onResize = () => {
    if (readCols() !== cols) build();
    else update();
  };
  window.addEventListener('resize', onResize);
  onCleanup(() => window.removeEventListener('resize', onResize));

  build();

  return { node, controls };
}
