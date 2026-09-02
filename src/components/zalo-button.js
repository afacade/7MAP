import { h } from '../core/dom.js';
import { storeInfo } from '../config.js';
import { asset } from '../core/base.js';

/**
 * Floating Zalo button, pinned to the bottom of the viewport on every page —
 * the shortcut Vietnamese shoppers expect for reaching a shop directly.
 *
 * It carries the word "Zalo" rather than Zalo's logo: reproducing someone
 * else's trademark from a screenshot would be guesswork and not ours to ship.
 * Swap in the official mark when the shop supplies it.
 *
 * Zalo blue is deliberately outside the store palette — it is a third-party
 * action, and shoppers recognise the colour.
 */
export function zaloButton({ t }) {
  return h(
    'a',
    {
      class: 'zalo-fab',
      href: storeInfo.zaloUrl,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': t('zaloChat'),
      title: t('zaloChat'),
    },
    h('img', {
      class: 'zalo-fab__logo',
      src: asset('/images/zalo-logo.svg'),
      alt: '',
      width: '48',
      height: '48',
    }),
  );
}
