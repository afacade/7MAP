/**
 * The store's departments.
 *
 * No dedicated department photography was supplied, so each tile borrows the
 * photo of a representative product (`heroProduct`). Set `image` on a category
 * to override that with a real department shot when one arrives.
 *
 * Departments with nothing in stock are kept here but hidden from the
 * storefront until they have products — see `decorateCategories`.
 */
export const categories = [
  { id: 'food',  nameVi: 'Thực phẩm khô & đóng gói', nameEn: 'Dry & packaged food',  heroProduct: 'gao-st25-5kg' },
  { id: 'drink', nameVi: 'Nước uống & bia',          nameEn: 'Beverages',            heroProduct: 'milo-hop-110ml' },
  { id: 'cloth', nameVi: 'Quần áo & giày dép',       nameEn: 'Clothing & footwear',  heroProduct: 'ao-polo-phoi-khoi' },
  { id: 'home',  nameVi: 'Đồ gia dụng & nhà bếp',    nameEn: 'Home & kitchen',       heroProduct: 'gio-gap-da-nang' },
  { id: 'elec',  nameVi: 'Thiết bị điện',            nameEn: 'Electric appliances',  heroProduct: 'am-dun-thuy-tinh' },
  { id: 'bag',   nameVi: 'Túi xách & du lịch',       nameEn: 'Bags & travel',        heroProduct: 'balo-laptop-chong-nuoc' },
  { id: 'toys',  nameVi: 'Đồ chơi & trẻ em',         nameEn: 'Toys & kids',          heroProduct: 'bo-do-choi-dung-cu' },
  { id: 'care',  nameVi: 'Chăm sóc cá nhân',         nameEn: 'Personal care',        heroProduct: 'khan-giay-pulppy' },
  { id: 'clean', nameVi: 'Vệ sinh & giặt giũ',       nameEn: 'Cleaning & household', heroProduct: 'omo-nuoc-giat-do-lot' },
  { id: 'baby',  nameVi: 'Sản phẩm cho bé',          nameEn: 'Baby products',        heroProduct: 'bo-do-be-ke-soc' },
  { id: 'stat',  nameVi: 'Văn phòng phẩm',           nameEn: 'Stationery',           heroProduct: null },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id) {
  return byId.get(id) || null;
}

/** Price bands used by the category sidebar. `test` runs client-side today; in
 *  production this becomes a min/max pair on the catalogue query. */
export const priceBands = [
  { id: 'all', nameVi: 'Tất cả',              nameEn: 'All prices',          test: () => true },
  { id: 'a',   nameVi: 'Dưới 100.000₫',       nameEn: 'Under 100,000₫',      test: (p) => p.price < 100000 },
  { id: 'b',   nameVi: '100.000 – 300.000₫',  nameEn: '100,000 – 300,000₫',  test: (p) => p.price >= 100000 && p.price <= 300000 },
  { id: 'c',   nameVi: 'Trên 300.000₫',       nameEn: 'Over 300,000₫',       test: (p) => p.price > 300000 },
];

export const sortOptions = ['pop', 'asc', 'desc', 'disc'];
