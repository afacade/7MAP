import { config } from '../config.js';

/**
 * Loyalty points.
 *
 * Deliberately pure arithmetic over an order amount. There is no account system
 * yet, so the storefront can say what an order *earns* but not what a customer
 * has banked — a balance needs the backend (see README, "What still needs
 * doing"). Nothing here should be mistaken for a stored balance.
 */

/** Points earned on an amount, rounded down — a part-point is not a point. */
export function pointsFor(amount) {
  const { dongPerPoint } = config.loyalty;
  if (!dongPerPoint || amount <= 0) return 0;
  return Math.floor(amount / dongPerPoint);
}

/** Whole vouchers a point balance converts into, and the points left over. */
export function vouchersFrom(points) {
  const { pointsPerVoucher } = config.loyalty;
  if (!pointsPerVoucher) return { vouchers: 0, remainder: points };
  return {
    vouchers: Math.floor(points / pointsPerVoucher),
    remainder: points % pointsPerVoucher,
  };
}

/** Cash value of a point balance, in ₫. */
export function pointsValue(points) {
  return vouchersFrom(points).vouchers * config.loyalty.voucherValue;
}
