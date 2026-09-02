import { h } from '../core/dom.js';
import { routes, policyHref } from '../core/router.js';
import { activePrograms } from '../data/programs.js';

/** Every programme the shop is currently running, with a link to its terms. */
export function programsPage(ctx) {
  const { t, lang } = ctx;
  const programs = activePrograms(lang, t);

  return h(
    'section',
    { class: 'page page--cart page-top' },
    h(
      'nav',
      { class: 'breadcrumb', 'aria-label': t('breadcrumbLabel') },
      h('a', { href: routes.home }, t('crumbHome')),
      ' / ',
      h('span', { class: 'breadcrumb__current' }, t('navPrograms')),
    ),
    h(
      'div',
      { class: 'page-intro' },
      h('h1', { class: 'page-title' }, t('programsTitle')),
      h('p', null, t('programsSub')),
    ),
    h(
      'div',
      { class: 'program-list' },
      ...programs.map((program) =>
        h(
          'article',
          { class: 'program-card' },
          h('span', { class: 'program-card__badge' }, t('programActive')),
          h('h2', { class: 'program-card__title' }, program.title),
          h('p', { class: 'program-card__summary' }, program.summary),
          h(
            'ul',
            { class: 'program-card__list' },
            ...program.bullets.map((line) => h('li', null, line)),
          ),
          h(
            'a',
            { class: 'program-card__link', href: policyHref(program.policySlug) },
            `${t('programTerms')} →`,
          ),
        ),
      ),
    ),
  );
}
