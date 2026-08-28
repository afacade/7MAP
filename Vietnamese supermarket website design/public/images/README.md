# Images

All 56 photographs the shop sent are in place — every product, every category
tile and the banner render real artwork. Sources came from
`7MAP Website Revamp/assets/img`; the timestamp prefixes on the original
filenames grouped them into the four messages, which is how they were sorted
into the folders below.

| Folder / file | Count | Used by |
|---|---|---|
| `banner.jpg` | 1 | The full-width banner at the top of the home page |
| `best-sellers/bs-01…05.jpg` | 5 | **Sản phẩm bán chạy** — the top-5 shelf |
| `for-you/fy-01…36.jpg` | 36 | **Gợi ý riêng cho bạn** |
| `travel/tv-01…14.jpg` | 14 | **Gợi ý cho bạn** |

Category tiles do not have their own photography. Each one borrows the photo of
a representative product, named by `heroProduct` in
[`src/data/categories.js`](../../src/data/categories.js). Set `image` on a
category to override that when a real department shot arrives.

## Adding or replacing a photo

Product images are referenced by the `image` field in
[`src/data/products.js`](../../src/data/products.js) — point it at any path under
`public/` and it appears immediately. No build step.

Wells crop with `object-fit: cover`, so keep the subject centred. `.webp` and
`.avif` work too; just match the extension in the data file.

## Alternate product views

Each product currently has one photograph, so the product page shows a single
image and no thumbnail strip. Push more paths onto a product's `images` array
and the strip appears on its own:

```js
images: ['/images/best-sellers/bs-01.jpg', '/images/best-sellers/bs-01-b.jpg']
```

## Still missing

Only the two prototype blocks that are switched off in `src/config.js` reference
files that do not exist — `hero.jpg`, `promo-appliances.jpg`, `promo-toys.jpg`
and `store-map.jpg`. The first three are only needed if `showHeroPanel` /
`showPromoBanners` are turned back on. `store-map.jpg` is a map screenshot for
the contact page and shows a labelled placeholder until one is supplied.
