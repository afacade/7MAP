# Handoff: Siêu Thị 7Map — supermarket storefront

## Overview
A customer-facing storefront for **Siêu Thị 7Map**, a general supermarket at 442-444 Đ. Kinh Dương Vương, An Lạc, Bình Tân, Ho Chi Minh City. Customers browse products and prices, see current deals/banners and featured products, and place an order that staff confirm by phone/Zalo. Ten departments: dry & packaged food, beverages, clothing & footwear, home & kitchen, electric appliances, toys & kids, personal care, cleaning & household, baby products, stationery.

Four pages in the nav — **Home, Product categories, Contact, Policies** — plus three supporting views (product detail, cart, checkout).

Copy is **Vietnamese-primary with a full English toggle**; every string exists in both languages.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behaviour, not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Next.js, Laravel/Blade, native, etc.) using its established components, routing and styling patterns. If no codebase exists yet, choose the most appropriate stack for a small-catalogue retail site and implement there.

Two notes on the prototype's mechanics that should **not** be carried over literally:
- All styling is inline for streaming-preview reasons. In a real codebase, move it to whatever the project uses (Tailwind, CSS modules, styled-components…).
- Product images are `<image-slot>` drag-and-drop placeholders — a prototyping affordance. Replace with real `<img>`/`next/image` elements backed by the product record.

## Fidelity
**High-fidelity.** Final colours, typography, spacing, states and copy. Recreate pixel-accurately with the codebase's own primitives. Every colour below has been contrast-checked: all text at ≤16px meets WCAG AA (4.5:1); the values matter, don't re-derive them.

## Design Tokens

### Colour — a 60/30/10 system
| Role | Value | Where |
|---|---|---|
| 60 · base | `#FFFFFF` | page, cards, forms, grids |
| 60 · off-white | `#FDFCFB` | footer top, table headers, search field |
| 60 · warm tint | `#FAF7F5`, `#F7F2EF` | image wells, thumbnails |
| 30 · orange (text-bearing) | `#B4522F` | utility bar, hero panel, flash-sale header, store band, footer strip, primary buttons, discount chips, cart badge — **5.0:1 with white** |
| 30 · orange (brand/decorative only) | `#D97757` | "7M" logo tiles, sold-progress fill. **Never** behind small white text (3.1:1) |
| 30 · orange hover | `#8F3F22` | hover on any `#B4522F` fill |
| 30 · orange text | `#A64E30` | orange text ≤16px on white/tint — 5.4:1 |
| 30 · orange display text | `#C2603F` | PDP price only (25–34px, large-text rule) |
| 30 · orange tint | `#FBEDE6` | active filter chips, category pills, quantity-button hover |
| 30 · orange tint 2 | `#FFF4EF` | selected payment method |
| 30 · orange border | `#F0DDD3`, `#F5E7DF` | flash-sale card, help panel |
| 10 · teal | `#0B7D71` | product badges, countdown chips, "in stock", free-shipping value, order-confirmed ✓, "Buy now" outline — 4.9:1 |
| Ink | `#1F1B18` | body text, headings (**text only** — no longer a surface) |
| Ink 2 | `#5C5249` | secondary text, form labels |
| Muted | `#8A7D75` | metadata, helper text |
| Muted 2 | `#A69A92` | struck-through was-prices, footer meta |
| Border | `#EDE7E3` | card and input borders |
| Border light | `#F5F1EE` | row dividers, nav top rule |
| On-orange labels | `#FFFFFF` | all small labels on orange — do **not** use alpha whites, they fall to 2.3–4.3:1 |

