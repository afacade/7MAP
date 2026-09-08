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
