# Bách Hoá & Thời Trang 7MAP — storefront

Customer-facing storefront for **Bách Hoá & Thời Trang 7MAP** (Vựa Gạo Bảy Mập),
a rice merchant, grocery and clothing store at 442-444 Đ. Kinh Dương Vương, An
Lạc, Bình Tân, Ho Chi Minh City. Customers browse the departments, see what the shop has
picked out, and place an order that staff confirm by phone or Zalo.

Built from [`design_handoff_7map_storefront/`](design_handoff_7map_storefront/README.md),
with the shop's own photography and product list.
Vietnamese-primary, with a complete English toggle.

## The home page

Everything the shop curated is on the front page, in the order they asked for:

1. **Danh mục** — every department as a round photo over its name, Shopee-style
2. **Gợi ý cho bạn** — the 14 travel and outdoor items; stock before artwork
3. **Hero row** — store video on the left, the shop's banner on the right
4. **Trust strip** — delivery options, exchanges, Zalo, warranty, loyalty points
5. **Sản phẩm bán chạy** — the top 5, each with the description written for it
6. **Gợi ý riêng cho bạn** — the 36 household, clothing and food items
7. **Store band** — address, hours, hotline

The video slot is empty until a file lands at `videos/store.mp4`; see
[`videos/README.md`](videos/README.md). It only enters the DOM once the browser
confirms it can play, so a missing file leaves a labelled placeholder rather
than a black box.

The shelves are driven by a `shelf` field on each product record, so moving an
item between them is a one-word edit in `src/data/products.js`.

### Shelf layouts

Each shelf picks a `mode` in [`pages/home.js`](src/pages/home.js):

| Shelf | Mode | Why |
|---|---|---|
| Gợi ý cho bạn (14) | `carousel` | pages sideways, two rows at a time |
| Sản phẩm bán chạy (5) | `carousel` | one page at desktop, so no controls show |
| Gợi ý riêng cho bạn (36) | `grid` | the browse-everything shelf — all 36 laid out, the page scrolls |

A carousel shelf shows **at most two rows**; the rest becomes pages, driven by
the arrows and dots in the section header. [`components/carousel.js`](src/components/carousel.js)
is built on native scroll-snap rather than transforms, which buys a real swipe
gesture on touch, keyboard scrolling, and off-screen slides that are *scrolled
to* rather than `display:none` — so nothing leaves the accessibility tree.

Page size is `2 × columns`, and columns come from the stylesheet
(`--products-per-row`, `--best-per-row`), so the slides re-chunk when a
breakpoint changes: 36 products are 5 pages of 8 on a desktop and 9 pages of 4
on a phone. The current page is tracked explicitly rather than derived from
`scrollLeft`, so the arrows respond immediately instead of waiting on a scroll
event that a smooth scroll has not produced yet.

The **"Danh mục" strip** tops both the home page and the products page:
every department as a round photo over its name, two rows a page, paged
sideways by the same carousel as the shelves (`--cats-per-row` sets the
columns). It replaces the older "Danh mục nổi bật" tile grid, which the shop
had asked to remove, with the Shopee-style row they asked for instead. Four
departments have no curated product, so their icons borrow a POS photo — set
`image` in [`src/data/categories.js`](src/data/categories.js) to change any of
them.

## Running it

```bash
python server.py
```

Then open <http://localhost:8000>. Pass a port to use a different one
(`python server.py 3000`).

There is **no build step and no dependencies** — the app is ES modules loaded
directly by the browser, and `server.py` is Python standard library only. That
choice was made because there is no Node toolchain on this machine; the code is
structured so a port to React/Next is mechanical (see *Architecture* below).

`server.py` exists rather than `python -m http.server` because the router uses
real paths, so deep links and refreshes must fall back to `index.html`.

## Deploying