### Typography
- Family: **Be Vietnam Pro** (Google Fonts, weights 400/500/600/700/800). Chosen for full Vietnamese diacritic coverage — any substitute must render `ế ữ ạ ợ` correctly.
- Scale (all with `letter-spacing` as noted; headlines use `clamp()` so they survive narrow panes):
  - Page H1: `clamp(24px, 2.5vw, 33px)` / 800 / `-.03em`
  - Hero H1: `clamp(27px, 3.1vw, 44px)` / 800 / `-.03em` / `line-height:1.08` / `text-wrap:balance`
  - Section H2: `clamp(21px, 2vw, 26px)` / 800 / `-.025em`
  - PDP price: `clamp(25px, 2.5vw, 34px)` / 800 / `-.02em`
  - Card price: 17.5px / 800 · flash price 17px / 800
  - Card title: 14px / 600 / `line-height:1.35`
  - Body: 14–15.5px / 400–500 / `line-height:1.5–1.7` / `text-wrap:pretty`
  - Labels & meta: 11–13px; uppercase eyebrows 11–11.5px / 700 / `letter-spacing:.06em`
  - Prices and quantities use `font-variant-numeric: tabular-nums`
- Minimum text size anywhere: 11px (uppercase labels only).

### Spacing, radius, shadow
- Page max-width **1280px**, padding `0 24px`; cart 1180px, checkout 1080px.
- Section rhythm: `44px` top margin between homepage sections; `26–30px` above page H1s.
- Grid gaps: product grids `16px`, category grid `14px`, sidebar↔content `28px`, footer columns `36px`.
- Radius: cards/inputs **9–11px**, panels **14px**, hero/banners/large panels **16–18px**, pills **999px**.
- Only two shadows, both hover-only: `0 8px 24px rgba(31,27,24,.07)` (product card), `0 6px 20px rgba(217,119,87,.12)` (category tile).
- Borders do the structural work, not shadows: `1px solid #EDE7E3`, inputs `1.5px`.

## Screens / Views

### 1. Global chrome (every page)
**Utility bar** — `#B4522F`, white 12.5px. Left: a 6px white pulsing dot (`opacity 1 → .35`, 2s ease-in-out infinite) + "Đặt hàng qua Zalo / điện thoại: **+84 707 796 663**", then "Miễn phí giao hàng nội thành cho đơn từ 300.000₫". Right: VI/EN toggle — pill track `rgba(0,0,0,.14)`, active segment white with `#A64E30` text, inactive white text.

**Header** — sticky (`top:0`, `z-index:40`), `rgba(255,255,255,.94)` + `backdrop-filter: blur(10px)`, bottom border `#EDE7E3`, padding `16px 24px`, gap 28px:
- Logo lockup: 42px `#D97757` tile, radius 11px, white "7M" 800/17px + "Siêu Thị 7Map" 17px/800 above an 10.5px uppercase tagline in `#8A7D75`. Clicking goes home.
- Search: flex:1, max-width 560px, `1.5px #EDE7E3` border, radius 11px, `#FDFCFB` fill, focus border `#D97757`; transparent input + `#B4522F` "Tìm" button (radius 8px).
- Cart button: `1.5px` border, radius 11px; hover border+text `#A64E30`; count pill `#B4522F`, white 11.5px/700, min-width 20px.

**Nav** — four buttons, 14px/600, padding `13px 16px`, `2.5px` bottom border; active = `#A64E30` text + `#D97757` border (product detail keeps "Danh mục" active). Right-aligned note: "Giá tại quầy · cập nhật hằng tuần" 12.5px `#8A7D75`.

**Footer** — `#FDFCFB`, top border `#EDE7E3`, 4 columns `1.4fr 1fr 1fr 1fr`, padding `40px 24px`: brand + about paragraph; Shop links; Support links; contact block with address, hotline, hours. Bottom strip is a solid `#B4522F` band, white 12.5px: "© 2026 Siêu Thị 7Map. Mọi quyền được bảo lưu." / "Thanh toán: COD · Chuyển khoản · Tiền mặt tại quầy".

