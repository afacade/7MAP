import { h } from '../core/dom.js';
import { routes, policyHref } from '../core/router.js';
import { storeInfo } from '../config.js';
import { DEFAULT_POLICY_SLUG } from '../data/policies.js';
import { asset } from '../core/base.js';

export function siteFooter({ t }) {
  return h(
    'footer',
    { class: 'site-footer' },
    h(
      'div',
      { class: 'site-footer__inner' },
      h(
        'div',
        null,
        h(
          'div',
          { class: 'site-footer__brand' },
          h('img', { class: 'site-footer__logo', src: asset('/images/logo-7map.png'), alt: '', width: '360', height: '77' }),
          h('span', { class: 'site-footer__name' }, storeInfo.name),
        ),
        h('p', { class: 'site-footer__about' }, t('footAbout')),
      ),
      column(t('footShop'), [
        { label: t('navHome'), url: routes.home },
        { label: t('navCats'), url: routes.categories },
        { label: t('cart'), url: routes.cart },
      ]),
      column(t('footHelp'), [
        { label: t('navContact'), url: routes.contact },
        { label: t('navPolicy'), url: policyHref(DEFAULT_POLICY_SLUG) },
      ]),
      h(
        'div',
        null,
        h('div', { class: 'site-footer__heading' }, t('footContact')),
        h(
          'address',
          { class: 'site-footer__contact' },
          '442-444 Đ. Kinh Dương Vương,',
          h('br'),
          'An Lạc, TP.HCM',
          h('br'),
          h('a', { href: `tel:${storeInfo.hotlineHref}` }, storeInfo.hotline),
          h('br'),
          t('hoursVal'),
        ),
      ),
    ),
    h(
      'div',
      { class: 'site-footer__strip' },
      h(
        'div',
        { class: 'site-footer__strip-inner' },
        h('span', null, `© ${storeInfo.copyrightYear} ${storeInfo.name}. ${t('rights')}`),
        h('span', null, t('footPay')),
      ),
    ),
  );
}

function column(heading, links) {
  return h(
    'div',
    null,
    h('div', { class: 'site-footer__heading' }, heading),
    h(
      'div',
      { class: 'site-footer__links' },
      ...links.map((link) => h('a', { href: link.url }, link.label)),
    ),
  );
}
