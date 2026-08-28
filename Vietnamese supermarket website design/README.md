# Siêu Thị 7Map — storefront

Customer-facing storefront for **Siêu Thị 7Map** (Vựa Gạo Bảy Mập), a rice
merchant and general supermarket at 442-444 Đ. Kinh Dương Vương, An Lạc, Bình
Tân, Ho Chi Minh City. Customers browse the departments, see what the shop has
picked out, and place an order that staff confirm by phone or Zalo.

Built from [`design_handoff_7map_storefront/`](design_handoff_7map_storefront/README.md),
with the shop's own photography and product list.
Vietnamese-primary, with a complete English toggle.

## The home page

Everything the shop curated is on the front page, in the order they asked for:

1. **Banner** — their own artwork, full width, linking to the rice shelf
2. **Trust strip** — delivery, COD, Zalo ordering, warranty
3. **Danh mục nổi bật** — the departments that currently hold stock
4. **Sản phẩm bán chạy** — the top 5, each with the description written for it
5. **Gợi ý riêng cho bạn** — the 36 household, clothing and food items
6. **Gợi ý cho bạn** — the 14 travel and outdoor items
7. **Store band** — address, hours, hotline

The shelves are driven by a `shelf` field on each product record, so moving an
item between them is a one-word edit in `src/data/products.js`.

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
real paths, so deep links and refreshes must fall back to `index.html`. In
production, configure the same fallback:

- **nginx** — `try_files $uri $uri/ /index.html;`
- **Apache** — `FallbackResource /index.html`
- **Netlify / Vercel / Cloudflare Pages** — a catch-all rewrite to `/index.html`

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
public/images/        photography goes here — see its README
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

`src/config.js` holds the four tweakables the handoff called out — default
language, flash sale on/off, products per row (3 or 4), free-shipping threshold —
plus the delivery fee and the store's address, hours and hotline. No page
hard-codes a threshold or a phone number.

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

Colours, type scale, spacing, radii and copy come from the handoff and were
contrast-checked there; `tokens.css` is the single source. Three places
deliberately depart from the prototype:

1. **Money formatting follows the active language** — `175.000₫` in Vietnamese,
   `175,000₫` in English. The prototype used `vi-VN` grouping in both, which put
   dot separators next to its own English copy ("orders over 300,000₫").
2. **The utility bar's shipping note renders at full white**, not `opacity: .7`.
   The token table forbids alpha whites on orange (they fall to 2.3–4.3:1).
3. **The PDP price and both grand totals use `#C2603F`**, per the token table's
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