### 2. Home
1. **Hero row** — grid `1.62fr 1fr`, gap 16px, radius 18px.
   - Hero: grid `minmax(300px,1.05fr) minmax(0,.95fr)`, row `minmax(380px,auto)`, left panel solid `#B4522F`: white pill eyebrow ("Khuyến mãi tuần này") with `#A64E30` text, white H1, white 15.5px sub, white CTA button with `#A64E30` text (hover `#0B7D71`/white). Right column is the image well (`#F7E3D9`).
   - Two stacked promo banners, each `minmax(0,1fr) auto`: image band on top, white copy plate below (11px `#A64E30` eyebrow, 21px/800 title, 13px `#5C5249` sub). **Do not** overlay copy on the image — that was tried and failed at narrow widths.
2. **Trust strip** — 4 cells, 1px gaps over a `#EDE7E3` background, radius 14px: free delivery / COD / Zalo ordering / genuine warranty, each 14px/700 title + 12.5px `#8A7D75` sub.
3. **Category grid** — H2 + sub + "Xem tất cả" outline button; 5 columns × 14px gap; each tile 1px border, radius 14px, 4:3 image well, 14px/700 name, 12px count. Hover: `#D97757` border + orange-tinted shadow.
4. **Flash sale** (toggleable) — `#FFF9F6` panel, `#F0DDD3` border, radius 18px. Header band solid `#B4522F`: white H2 "Giờ vàng giảm giá" + white sub, right side "Kết thúc sau" + three chips — hours/minutes `#0B7D71`, seconds white with `#A64E30` text — counting down 1s at a time, looping to 6h at zero. Four cards on 1px `#F5E7DF` gaps: 1:1 image, `#B4522F` "−N%" chip top-left, title, `#A64E30` price + struck was-price, 5px progress bar (`#F5E7DF` track, `#D97757` fill), "Đã bán N%", and a `#FBEDE6`/`#A64E30` add button that inverts to `#B4522F`/white on hover.
5. **Best sellers** — same header pattern; 4-up (3-up option) product cards: 1:1 image well, optional `#0B7D71` badge (Bán chạy / Mới / Giá tốt), 11.5px uppercase category, 14px/600 title (min-height 38px so rows align), price row (**must** `flex-wrap` with `min-width:0` — unwrapped it overflows the card), unit line, outline add-to-cart button that fills `#B4522F` on hover.
6. **Store band** — solid `#B4522F`, radius 18px, grid `1.1fr 1fr 1fr`, padding `36px 40px`: white eyebrow, 25px/800 title, white body, white CTA with `#A64E30` text; then two columns of white uppercase labels + values (address, hours, hotline, how to order).

### 3. Product categories
Breadcrumb, then grid `236px 1fr`, gap 28px.
- **Sidebar** (sticky, `top:150px`): category panel (10 buttons + "Tất cả sản phẩm"; active = `#FBEDE6` fill + `#A64E30` text, hover `#FBEDE6`); price-band panel (All / <100,000₫ / 100,000–300,000₫ / >300,000₫); bulk-order help card (`#FFF9F6` fill, `#F0DDD3` border, hotline in `#A64E30` 14px/700).
- **Content**: H1 = active category name, result count, and a sort `<select>` (best selling / price ↑ / price ↓ / biggest discount) with `1.5px` border, radius 9px. Then the same product-card grid as the homepage. Filters compose: category ∧ price band ∧ search query, then sort.

### 4. Product detail
Breadcrumb (home / category / product). Grid `1fr 1fr`, gap 44px.
- Left: 1:1 main image (1px border, radius 16px) + 4 thumbnails, radius 11px; the first is selected with a `1.5px #D97757` border.
- Right: `#FBEDE6` category chip with `#A64E30` text + SKU; H1; large `#C2603F` price + struck was-price; "unit · **Còn hàng tại quầy**" with the in-stock phrase in `#0B7D71` 700; 14.5px description (max 52ch); then a stepper (`1.5px` border, radius 10px, 42×46px −/+ buttons, hover `#FBEDE6`) + `#B4522F` "Thêm vào giỏ" (flex:1) + `#0B7D71` outline "Mua ngay" that fills teal on hover; then a spec table (4 rows, `150px 1fr`, 13.5px, `#F5F1EE` dividers).
- Below: "Sản phẩm liên quan" — 4 same-category-first cards.

