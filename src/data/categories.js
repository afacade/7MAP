/**
 * The store's departments.
 *
 * No dedicated department photography was supplied, so each tile borrows the
 * photo of a representative product (`heroProduct`). Set `image` on a category
 * to override that with a real department shot when one arrives. The four
 * with no curated product use `image` for a POS photo instead, picked for a
 * clean white background so it sits well in the round "Danh mục" icon.
 *
 * Departments with nothing in stock are kept here but hidden from the
 * storefront until they have products — see `decorateCategories`.
 */
/**
 * The order here is the order of the sidebar. It follows what the shop actually
 * stocks — the POS export puts 54% of in-stock lines in fashion and only 7% in
 * food — rather than the food-first order the design prototype assumed.
 *
 * Each department maps to one or more three-digit `Phân loại` groups in the
 * POS; the mapping lives in `tools/build_catalogue.py` and is the only place it
 * is written down. Departments with nothing in stock are hidden automatically.
 */
export const categories = [
  { id: 'women',   nameVi: 'Thời trang nữ',        nameEn: "Women's fashion",     heroProduct: 'bo-do-mac-nha-miliket' },
  { id: 'men',     nameVi: 'Thời trang nam',       nameEn: "Men's fashion",       heroProduct: 'ao-polo-phoi-khoi' },
  { id: 'kids',    nameVi: 'Thời trang trẻ em',    nameEn: "Kids' fashion",       heroProduct: null, image: '/images/products/23585645.webp' },
  { id: 'baby',    nameVi: 'Sản phẩm cho bé',      nameEn: 'Baby products',       heroProduct: 'bo-do-be-ke-soc' },
  { id: 'shoes',   nameVi: 'Giày dép',             nameEn: 'Footwear',            heroProduct: 'dep-suc-de-day' },
  { id: 'bag',     nameVi: 'Túi xách & ví',        nameEn: 'Bags & wallets',      heroProduct: 'tui-dung-phu-kien' },
  { id: 'access',  nameVi: 'Phụ kiện thời trang',  nameEn: 'Fashion accessories', heroProduct: 'non-chong-nang-che-co' },
  { id: 'sport',   nameVi: 'Đồ thể thao & đồ bơi', nameEn: 'Sport & swim',        heroProduct: 'do-boi-giu-nhiet' },
  { id: 'home',    nameVi: 'Gia dụng & nhà bếp',   nameEn: 'Home & kitchen',      heroProduct: 'khay-dung-hat' },
  { id: 'food',    nameVi: 'Thực phẩm',            nameEn: 'Food',                heroProduct: 'gao-st25-5kg' },
  { id: 'drink',   nameVi: 'Đồ uống',              nameEn: 'Beverages',           heroProduct: 'milo-hop-110ml' },
  { id: 'care',    nameVi: 'Chăm sóc cá nhân',     nameEn: 'Personal care',       heroProduct: 'khan-giay-pulppy' },
  { id: 'clean',   nameVi: 'Vệ sinh & giặt giũ',   nameEn: 'Cleaning & laundry',  heroProduct: 'vien-tay-bon-cau' },
  { id: 'elec',    nameVi: 'Điện & phụ kiện',      nameEn: 'Electricals',         heroProduct: 'gang-tay-cach-dien' },
  { id: 'toys',    nameVi: 'Đồ chơi',              nameEn: 'Toys',                heroProduct: 'bo-do-choi-dung-cu' },
  { id: 'stat',    nameVi: 'Văn phòng phẩm',       nameEn: 'Stationery',          heroProduct: null, image: '/images/products/8935001846413.webp' },
  { id: 'worship', nameVi: 'Đồ thờ cúng',          nameEn: 'Worship & incense',   heroProduct: null, image: '/images/products/23335653.webp' },
  { id: 'gift',    nameVi: 'Quà tặng & móc khóa',  nameEn: 'Gifts & keyrings',    heroProduct: null, image: '/images/products/23376168.webp' },
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
