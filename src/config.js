/**
 * Storefront configuration.
 *
 * These are the four "prototype tweakables" named in the design handoff, plus
 * the store record the design hard-codes. In a real deployment these would come
 * from the CMS / settings table; keeping them in one module means the pages
 * never hard-code a threshold or a phone number.
 */

export const config = {
  /** 'vi' | 'en' — used when the visitor has no stored preference. */
  defaultLang: 'vi',
  /**
   * Homepage blocks carried over from the design prototype whose copy is an
   * invented campaign ("Khuyến mãi tuần này", "Giảm đến 25%", "Mua 2 tặng 1",
   * "Đã bán 62%"). They stay off until the shop supplies real campaign data —
   * flip a flag and the block returns, wired to the live catalogue.
   */
  showHeroPanel: false,
  showPromoBanners: false,
  showFlashSale: false,
  /** Product cards per row on wide screens: 3 or 4. */
  productsPerRow: 4,
  /** Order subtotal (₫) at or above which delivery is free. */
  freeShipThreshold: 300000,
  /** Flat delivery fee (₫) below the threshold. */
  shippingFee: 30000,
  /** Flash sale duration (seconds) — the countdown loops back to this at zero. */
  flashSaleDuration: 6 * 3600,
  /** Where the countdown starts on first paint. */
  flashSaleInitial: 4 * 3600 + 42 * 60 + 18,
};

export const storeInfo = {
  name: 'Bách Hoá & Thời Trang 7MAP',
  hotline: '+84 707 796 663',
  /** Digits only, for tel: and Zalo links. */
  hotlineHref: '+84707796663',
  zaloUrl: 'https://zalo.me/84707796663',
  addressVi: '442-444 Đ. Kinh Dương Vương, An Lạc, Bình Tân, Hồ Chí Minh 71906, Việt Nam',
  addressEn: '442-444 Kinh Duong Vuong St., An Lac, Binh Tan, Ho Chi Minh City 71906, Vietnam',
  /** Two-line form used inside the orange store band and the footer. */
  addressShort: '442-444 Đ. Kinh Dương Vương, An Lạc, Hồ Chí Minh 71906',
  mapsUrl: 'https://maps.google.com/?q=442+Kinh+Duong+Vuong+An+Lac+Ho+Chi+Minh',
  policiesUpdatedAt: '01/08/2026',
  copyrightYear: 2026,
};
