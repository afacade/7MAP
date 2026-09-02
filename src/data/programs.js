import { config } from '../config.js';
import { money } from '../lib/format.js';

/**
 * Programmes the shop is currently running.
 *
 * Built from `config` rather than written out as prose, so the figures here can
 * never drift from the ones the cart actually applies — change the threshold or
 * the points rate in config.js and this page follows.
 *
 * Only genuinely running programmes belong here. To add one, append an entry
 * and its i18n keys; `policySlug` links to the document carrying the full terms.
 */
export function activePrograms(lang, t) {
  const { loyalty, freeShipThreshold } = config;

  return [
    {
      id: 'loyalty',
      title: t('progLoyaltyTitle'),
      summary: t('progLoyaltySummary', { per: money(loyalty.dongPerPoint, lang) }),
      bullets: [
        t('progLoyaltyB1', { per: money(loyalty.dongPerPoint, lang) }),
        t('progLoyaltyB2', {
          points: loyalty.pointsPerVoucher,
          value: money(loyalty.voucherValue, lang),
        }),
        t('progLoyaltyB3'),
        t('progLoyaltyB4', { months: loyalty.voucherValidMonths }),
      ],
      policySlug: 'tich-diem',
    },
    {
      id: 'freeship',
      title: t('progShipTitle'),
      summary: t('progShipSummary', { amount: money(freeShipThreshold, lang) }),
      bullets: [
        t('progShipB1', { amount: money(freeShipThreshold, lang) }),
        t('progShipB2'),
        t('progShipB3'),
      ],
      policySlug: 'giao-hang',
    },
  ];
}
