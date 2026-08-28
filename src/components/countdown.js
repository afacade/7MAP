import { h } from '../core/dom.js';
import { config } from '../config.js';
import { countdownParts } from '../lib/format.js';

/**
 * Flash-sale countdown.
 *
 * Ticks once a second and loops back to `flashSaleDuration` at zero. It patches
 * its own three chips rather than living in the store — a second-by-second
 * global re-render would throw away form state and focus across the whole page.
 *
 * `ctx.onCleanup` clears the interval when the view is replaced.
 */
export function flashCountdown({ t, onCleanup }) {
  let left = config.flashSaleInitial;

  const hours = chip('flash__chip', t('hoursUnit'));
  const minutes = chip('flash__chip', t('minutesUnit'));
  const seconds = chip('flash__chip flash__chip--seconds', t('secondsUnit'));

  const paint = () => {
    const parts = countdownParts(left);
    hours.value.textContent = parts.h;
    minutes.value.textContent = parts.m;
    seconds.value.textContent = parts.s;
  };
  paint();

  const timer = window.setInterval(() => {
    left = left > 0 ? left - 1 : config.flashSaleDuration;
    paint();
  }, 1000);

  onCleanup(() => window.clearInterval(timer));

  return h(
    'div',
    { class: 'flash__timer' },
    h('span', { class: 'flash__ends' }, t('endsIn')),
    h('div', { class: 'flash__chips' }, hours.node, minutes.node, seconds.node),
  );
}

/** One chip: the digits plus a static, visually hidden unit for screen readers. */
function chip(className, unitLabel) {
  const value = h('span', { class: 'tnum' }, '00');
  const node = h('span', { class: className }, value, h('span', { class: 'u-visually-hidden' }, ` ${unitLabel}`));
  return { node, value };
}
