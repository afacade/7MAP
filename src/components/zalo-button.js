import { h } from '../core/dom.js';
import { storeInfo } from '../config.js';
import { asset } from '../core/base.js';

/**
 * Floating Zalo button, pinned to the bottom of the viewport on every page —
 * the shortcut Vietnamese shoppers expect for reaching a shop directly.
 *
 * Tapping it opens a menu of the things people actually message about, rather
 * than dropping them into an empty chat. Every entry opens the same Zalo
 * account: Zalo has no supported way to prefill a message from a link, so the
 * menu's job is to tell the customer what the shop handles here, not to route
 * them somewhere different. The list is `ZALO_TOPICS` below and matches the
 * topic options on the contact form.
 *
 * The mark in images/zalo-logo.svg is a hand-built likeness, not Zalo's
 * official artwork. Drop the real asset in at that path — same filename — and
 * the button picks it up with no code change.
 */

/** i18n keys for the menu, in the order the shop asked for. */
export const ZALO_TOPICS = [
  'zaloChat',
  'zaloFeedback',
  'zaloReturns',
  'zaloDelivery',
  'zaloWarranty',
  'zaloWholesale',
  'zaloCharity',
  'zaloVendor',
  'zaloJobs',
  'zaloPartner',
];

export function zaloButton({ t, onCleanup }) {
  const menu = h(
    'div',
    { class: 'zalo-fab__menu', id: 'zalo-menu', hidden: true },
    h('p', { class: 'zalo-fab__menu-title' }, t('zaloMenuTitle')),
    h(
      'ul',
      { class: 'zalo-fab__list' },
      ...ZALO_TOPICS.map((key) =>
        h(
          'li',
          null,
          h(
            'a',
            {
              class: 'zalo-fab__item',
              href: storeInfo.zaloUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            t(key),
          ),
        ),
      ),
    ),
  );

  const button = h(
    'button',
    {
      type: 'button',
      class: 'zalo-fab',
      'aria-label': t('zaloChat'),
      'aria-expanded': 'false',
      'aria-controls': 'zalo-menu',
    },
    h('img', {
      class: 'zalo-fab__logo',
      src: asset('/images/zalo-logo.svg'),
      alt: '',
      width: '48',
      height: '48',
    }),
  );

  const wrap = h('div', { class: 'zalo-fab__wrap' }, menu, button);

  const close = () => {
    if (menu.hidden) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    menu.querySelector('a')?.focus();
  };

  button.addEventListener('click', () => (menu.hidden ? open() : close()));

  // Dismissing: Escape, or a click anywhere outside the widget.
  const onKeydown = (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      close();
      button.focus();
    }
  };
  const onPointer = (event) => {
    if (!menu.hidden && !wrap.contains(event.target)) close();
  };
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onPointer);

  // Both listeners live on document, so they have to go when the view does.
  onCleanup(() => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onPointer);
  });

  return wrap;
}
