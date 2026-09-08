#!/usr/bin/env python3
"""Generate the responsive size variants the storefront's `srcset` expects.

    python tools/make_variants.py            # backfill everything missing
    python tools/make_variants.py --force    # rebuild even if up to date

Why this exists: the site is hosted on AZDIGI, which serves files as they are —
there is no image CDN resizing on the fly. So the sizes are generated here, once,
and committed alongside the masters.

The naming rule, which `src/lib/images.js` mirrors exactly:

    photo.webp   ->  photo-320.webp, photo-480.webp      (master is the 800 rung)
    photo.jpg    ->  photo-320.webp, photo-480.webp, photo-800.webp

That asymmetry is deliberate. `images/products/*.webp` are already 800px WebP
masters written by convert_images.py, so re-encoding them to `-800.webp` would
duplicate ~340 MB once the full catalogue is converted. JPEG/PNG masters have no
such twin, so both sizes are produced and the original is never served.

Skips anything that already looks like a variant, plus logos and SVGs — those
are not rendered through image wells.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required:  python -m pip install Pillow")


ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"

# Must match WIDTHS in src/lib/images.js.
WIDTHS = (320, 480, 800)
SMALL, LARGE = WIDTHS[0], WIDTHS[-1]
QUALITY = 80

# Files that are not product/editorial photography and never go through a well.
# The banner is full-bleed and carries its own 640/1280 pair, written by
# --banner below; the generic 320/800 sizes would be far too small for it.
SKIP_NAMES = {"logo-7map.png", "logo-7map-white.png", "zalo-logo.svg", "banner.jpg"}

# Any .webp whose stem ends in "-<digits>" is a generated variant. The test is
# restricted to .webp on purpose: the curated masters are JPEGs named bs-01,
# fy-36, tv-14, and a format-blind rule would mistake every one of them for a
# variant and skip the whole editorial set. WebP masters are bare barcodes, so
# they never contain a dash and are never caught by this.
VARIANT = re.compile(r"-\d+$")


def is_master(path: Path) -> bool:
    if path.name in SKIP_NAMES:
        return False
    if path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
        return False
    if path.suffix.lower() == ".webp" and VARIANT.search(path.stem):
        return False
    return True


# The homepage banner is full-bleed rather than sitting in a grid slot, so it
# needs its own ladder. `src/pages/home.js` hard-codes these two widths.
BANNER_SOURCE = "banner.jpg"
# 960 exists for the DPR-2 phone case: a 358px-wide banner needs ~716 device
# px, which would otherwise round all the way up to 1280.
BANNER_SIZES = (640, 960, 1280)
BANNER_QUALITY = 82


def build_banner(images: Path, force: bool) -> int:
    """Regenerate the banner's own pair. Returns how many files were written."""
    source = images / BANNER_SOURCE
    if not source.exists():
        print(f"  ! {BANNER_SOURCE} not found, skipping banner")
        return 0

    written = 0
    with Image.open(source) as original:
        original = original.convert("RGB")
        for width in BANNER_SIZES:
            dest = images / f"banner-{width}.webp"
            if dest.exists() and not force and dest.stat().st_mtime >= source.stat().st_mtime:
                continue
            image = original.copy()
            if image.width > width:
                image = image.resize(
                    (width, max(1, round(image.height * width / image.width))), Image.LANCZOS
                )
            image.save(dest, "WEBP", quality=BANNER_QUALITY, method=6)
            print(f"  banner-{width}.webp  {image.width}x{image.height}  "
                  f"{dest.stat().st_size/1024:.0f} KB")
            written += 1
    return written


def wanted_sizes(path: Path) -> list[int]:
    """WebP masters are already the largest rung, so they only need the smaller
    ones; JPEG/PNG masters need the whole ladder."""
    widths = list(WIDTHS)
    if path.suffix.lower() == ".webp":
        widths.remove(LARGE)
    return widths


def build(path: Path, width: int, force: bool) -> tuple[bool, int]:
    dest = path.with_name(f"{path.stem}-{width}.webp")
    if dest.exists() and not force and dest.stat().st_mtime >= path.stat().st_mtime:
        return False, dest.stat().st_size

    with Image.open(path) as image:
        image = image.convert("RGB")
        # Never upscale: a 240px source stays 240px rather than being blown up
        # into a blurry "320px" file that is bigger and no sharper.
        if image.width > width:
            ratio = width / image.width
            image = image.resize((width, max(1, round(image.height * ratio))), Image.LANCZOS)
        image.save(dest, "WEBP", quality=QUALITY, method=6)
    return True, dest.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--images", type=Path, default=IMAGES)
    parser.add_argument("--force", action="store_true", help="rebuild up-to-date variants")
    parser.add_argument("--banner", action="store_true",
                        help="only rebuild the homepage banner's 640/1280 pair")
    args = parser.parse_args()

    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

    if args.banner:
        count = build_banner(args.images, args.force)
        print(f"{count} banner variants written")
        return

    masters = sorted(p for p in args.images.rglob("*") if p.is_file() and is_master(p))
    if not masters:
        sys.exit(f"no master images found under {args.images}")

    made = skipped = failed = 0
    written = 0
    for master in masters:
        for width in wanted_sizes(master):
            try:
                created, size = build(master, width, args.force)
            except Exception as error:  # noqa: BLE001 - report and keep going
                print(f"  ! {master.name} @{width}: {error}")
                failed += 1
                continue
            if created:
                made += 1
                written += size
            else:
                skipped += 1

    made += build_banner(args.images, args.force)

    print(f"{made} variants written, {skipped} already current, {failed} failed")
    if made:
        print(f"  {written/1024:,.0f} KB added ({written/made/1024:.1f} KB average)")
    print(f"  masters scanned: {len(masters)}")


if __name__ == "__main__":
    main()
