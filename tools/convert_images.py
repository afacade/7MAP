#!/usr/bin/env python3
"""Convert product photos off the NAS into web-sized WebP.

    python tools/convert_images.py --index nas_index.tsv --limit 24

Two quirks of the source material this has to work around, both verified by
sampling the share:

  1. **The extension lies.** Files are named `.JPG` or `.BMP`, but 22 of 24
     sampled files are actually PNG. Format is sniffed from the magic bytes and
     the name is ignored. (These are lossless PNGs of photographs, which is why
     the originals run 5-10 MB each and why the conversion win is so large.)

  2. **The WebDAV mount zero-pads.** Reading a file over the share returns it
     padded with NUL bytes up to the next power of two — a 10.4 MB image comes
     back as exactly 16,777,216 bytes, a third of it zeros. Decoders mostly
     tolerate the trailing garbage, but the padding is stripped before decoding
     so nothing downstream has to think about it.

Output lands in `images/products/<barcode>.webp` at 800px on the long edge for
the product page hero, plus `<barcode>-320.webp` for catalogue cards. The site
picks between them with `srcset`; see `src/lib/images.js`.
"""

from __future__ import annotations

import argparse
import io
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required:  python -m pip install Pillow")


ROOT = Path(__file__).resolve().parent.parent
IMAGE_STEM = re.compile(r"^(\d+)(?:[_-](\d+))?$")

SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": "PNG",
    b"\xff\xd8\xff": "JPEG",
    b"BM": "BMP",
}


def sniff(data: bytes) -> str | None:
    for signature, name in SIGNATURES.items():
        if data.startswith(signature):
            return name
    return None


def strip_padding(data: bytes) -> bytes:
    """Drop the NUL padding the WebDAV mount appends.

    PNG and JPEG end on a marker (the IEND chunk, FFD9), so stripping trailing
    zeros only ever removes padding. BMP has no end marker: its last bytes are
    pixels, and a black edge makes them zeros. Stripping those cut real data off
    21540103 and 21540301 and Pillow rejected both as truncated. A BMP records
    its own length in the header, so it is cut there instead.
    """
    if data[:2] == b"BM" and len(data) >= 6:
        declared = int.from_bytes(data[2:6], "little")
        if 54 <= declared <= len(data):
            return data[:declared]
    end = len(data)
    while end > 0 and data[end - 1] == 0:
        end -= 1
    return data[:end]


def primary_photos(index: Path) -> dict[str, str]:
    """barcode -> path of its lowest-numbered photo."""
    best: dict[str, tuple[int, str]] = {}
    with index.open(encoding="utf-8") as handle:
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            name, _size, path = parts[0], parts[1], parts[2]
            stem, ext = os.path.splitext(name)
            if ext.upper() not in (".JPG", ".JPEG", ".PNG", ".BMP"):
                continue
            match = IMAGE_STEM.match(stem)
            if not match:
                continue
            barcode = match.group(1)
            order = int(match.group(2) or 0)
            if barcode not in best or order < best[barcode][0]:
                best[barcode] = (order, path)
    return {barcode: path for barcode, (_, path) in best.items()}


# The card-sized variants written alongside every master. Must stay in step with
# WIDTHS in tools/make_variants.py and lib/images.js — all three describe the
# same files, and srcset breaks silently if they disagree.
SMALL_EDGES = (320, 480)


def convert(source: str, dest: Path, edge: int, quality: int) -> tuple[int, int, str]:
    """Write the 800px master and its 320px card variant. Returns the raw size,
    the combined output size, and the format actually found in the bytes."""
    with open(source, "rb") as handle:
        raw = handle.read()

    trimmed = strip_padding(raw)
    kind = sniff(trimmed)
    if kind is None:
        raise ValueError("unrecognised image format")

    with Image.open(io.BytesIO(trimmed)) as image:
        image = image.convert("RGB")
        image.thumbnail((edge, edge), Image.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        image.save(dest, "WEBP", quality=quality, method=6)

        # A 262px card downloading an 800px photo is most of the page weight on
        # a catalogue grid, so the smaller rungs are produced here rather than
        # left to a separate backfill pass. Largest first, so each resize works
        # from the previous one.
        total = dest.stat().st_size
        for edge_width in sorted(SMALL_EDGES, reverse=True):
            small = dest.with_name(f"{dest.stem}-{edge_width}.webp")
            if image.width > edge_width:
                ratio = edge_width / image.width
                image = image.resize(
                    (edge_width, max(1, round(image.height * ratio))), Image.LANCZOS
                )
            image.save(small, "WEBP", quality=quality, method=6)
            total += small.stat().st_size

    return len(raw), total, kind


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--index", type=Path, required=True, help="NAS file index (TSV)")
    parser.add_argument("--catalogue", type=Path, default=ROOT / "data" / "catalogue.json")
    parser.add_argument("--out", type=Path, default=ROOT / "images" / "products")
    parser.add_argument("--edge", type=int, default=800, help="long edge in px")
    parser.add_argument("--quality", type=int, default=80)
    parser.add_argument(
        "--limit", type=int, default=0,
        help="stop after N images (0 = all). Spread evenly across departments.",
    )
    args = parser.parse_args()

    import json

    catalogue = json.loads(args.catalogue.read_text(encoding="utf-8"))
    photos = primary_photos(args.index)

    # Pick a spread across departments rather than the first N barcodes, so a
    # small sample still shows what every shelf will look like.
    by_dept: dict[str, list[dict]] = defaultdict(list)
    for product in catalogue:
        if product["id"] in photos:
            by_dept[product["cat"]].append(product)

    chosen: list[dict] = []
    if args.limit:
        depts = sorted(by_dept, key=lambda d: -len(by_dept[d]))
        round_index = 0
        while len(chosen) < args.limit and depts:
            for dept in list(depts):
                bucket = by_dept[dept]
                if round_index >= len(bucket):
                    depts.remove(dept)
                    continue
                chosen.append(bucket[round_index])
                if len(chosen) >= args.limit:
                    break
            round_index += 1
    else:
        chosen = [p for bucket in by_dept.values() for p in bucket]

    done = failed = 0
    raw_total = out_total = 0
    kinds: dict[str, int] = defaultdict(int)

    for product in chosen:
        barcode = product["id"]
        dest = args.out / f"{barcode}.webp"
        try:
            raw_size, out_size, kind = convert(photos[barcode], dest, args.edge, args.quality)
        except Exception as error:  # noqa: BLE001 - report and keep going
            print(f"  ! {barcode}: {error}")
            failed += 1
            continue
        raw_total += raw_size
        out_total += out_size
        kinds[kind] += 1
        done += 1
        print(f"  {barcode}  {product['cat']:<8} {raw_size/1024**2:6.1f} MB -> {out_size/1024:5.0f} KB  ({kind})")

    print(f"\n{done} converted, {failed} failed")
    if done:
        print(f"  source formats: " + ", ".join(f"{k} {n}" for k, n in kinds.items()))
        print(f"  {raw_total/1024**2:,.0f} MB -> {out_total/1024:,.0f} KB "
              f"({out_total/done/1024:.0f} KB average, {(1-out_total/raw_total)*100:.1f}% smaller)")


if __name__ == "__main__":
    main()
