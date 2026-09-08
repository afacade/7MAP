import { h } from '../core/dom.js';
import { policyHref } from '../core/router.js';
import { storeInfo } from '../config.js';
import { hotlineFor } from '../lib/format.js';
import { policyList, getPolicy } from '../data/policies.js';

export function policiesPage(ctx) {
  const { t, lang, route } = ctx;

  const list = policyList(lang);
  const active = getPolicy(lang, route.params.slug);

  return h(
    'section',
    { class: 'page page--cart page-top' },
    h(
      'div',
      { class: 'page-intro' },
      h('h1', { class: 'page-title' }, t('policyTitle')),
      h('p', null, t('policySub')),
    ),
    h(
      'div',
      { class: 'policy-layout' },
      h(
        'nav',
        { class: 'policy-nav', 'aria-label': t('policyNavLabel') },
        ...list.map((policy) =>
          h(
            'a',
            {
              class: `filter-link filter-link--policy${policy.id === active.id ? ' is-active' : ''}`,
              href: policyHref(policy.slug),
              'aria-current': policy.id === active.id ? 'page' : null,
            },
            policy.title,
          ),
        ),
      ),
      article(active, ctx),
    ),
  );
}

function article(policy, { t, lang }) {
  return h(
    'article',
    { class: 'policy-article' },
    h('h2', { class: 'policy-article__title' }, policy.title),
    h('p', { class: 'policy-article__updated' }, `${t('updated')} ${policy.updatedAt}`),
    ...policy.blocks.map((block) =>
      h('div', { class: 'policy-block' }, h('h3', null, block.h), h('p', null, block.p)),
    ),
    h(
      'p',
      { class: 'policy-article__foot' },
      `${t('policyFoot')} `,
      h('a', { href: `tel:${storeInfo.hotlineHref}` }, hotlineFor(lang)),
    ),
  );
}