### 5. Cart
H1, then grid `1fr 350px`, gap 28px.
- **Rows are stacked, not tabular** — a 5-column table does not fit and was removed. Each row: `62px minmax(0,1fr)`, gap 14px, `#F5F1EE` divider. Left: 62px `#F7F2EF` thumbnail tile. Right, line 1: title 14px/600 + unit 12px, and an "×" remove button (17px `#A69A92`, hover `#A64E30`) pushed right. Line 2: 112px stepper + "× unit price" 12.5px `#8A7D75`, and the line total 15px/800 right-aligned. The line-2 row wraps.
- **Summary** (sticky `top:150px`): subtotal; delivery (free = `#0B7D71`, else 30,000₫); a `#FFF9F6` note that counts the remaining amount to free shipping or confirms it; rule; grand total 23px/800 `#C2603F`; `#B4522F` checkout button; outline "keep shopping".
- Empty state: dashed `#EDE7E3` panel, 64px padding, centred message + orange CTA.

### 6. Checkout
Grid `1fr 340px`, gap 28px.
- **Form card**: uppercase section label, name + phone (2-up), address, note textarea. Inputs `1.5px #EDE7E3`, radius 10px, padding 12px, focus `#D97757`.
- **Payment**: three selectable rows (COD / bank transfer / pay in store) — `1.5px` border, radius 11px; selected = `#D97757` border + `#FFF4EF` fill; radio dot 18px with `inset 0 0 0 3px #fff` when picked.
- **Summary**: line per cart item, subtotal, delivery, total, `#B4522F` "Xác nhận đặt hàng", and the fine print "Nhân viên sẽ gọi lại xác nhận trong 30 phút giờ mở cửa."
- **Confirmed state** replaces the whole view: `#FFF9F6` panel, 56px `#0B7D71` circle with white ✓, title, reassurance copy, order number `7M-<5 digits>`, orange "Về trang chủ".

### 7. Contact
H1 + intro (max 56ch), then grid `1fr 1fr`, gap 28px.
- Left: two cards (hotline 18px/800 `#A64E30` + "Zalo cùng số"; hours 15px/700 + "Kể cả Chủ nhật và ngày lễ"), a full-width address card with a Google Maps link, and a 260px map image well.
- Right: message form — name + phone (2-up), topic `<select>` (order/stock · bulk quote · returns & warranty · complaint), 5-row message textarea, `#B4522F` send button, privacy fine print.

