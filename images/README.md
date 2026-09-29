# Images

Hosted on AZDIGI alongside the site — **not** on a separate image CDN. The
server is in Vietnam and so are the customers, so the edge proximity a CDN sells
is already there. The trade is that AZDIGI serves files exactly as they are, with
no resizing on the fly, so every size is generated ahead of time and committed.

## The size ladder

Three widths, chosen against the sizes the design actually renders:

| Width | Serves |
|---|---|
| **320** | cards at 1×, cart thumbnails, cards on a DPR-2 phone |
| **480** | cards on a DPR-3 phone — without this rung they jump straight to 800 |
| **800** | product-page hero, cards on a DPR-2 desktop |

The homepage banner is full-bleed and has its own ladder: **640 / 960 / 1280**.

### Naming

```
photo.webp  ->  photo-320.webp, photo-480.webp   (the master is the 800 rung)
photo.jpg   ->  photo-320.webp, photo-480.webp, photo-800.webp
```

WebP masters from `convert_images.py` are already 800px, so they stand in for
`-800` rather than being duplicated — worth ~340 MB once the full catalogue is
converted.

> **Three files must agree on these widths:** `src/lib/images.js` (`WIDTHS`),
> `tools/make_variants.py` (`WIDTHS`), and `tools/convert_images.py`
> (`SMALL_EDGES`). If they drift, `srcset` points at files that do not exist.
> The image component degrades to the master in that case rather than showing a
> broken image, so the failure is quiet — check all three when changing a width.

## Regenerating

```bash
python tools/make_variants.py            # backfill anything missing
python tools/make_variants.py --force    # rebuild everything
python tools/make_variants.py --banner   # just the banner's 640/960/1280
```

Idempotent: it skips variants newer than their master, so re-running is cheap.
New product photos coming off the NAS get their variants automatically from
`tools/convert_images.py`; this script is for backfill and for editorial images.

## White backgrounds

```bash
python tools/whiten_backgrounds.py --out /tmp/whitened          # the lot
python tools/whiten_backgrounds.py --out /tmp/look --sample 200 # a spread, to eyeball
```

The catalogue was shot on the shop floor rather than in a lightbox, so most
product photos sit on tile, concrete or a folded sheet. Sampling 300 masters
found only about one in eight already on something close to white.

A levels stretch cannot fix that — pushing a textured grey floor toward 255
gives a *lighter textured floor*, and blows the highlights out of every white
shirt and enamel bowl on the way. So the script segments the product out
(U²-Net, via `rembg`) and composites it onto white instead.

Writes the full ladder per photo, so its output directory is a drop-in
replacement for `images/products/`. It never writes in place: point `--out`
somewhere scratch, look at the result, then copy it across.

Segmentation fails quietly, which on a storefront means a mangled product
photo. Three coverage rails catch it, and a master that trips any of them is
copied through **unchanged** rather than replaced:

| Kept | Verdict | Why |
|---|---|---|
| < 3% | `skipped-empty` | no subject found — usually a flat-lay filling the frame |
| < 10% | `skipped-sparse` | too close to call; see below |
| > 98.5% | `skipped-nobg` | no background found, so nothing to gain |

That middle rail is the one worth understanding. About half the band is right —
a pair of stud earrings really does occupy 6% of its frame — and about half has
eaten the product: a jade ring stripped of its gold setting, a bag of noodles
reduced to fragments, a clear plastic tray gone but for its printed lettering.
Nothing in the mask separates the two, because a small product and a
half-erased one look identical by area. So the whole band is left alone. A grey
background is a blemish; a destroyed product photo is a lie about what the shop
is selling.

Every decision lands in `report.tsv` beside the output, so the skipped files can
be found and cut by hand without re-running the pass.

Roughly 0.33s per image, so the full 8,730 takes about 90 minutes on four cores.
On the current catalogue that ships **97.6%** and leaves 213 masters untouched.
The ones it cannot help are those with no solid silhouette to find: transparent
packaging (blister packs, clear trays, PET bottles), and products that fill the
frame corner to corner.

> Needs `rembg` and `onnxruntime`, which the other scripts here do not:
> `python -m pip install rembg onnxruntime`. First run downloads a 176 MB model.

## What's here

| Folder | Contents |
|---|---|
| `banner.jpg` + `banner-{640,960,1280}.webp` | homepage banner |
| `products/` | POS catalogue photos, named by barcode |
| `best-sellers/`, `for-you/`, `travel/` | the shop's curated editorial shots |
| `logo-7map*.png`, `zalo-logo.svg` | marks — excluded from the variant pass |

`zalo-logo.svg` is a hand-built likeness, not Zalo's official artwork. Replace it
with the real asset at the same path.

## What this bought

Measured on the homepage, first visit:

| | Before | After |
|---|---|---|
| Desktop 1× | 4,258 KB | 603 KB |
| Phone 390px @2× | 1,551 KB | 563 KB |
| Per card | 72.5 KB | 8.3 KB |

A 48-card catalogue page goes from roughly 3.4 MB to 0.39 MB.

## Scaling to the full catalogue

8,725 products have photos on the NAS; 24 are converted. Converting the rest at
three rungs each is roughly **26,000 image files, ~500 MB**.

Two things to confirm on the AZDIGI plan before that run:

- **Inode (file count) limit** — the least obvious constraint on shared hosting.
  Budget ~26,000 for images, plus whatever the site itself adds.
- **Disk** — ~1 GB is comfortable.

Deploying that many files over FTP is painfully slow; use `rsync` over SSH so
only changed files transfer.