**Production is AZDIGI.** GitHub Pages (<https://afacade.github.io/7MAP/>) is a
preview only — it serves the same repo from a `/7MAP/` subpath, which is why the
base-path machinery below exists. Production runs at a domain root, where that
code path is inert.

Deploy by syncing the repo contents to the web root. Use `rsync` over SSH rather
than FTP — at ~26,000 image files once the catalogue is converted, only
transferring what changed is the difference between seconds and hours:

```bash
rsync -az --delete   --exclude '.git' --exclude 'tools' --exclude 'design_handoff_7map_storefront'   ./ user@host:/path/to/public_html/
```

`tools/` and the handoff bundle are build-time only and do not belong on the
server. Nothing needs compiling — the site is ES modules served as-is.

Two things make that work, and both matter if you move the site:

**1. The base path.** GitHub Pages serves this repo from a *subpath*, not the
domain root, so `/src/main.js` would resolve to `afacade.github.io/src/main.js`
and 404 — which is exactly what a blank page looks like. `index.html` sets a
`<base>` tag before the first stylesheet is parsed:

```js
var SUBPATH = '/7MAP/';
if (location.pathname.indexOf(SUBPATH) === 0) { /* use it as the base */ }
```

The test is the URL, not the hostname, so local development, GitHub Pages and a
future custom domain (which serves at the root) all work untouched. On the JS
side, [`src/core/base.js`](src/core/base.js) reads that value back; `asset()`
prefixes image URLs and `routes` prefixes every link. **Nothing should ever emit
a bare root-absolute URL** — run it through `asset()`.

If the repo is renamed, change `SUBPATH` in `index.html` **and** `404.html`.

**2. Deep links.** GitHub Pages has no rewrite rules, so it serves `404.html`
for any path without a file — which is every client-side route. `404.html` is a
copy of `index.html`, so the shell loads and the router renders the right view
with the URL intact. **Re-copy it whenever `index.html` changes:**

```bash
cp index.html 404.html
```

`.nojekyll` keeps Pages from running the files through Jekyll.

The one wart: Pages returns HTTP 404 for those routes even though the page
renders correctly. Harmless for visitors, not ideal for search engines — see the
prerendering note under *What still needs doing*.

### Anywhere else

- **nginx** — `try_files $uri $uri/ /index.html;`
- **Apache** — `FallbackResource /index.html`
- **Netlify / Vercel / Cloudflare Pages** — a catch-all rewrite to `/index.html`

Served from a domain root, `SUBPATH` never matches and the base stays `/`.

## Architecture

```
index.html            app shell: fonts, stylesheets, #app
server.py             dev server with SPA fallback
src/
  config.js           store settings + the store's own record (address, hotline)
  main.js             boot, render loop, routing glue, document titles
  core/
    dom.js            h() hyperscript — every component returns a DOM node
    router.js         History-API router; filters live in the query string
    store.js          lang + cart, persisted to localStorage
    announce.js       polite live region for cart changes
  data/               catalogue, categories, policy documents  ← the backend seam
  i18n/               vi.js / en.js message catalogues + translator()
  lib/
    catalog.js        filter / sort / decorate; cart lines and totals
    format.js         money, countdown, VN phone validation, order numbers
    orders.js         order + contact submission  ← the other backend seam
  components/         header, footer, product card, image well, field, countdown
  pages/              home, categories, product, cart, checkout, contact, policies
  styles/
    tokens.css        every colour, radius and measure from the handoff
    base.css          reset, type, focus rings
    components.css    chrome, buttons, cards, form controls
    pages.css         per-view layout + the responsive plan
images/               all 56 photographs — see its README
404.html              generated copy of index.html for GitHub Pages deep links
```

A page is a function of `(ctx) → DOM node`, where `ctx` is
`{ t, lang, state, route, onCleanup }`. State changes re-render the whole app;
`onCleanup` tears down anything that outlives the DOM (the countdown interval,
the drawer's Escape handler). Nothing in `pages/` knows where data comes from —
it only sees the shapes `lib/catalog.js` returns, which is what makes the swap to
a real API a change in two files.

### Routes

| URL | View |
|---|---|
| `/` | Home |
| `/danh-muc?cat=&band=&sort=&q=` | Category listing |
| `/san-pham/:id` | Product detail |
| `/gio-hang` | Cart |
| `/thanh-toan` | Checkout |
| `/thanh-toan?order=7M-#####` | Order confirmation |
| `/lien-he` | Contact |
| `/chinh-sach/:slug` | Policy document |

Filters live in the query string rather than in state, so a filtered listing is
linkable and survives a reload. The confirmation is a URL too, so returning to a
bare `/thanh-toan` shows a fresh form rather than a stale receipt.

### State

`lang` and `cart` (`{ [productId]: qty }`) live in `core/store.js` and persist to
`localStorage` under `7map.store.v1`; a corrupt or hand-edited entry is discarded
rather than allowed to poison the totals. Everything else is either in the URL
(route, filters, sort, active policy) or local to a component (the PDP stepper,
the selected payment method, the gallery thumbnail).

### Configuration

`src/config.js` holds the tweakables the handoff called out — default language,
flash sale on/off, products per row (3 or 4) — plus the store's address, hours
and hotline. No page hard-codes a phone number.

There is deliberately **no delivery fee or free-delivery threshold**. The shop
quotes delivery per order, by option (Hoả tốc, Nhanh, Tiết kiệm) and distance,
so the cart and checkout show the goods total and say that staff confirm the
delivery fee with the order.

## What still needs doing

1. **Real prices — the one blocking item.** The 55 products carry *estimated*
   Vietnamese retail prices, because no price list was supplied. Every `price` in
   [`src/data/products.js`](src/data/products.js) needs checking before this goes
   live. Names, pack sizes and units were read off the packaging in the photos
   and should be accurate, but are worth a second pair of eyes too.
2. **Three prototype blocks are switched off** in [`src/config.js`](src/config.js):
   the hero panel, the two promo banners and the flash sale. Their copy is an
   invented campaign — "Khuyến mãi tuần này", "Giảm đến 25%", "Mua 2 tặng 1",
   "Đã bán 62%" — and advertising offers the shop has not agreed to would be
   worse than leaving them out. Each is one flag away from returning once there
   is a real campaign to run; the code is intact and wired to the live catalogue.
3. **Văn phòng phẩm (Stationery) has no stock.** It stays in the department list
   but is hidden from the storefront until a product is filed under it. Same rule
   applies to any department.
4. **Alternate product photos.** One shot per product today, so the product page
   shows no thumbnail strip. Add paths to a product's `images` array and it
   appears — see [`public/images/README.md`](public/images/README.md).
5. **The backend.** Two seams, both marked in the source:
   - `src/data/*.js` — replace the arrays with API reads. Their shape is the
     contract the storefront expects.
   - `src/lib/orders.js` — set `ORDER_ENDPOINT` / `CONTACT_ENDPOINT` and the
     `fetch` takes over. Until then both resolve locally and log the payload
     they would have sent. Client-side validation (required fields, VN phone
     format) already runs; server-side validation still has to be written.
6. **Server-rendered metadata.** Titles and descriptions are set client-side, so
   crawlers that do not execute JavaScript see only the shell. If organic search
   matters, this is the argument for moving to Next.js or adding prerendering.

## Fidelity notes

`tokens.css` is the single source for colour, type scale, spacing and radii.

### Chrome, type and payment

- **The header is a solid three-tone stack** — ink utility bar, brand-orange bar
  with the white wordmark, darker orange nav band — replacing the handoff's white
  header, which read as washed out next to the banner.
- **Two typefaces.** Be Vietnam Pro carries body copy; **Montserrat** is the
  display face for nav tabs and section headings. Both were verified in-browser
  to render the full Vietnamese diacritic set rather than silently falling back —
  `document.fonts.load()` with a Vietnamese sample, then a per-glyph advance-width
  comparison against the fallback. **Check any replacement the same way**; a font
  that advertises a `vietnamese` subset can still miss glyphs.
- **Shelves sit on alternating full-bleed bands** with a heavy orange rule above
  each heading, so the three groups read as separate blocks.
- **Nav tabs are divided by hairline rules and the active tab inverts** to a
  white block with orange text — an underline alone did not read against the
  orange band.
- **Images are pre-sized, not resized on the fly.** AZDIGI serves files as they
  are, so `tools/make_variants.py` generates a 320/480/800 ladder (plus
  640/960/1280 for the banner) and the image component picks with `srcset`. That
  took the homepage from 4,258 KB to 603 KB on desktop and 1,551 KB to 563 KB on
  a DPR-2 phone. **The widths are declared in three files that must agree** —
  see [`images/README.md`](images/README.md).
- **The hotline is formatted per language** — `070 779 6663` in Vietnamese,
  `+84 70 779 6663` in English. Same digits; only the grouping differs.
  `hotlineFor(lang)` in [`lib/format.js`](src/lib/format.js) is the only place
  that chooses, and `storeInfo.hotlineHref` stays the dialable form.
- **Never write "siêu thị" (or "supermarket")** in customer-facing copy. The
  shop trades as *Bách Hoá & Thời Trang*, and that is the only wording allowed.
- **The floating Zalo button opens a menu** of the ten things people message
  about. Every entry opens the same Zalo account — Zalo has no supported way to
  prefill a message from a link, so the menu tells the customer what the shop
  handles rather than routing anywhere different.
- **The contact page embeds a live Google Map** instead of a screenshot: always
  current, no asset to maintain, and the shop's own listing is one tap away.
- **The marketplace-style links in the utility bar are a deliberate sketch.**
  Entries with a real destination render as links; "Tra cứu đơn" and "Tài khoản"
  are inert placeholders marked `is-soon`, and are hidden on phones. They show
  the intended shape without promising a page that would 404.
- **Loyalty programme.** 1 point per 10.000₫ of goods (not delivery, rounded
  down); 100 points = one 10.000₫ voucher, valid 3 months, usable on a *later*
  purchase — a bill cannot be split to redeem within the same one. The rules
  live in a policy document; the cart and checkout show what the current order
  earns. The numbers are all in `config.loyalty` and the arithmetic is isolated
  in [`lib/loyalty.js`](src/lib/loyalty.js). **There is no account system, so
  the site can say what an order earns but not what a customer has banked** —
  balances, issuing and redeeming vouchers all need the backend.
- **Bank transfer is the only payment method.** The shop does not take COD or
  cash at the counter, so the payment step states the method instead of offering
  a radio group of one.
- **Trending search chips** under the search field are filtered at render time
  against the live catalogue — a term that returns nothing is never shown, so the
  list cannot rot into dead links as stock changes.
- **A floating Zalo button** sits bottom-right on every page, using
  `images/zalo-logo.svg`. ⚠ **That file is a hand-built likeness, not Zalo's
  official artwork** — replace it with the asset from Zalo's brand page, same
  filename, and the button picks it up with no code change.
- **A "Chương trình" page** at `/chuong-trinh` lists every programme currently
  running, built by [`data/programs.js`](src/data/programs.js) from `config`
  rather than written out as prose — so the free-shipping threshold and the
  points rate shown there can never drift from the ones the cart applies. Each
  card links to the policy holding its full terms. Adding a programme means
  appending one entry and its i18n keys; only genuinely running offers belong.

**The orange is not the handoff's.** The design shipped an earthy orange
(`#B4522F` / `#D97757`); the shop asked for a bright one. The scale is now
derived from **#EE4723 — the dominant colour of their own banner artwork**
(28% of its saturated pixels). That hue only reaches 3.8:1 with white, so it
cannot carry small white text; the tokens keep the hue at 10.6° and vary
lightness to hit the ratio each role needs:

| Token | Value | Role |
|---|---|---|
| `--c-orange` | `#DC3511` | fills carrying white text — 4.6:1 |
| `--c-orange-brand` | `#EE4723` | the banner colour, **decorative only** — 3.8:1 |
| `--c-orange-hover` | `#A9280D` | hover on any orange fill — 7.0:1 |
| `--c-orange-text` | `#D13210` | orange text ≤16px — 5.0:1 |
| `--c-orange-display` | `#F05432` | large text only (≥22px bold) — 3.5:1 |

Every text/background pair on all seven pages is audited in the browser and
passes WCAG AA. Two of the handoff's own neutrals did **not** pass and were
darkened: `--c-muted` `#8A7D75`→`#6F645E` (was 3.9:1) and `--c-muted-2`
`#A69A92`→`#807268` (was 2.7:1). The logo tiles moved from the decorative brand
colour to `--c-orange`, because the white "7M" on them is 17px bold — not large
text, so it needs 4.5:1.

Three further places deliberately depart from the prototype:

0. **Image wells are white and fit the photo whole** (`object-fit: contain`),
   where the design specified a warm tint (`#FAF7F5`) filled edge to edge. The
   shop's photography is supplier packshots on white in mixed ratios — 698×595,
   1024×1024, 1280×960 — so `cover` cropped 15–25% off the sides of the
   landscape ones and cut the printed callouts off several. White wells make the
   letterboxing invisible, since the photos are on white too. Hero, promo and map
   imagery still uses `cover` via `.well--cover`. One line in `components.css`
   to revert if you prefer the tint.

1. **Money formatting follows the active language** — `175.000₫` in Vietnamese,
   `175,000₫` in English. The prototype used `vi-VN` grouping in both, which put
   dot separators next to its own English copy ("orders over 300,000₫").
2. **The PDP price and both grand totals use `#C2603F`**, per the token table's
   "orange display text" row, where the prototype markup used `#A64E30`. All
   three are large text, so the large-text contrast rule applies.

Everything else the prototype did *not* do, and the handoff asked for, is
implemented: real routes, an i18n layer, a persisted cart, real `<img>` elements
(the `<image-slot>` prototype runtime is not ported), keyboard focus rings, and
the responsive plan.

### Responsive

The design was authored for desktop; the breakpoints were left to implement.

| Width | Layout |
|---|---|
| ≥ 1181px | As designed — 4 products a row, 5 best sellers across, 5 category tiles, sidebar in the flow |
| ≤ 1180px | 3 products a row, 3 best sellers, 4 category tiles, store band to 2 columns |
| ≤ 960px | Hero stacks, promos side by side, **category sidebar becomes a drawer**, every two-column view collapses, cart summary drops below the list, footer to 2 columns |
| ≤ 720px | 2 products a row, search onto its own row, nav scrolls horizontally |
| ≤ 460px | Trust strip, form rows and footer stack |
| ≤ 380px | 1 product a row |

### Accessibility

Skip link; visible focus rings; `aria-current` on the active nav, filter and
policy links; labelled search, steppers and remove buttons; real radio inputs for
payment; a polite live region announcing cart additions; inline field errors tied
to their inputs with `aria-describedby`; the closed filter drawer is
`visibility: hidden` so its links leave the tab order; the countdown is not a
live region, so it never announces every second.