### 8. Policies
H1 + intro, then grid `250px 1fr`, gap 36px. Sticky sidebar of five policy buttons (active `#FBEDE6`/`#A64E30`). Article card: 1px border, radius 16px, padding `34px 38px`; H2, "Cập nhật 01/08/2026", then `{heading, paragraph}` blocks (15.5px/700 heading, 14.5px/1.7 body, max 70ch), and a top-ruled footer line with the hotline in `#A64E30`.
Policies: **Đổi trả & hoàn tiền** (7 days, 30 for appliance faults, conditions, exclusions, refund methods) · **Giao hàng & vận chuyển** (HCMC only, 15:00 cutoff, free over 300,000₫ within 7km else 25–45k, Zalo ordering, inspect before paying) · **Bảo hành thiết bị điện** (12 months, covered/not covered, claim process) · **Bảo mật thông tin** (what's collected, use, 24-month retention, user rights) · **Tiếp nhận khiếu nại** (channels, 24h first response, 7-day resolution, written log).

## Interactions & Behavior
- **Routing**: home · cats · pdp · cart · checkout · contact · policy. Every navigation scrolls to top. Recreate as real routes/URLs — the prototype uses one state variable because it's a single file.
- **Language**: VI default, EN toggle swaps every string, including policy bodies. Real build should use the project's i18n layer with `vi` / `en` message catalogues.
- **Cart**: `{ [productId]: qty }`. Adding from a card adds 1; from the PDP adds the stepper amount; "Mua ngay" adds then jumps to checkout. Decrementing to 0 removes the line. Header badge shows the total quantity. **Persist it** (localStorage or server) — the prototype does not.
- **Free shipping**: subtotal ≥ threshold (default 300,000₫) → 0₫ and `#0B7D71`; else 30,000₫, and the note shows the shortfall formatted as currency.
- **Flash countdown**: 1s interval, `hh:mm:ss` zero-padded, resets to 6h at zero. Clear the interval on unmount.
- **Filtering/sorting** happens client-side over the catalogue; in production move to the API/query layer.
- **Search** submits to the category page (query ∧ filters); results count reflects the query.
- **Checkout submit** is optimistic-only in the prototype: sets a confirmed flag and a random 5-digit order number. Wire to the real order endpoint, with validation on name/phone/address and a phone format check for VN numbers.
- **Hover** is the only motion besides the countdown and the pulsing dot: border/background/colour swaps on cards, buttons and tiles. No page transitions, no scroll animation.
- **Focus**: inputs and selects take `border-color:#D97757`. Add visible focus rings for keyboard users when implementing — the prototype relies on default rings.
- **Responsive**: authored for desktop (≥1180px). Headlines already fluid via `clamp()`. Breakpoints still to design: hero → single column, product grids → 2-up then 1-up, category sidebar → a filter drawer, cart summary → below the list, footer → 2 columns. A phone-homepage exploration exists in `7Map Explorations.dc.html` (option 2c) as a starting point.

## State Management
| State | Type | Notes |
|---|---|---|
| `lang` | `'vi' \| 'en'` | defaults to `vi`; persist per user |
| `page` | route | replace with real routing |
| `cat` | category id \| `'all'` | category filter |
| `band` | price band id | `all \| <100k \| 100–300k \| >300k` |
| `sort` | `pop \| asc \| desc \| disc` | default `pop` |
| `query` | string | search box |
| `pid`, `qty` | product id, int ≥1 | product detail |
| `cart` | `{ id: qty }` | persist |
| `pay` | `cod \| bank \| store` | default `cod` |
| `policy` | policy id | default `return` |
| `left` | seconds | countdown, 1s interval |
| `placed`, `orderNo` | bool, string | confirmation view |

**Data needed from the backend:** product (id, category, name_vi, name_en, price, was_price, unit_vi, unit_en, popularity, badge, flash_percent, images[], sku, specs[]) · category (id, name_vi, name_en, image, product_count) · store info (address, hours, hotline) · policy documents (localised, with updated_at).

Prototype tweakables that map to real config: default language, flash-sale on/off, products per row (3 or 4), free-shipping threshold.

## Assets
- **Font**: Be Vietnam Pro from Google Fonts.
- **Images**: none supplied. Every image position is a labelled placeholder — hero, two promo banners, 10 category tiles, every product (list + 4 PDP views), contact map. Real photography or supplier imagery is needed; the client has not provided files yet. Product names and prices in the prototype are **plausible Vietnamese retail placeholders**, not the client's real price list.
- **Icons**: none — the design deliberately uses type and colour instead of icons. If the codebase has an icon set, additions should stay sparse.
- No third-party UI library is assumed.

## Files
| File | What it is |
|---|---|
`7Map Store.dc.html` | The full storefront: all four nav pages plus product detail, cart and checkout, both languages. **The primary reference.** |
`7Map Explorations.dc.html` | Design explorations, newest first: secondary-colour candidates (teal/cobalt/green/pink), four alternate directions (quiet retail, editorial market, phone homepage, wholesale price list), and bolder homepage/card/category variants plus About and Search-results screens. Useful for pages not yet in the main file. |
`image-slot.js`, `support.js` | Prototype runtime only — **do not port**. |

Open either HTML file directly in a browser; no build step.
