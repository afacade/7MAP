#!/usr/bin/env python3
"""Turn the shop's POS export into `data/catalogue.json`.

The storefront ships 55 hand-written products in `src/data/products.js`. Those
stay — they carry the shop's own photography and curated homepage shelves. This
script produces the *rest* of the catalogue: everything the POS says is in
stock, as a static JSON file the site fetches lazily.

    python tools/build_catalogue.py "C:/Users/capta/Downloads/danh muc 1.xlsx"

Two inputs:

  1. The POS export (.xlsx). Columns used — `Mã Vạch chính` (the product id),
     `Tên Hàng`, `ĐVT chính`, `Phân loại`, `Giá bán`, `SL tồn`.
  2. Optionally a NAS file index (TSV: name, size, path) produced by listing
     the `HINH GOC ST` share. Only used to record *which* products have a photo
     available; the images themselves are converted separately by
     `tools/convert_images.py`.

Only rows with a barcode and `SL tồn >= 1` are kept. Everything else — sold out,
zero, or blank — is left out; see the "Deferred" note in the import plan about
what blank actually means.

Requires openpyxl. Standard library otherwise, no build step.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

try:
    import openpyxl
except ImportError:  # pragma: no cover - a setup problem, not a runtime one
    sys.exit("openpyxl is required:  python -m pip install openpyxl")


ROOT = Path(__file__).resolve().parent.parent

# Column positions in the POS export, 0-based. The sheet has no stable header
# names across exports, so these are pinned by position and asserted below.
COL = {
    "ma_hang": 0,
    "ten_hang": 1,
    "barcode": 2,
    "dvt": 3,
    "phan_loai": 7,
    "gia_ban": 8,
    "sl_ton": 10,
}
EXPECTED_HEADERS = {
    0: "Mã Hàng",
    2: "Mã Vạch chính",
    7: "Phân loại",
    10: "SL tồn",
}

# The POS `Phân loại` field is a 9-digit hierarchical code whose first three
# digits name a department. This is the whole taxonomy — 34 groups covering
# every in-stock product, mapped onto the 18 storefront departments in
# `src/data/categories.js`.
DEPARTMENTS = {
    "500": "men",
    "501": "women", "502": "women", "510": "women",
    "503": "kids", "504": "kids",
    "505": "baby",
    "506": "sport",
    "507": "bag",
    "508": "access", "511": "access",
    "509": "shoes",
    "512": "gift",
    "513": "toys", "016": "toys",
    "514": "stat",
    "515": "care", "516": "care", "518": "care", "524": "care", "526": "care",
    "517": "home", "519": "home", "520": "home", "525": "home", "530": "home",
    "531": "home",
    "521": "clean", "523": "clean",
    "522": "worship",
    "528": "elec", "529": "elec",
    "535": "food",
}

# The POS files food and drink together under 535. Nothing in the data
# separates them, so they are split on the product name. This is a heuristic,
# not a rule — see decision 3 in the taxonomy plan.
DRINK_TERMS = (
    "nước ngọt", "bia ", "nước suối", "sting", "pepsi", "coca", "trà ",
    "cà phê", "nước tăng lực", "c2 ", "dr.thanh", "siro", "carabao",
    "nước yến", "sữa ",
)

# Names carry POS bookkeeping the shopper should never see: a received-date
# stamp like "(M-07/08/23)" or "15/15-220521" at the front, and the supplier
# code after the final hyphen.
DATE_PREFIX = re.compile(r"^\(?\s*[MH][-\s][^)]*\)\s*")
COUNT_PREFIX = re.compile(r"^\d+/\d+[-\d\s]*")
IMAGE_STEM = re.compile(r"^(\d+)(?:[_-](\d+))?$")


def clean_name(raw: object) -> str:
    """Strip the POS date stamp off a product name, keeping the rest intact."""
    name = str(raw or "").strip()
    for _ in range(2):  # a few names carry both a date stamp and a count
        name = DATE_PREFIX.sub("", name)
        name = COUNT_PREFIX.sub("", name)
    return name.strip() or str(raw or "").strip()


def to_number(raw: object) -> float | None:
    if raw is None or str(raw).strip() == "":
        return None
    try:
        return float(str(raw).replace(",", "").strip())
    except ValueError:
        return None


def department(phan_loai: object, name: str) -> str | None:
    code = str(phan_loai or "").strip()
    if not code:
        return None
    dept = DEPARTMENTS.get(code[:3])
    if dept is None and code[:2] == "54":
        dept = "elec"  # phone and small electronics, a handful of products
    if dept == "food":
        low = name.lower()
        if any(term in low for term in DRINK_TERMS):
            return "drink"
    return dept


def read_image_index(path: Path) -> dict[str, int]:
    """barcode -> number of photos on the share.

    Files are named `<barcode>_<n>.JPG`. The extension lies about the format
    (most are PNG) but the stem is reliable, and that is all this needs.
    """
    counts: Counter[str] = Counter()
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if not parts or not parts[0]:
                continue
            stem, ext = os.path.splitext(parts[0])
            if ext.upper() not in (".JPG", ".JPEG", ".PNG", ".BMP"):
                continue
            match = IMAGE_STEM.match(stem)
            if match:
                counts[match.group(1)] += 1
    return dict(counts)


def converted_images(folder: Path) -> set[str]:
    """Barcodes that already have a web-sized image checked into the repo."""
    if not folder.is_dir():
        return set()
    return {path.stem for path in folder.glob("*.webp")}


def build(xlsx: Path, index: Path | None, sheet: str, images: Path) -> tuple[list[dict], dict]:
    book = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    rows = book[sheet].iter_rows(values_only=True)

    header = next(rows)
    for position, expected in EXPECTED_HEADERS.items():
        found = str(header[position] or "").strip()
        if found != expected:
            sys.exit(
                f"Unexpected column layout: column {position} is {found!r}, "
                f"expected {expected!r}. The POS export format has changed — "
                f"check COL/EXPECTED_HEADERS before trusting this run."
            )

    photos = read_image_index(index) if index else {}
    converted = converted_images(images)
    products: list[dict] = []
    stats = Counter()

    for row in rows:
        if row is None or all(cell is None for cell in row):
            continue
        stats["rows"] += 1

        barcode = str(row[COL["barcode"]] or "").strip()
        if not barcode:
            stats["no_barcode"] += 1
            continue

        stock = to_number(row[COL["sl_ton"]])
        if stock is None or stock < 1:
            stats["not_in_stock"] += 1
            continue

        name = clean_name(row[COL["ten_hang"]])
        dept = department(row[COL["phan_loai"]], name)
        if dept is None:
            stats["unmapped_department"] += 1
            continue

        price = to_number(row[COL["gia_ban"]])
        if price is None or price <= 0:
            stats["no_price"] += 1
            continue

        record = {
            "id": barcode,
            "cat": dept,
            "nameVi": name,
            "price": int(price),
            "unitVi": str(row[COL["dvt"]] or "").strip(),
            "stock": int(stock),
            # Popularity is not in the export and will not be invented. Every
            # imported product sorts equal; `queryCatalogue` tie-breaks on id so
            # paging stays stable.
            "pop": 0,
        }
        if photos.get(barcode):
            record["photos"] = photos[barcode]
        # A photo on the share is not a photo on the site. `image` is set only
        # where `tools/convert_images.py` has actually produced a web-sized
        # file; everything else renders the labelled placeholder.
        if barcode in converted:
            record["image"] = f"/images/products/{barcode}.webp"

        products.append(record)
        stats["kept"] += 1

    # Deterministic output: the file should only change when the data does.
    products.sort(key=lambda p: p["id"])
    return products, stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("xlsx", type=Path, help="POS export (.xlsx)")
    parser.add_argument(
        "--index", type=Path, default=None,
        help="NAS file index (TSV: name, size, path) to record photo counts",
    )
    parser.add_argument("--sheet", default="Sheet1")
    parser.add_argument("--out", type=Path, default=ROOT / "data" / "catalogue.json")
    parser.add_argument(
        "--images", type=Path, default=ROOT / "images" / "products",
        help="folder of converted .webp files; products found here get an image",
    )
    args = parser.parse_args()

    products, stats = build(args.xlsx, args.index, args.sheet, args.images)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(products, handle, ensure_ascii=False, separators=(",", ":"))
        handle.write("\n")

    by_dept = Counter(p["cat"] for p in products)
    size_kb = args.out.stat().st_size / 1024

    print(f"{args.out.relative_to(ROOT)}  —  {len(products)} products, {size_kb:,.0f} KB")
    print(
        f"  read {stats['rows']:,} rows · skipped "
        f"{stats['no_barcode']} without a barcode, "
        f"{stats['not_in_stock']:,} not in stock, "
        f"{stats['no_price']} without a price, "
        f"{stats['unmapped_department']} unmapped"
    )
    with_photos = sum(1 for p in products if p.get("photos"))
    with_images = sum(1 for p in products if p.get("image"))
    if with_photos:
        print(f"  {with_photos:,} have at least one photo on the share")
    print(f"  {with_images:,} have a converted image on the site "
          f"({len(products) - with_images:,} render a placeholder)")
    print("  " + " · ".join(f"{d} {n:,}" for d, n in by_dept.most_common()))


if __name__ == "__main__":
    main()
