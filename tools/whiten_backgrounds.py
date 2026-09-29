#!/usr/bin/env python3
"""Recomposite product photos onto a pure white background.

    python tools/whiten_backgrounds.py --limit 200 --out /tmp/preview
    python tools/whiten_backgrounds.py --workers 4

The catalogue photos were shot on the shop floor, not in a lightbox, so the
"grey background" customers see is usually tile, concrete or a folded sheet —
sampling 300 masters found only about one in eight already sitting on something
close to white. A levels stretch cannot fix that: pushing a textured grey floor
toward 255 gives a *lighter textured floor* and blows the highlights out of
every white shirt and enamel bowl on the way. So the subject is segmented out
(U^2-Net, via rembg) and composited onto white instead.

Encoding matches the rest of the pipeline exactly — WebP quality 80, method 6,
LANCZOS, variants sized by **width** — so output drops in beside files written
by convert_images.py and make_variants.py. See images/README.md.

## The guard rails

Segmentation fails quietly, and a silent failure here means a mangled product
photo shipping to the storefront. Three coverage tests catch that, and a master
that trips any of them is **copied through unchanged** rather than replaced:

  * **< 3% kept** — the model found no subject. Usually a flat-lay that fills
    the frame edge to edge, or packaging the same colour as the floor.
  * **< 10% kept** — too close to call, so it is not shipped. See
    MIN_SHIP_COVERAGE below for what these look like and why.
  * **> 98.5% kept** — the model found no background. Nothing to gain, and the
    alpha edge would only soften the product's real outline.

Every decision lands in `report.tsv` next to the output, so the skipped files
can be eyeballed, or cut by hand, without re-running the pass.

On the real catalogue this ships about 97.6% of masters and leaves ~2.4%
untouched. The photos it cannot do anything with are the ones with no solid
silhouette to find: transparent packaging (blister packs, clear trays, PET
bottles), and products that fill the frame corner to corner.
"""

from __future__ import annotations

import argparse
import csv
import os
import shutil
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

# Each worker gets one thread. onnxruntime defaults to grabbing every core,
# which on a 4-core box means 4 processes fighting over 16 threads and running
# slower than a single one. Must be set before onnxruntime is imported.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("ORT_NUM_THREADS", "1")

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required:  python -m pip install Pillow")

try:
    import numpy as np
except ImportError:  # pragma: no cover
    sys.exit("numpy is required:  python -m pip install numpy")


ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "images" / "products"

# Must match make_variants.py WIDTHS and src/lib/images.js WIDTHS. The master is
# already the 800 rung, so only the two small ones are written.
SMALL_WIDTHS = (320, 480)
QUALITY = 80
WHITE = (255, 255, 255)

# Coverage outside this band means the mask is not trustworthy; see the module
# docstring. Tuned against a 300-image sample of the real catalogue.
MIN_COVERAGE = 0.03
MAX_COVERAGE = 0.985

# A cutout that kept less than this is not shipped either. Eyeballing the band
# on the real catalogue, about half of them are right — a pair of stud earrings
# really does occupy 6% of its frame — and about half have eaten the product:
# a jade ring stripped of its gold setting, a bag of noodles reduced to
# fragments, a clear plastic tray gone but for its printed lettering.
#
# Nothing in the mask separates the two cases, because a small product and a
# half-erased one look the same by area. So the whole band is passed through
# untouched: a grey background is a blemish, a destroyed product photo is a
# lie about what the shop is selling. They are listed in report.tsv as
# `skipped-sparse` for whoever wants to cut them by hand.
MIN_SHIP_COVERAGE = 0.10

_SESSION = None


def session():
    """One rembg session per worker process, created lazily.

    The session holds the ONNX graph and cannot be pickled, so it is built
    inside the worker rather than passed in.
    """
    global _SESSION
    if _SESSION is None:
        from rembg import new_session

        _SESSION = new_session("u2net")
    return _SESSION


def is_master(path: Path) -> bool:
    """True for a master, false for a generated -320/-480/-800 variant."""
    return path.suffix == ".webp" and path.stem.rsplit("-", 1)[-1] not in {
        "320",
        "480",
        "800",
    }


def masters() -> list[Path]:
    return sorted(p for p in PRODUCTS.glob("*.webp") if is_master(p))


def write_ladder(image: Image.Image, dest_dir: Path, stem: str) -> None:
    """Write the master plus its two small rungs, matching make_variants.py.

    Variants are sized by width, not long edge — a 533x800 portrait master
    gives a 320x480 rung, not 213x320. `src/lib/images.js` assumes that.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    image.save(dest_dir / f"{stem}.webp", "WEBP", quality=QUALITY, method=6)
    for width in sorted(SMALL_WIDTHS, reverse=True):
        # Every rung is written even when the master is already narrower than
        # it — make_variants.py does the same, and `srcset` names the file
        # whatever its pixel width turns out to be. Skipping it here instead
        # would leave the storefront pointing at a file that does not exist.
        # Never upscale, though: a 240px source stays 240px rather than being
        # blown up into a blurry "320px" file that is bigger and no sharper.
        small = image
        if image.width > width:
            ratio = width / image.width
            small = image.resize((width, max(1, round(image.height * ratio))), Image.LANCZOS)
        small.save(dest_dir / f"{stem}-{width}.webp", "WEBP", quality=QUALITY, method=6)


def passthrough(source: Path, dest_dir: Path) -> None:
    """Copy a master and its existing variants across untouched.

    Used when the mask fails a guard rail. Copying rather than skipping keeps
    the output directory a complete drop-in replacement for images/products.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    stem = source.stem
    shutil.copy2(source, dest_dir / source.name)
    for width in SMALL_WIDTHS:
        variant = source.with_name(f"{stem}-{width}.webp")
        if variant.exists():
            shutil.copy2(variant, dest_dir / variant.name)


def whiten(args: tuple[str, str]) -> tuple[str, str, float]:
    """Cut the subject out and composite it on white. Returns (name, verdict, coverage)."""
    source, out = Path(args[0]), Path(args[1])
    try:
        from rembg import remove

        original = Image.open(source).convert("RGB")
        # post_process_mask cleans up speckle in the alpha, which matters most
        # on the busy floor shots this catalogue is full of.
        cut = remove(original, session=session(), post_process_mask=True)

        alpha = np.asarray(cut.split()[3])
        coverage = float((alpha > 127).mean())

        if coverage < MIN_COVERAGE:
            passthrough(source, out)
            return (source.name, "skipped-empty", coverage)
        if coverage < MIN_SHIP_COVERAGE:
            passthrough(source, out)
            return (source.name, "skipped-sparse", coverage)
        if coverage > MAX_COVERAGE:
            passthrough(source, out)
            return (source.name, "skipped-nobg", coverage)

        flat = Image.new("RGB", cut.size, WHITE)
        flat.paste(cut, mask=cut.split()[3])
        write_ladder(flat, out, source.stem)
        return (source.name, "ok", coverage)
    except Exception as exc:  # a single bad file must not kill the run
        try:
            passthrough(source, out)
        except Exception:
            pass
        return (source.name, f"error:{type(exc).__name__}", 0.0)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True, help="output directory")
    parser.add_argument("--limit", type=int, help="process only the first N masters")
    parser.add_argument("--sample", type=int, help="process N masters spread evenly across the catalogue")
    parser.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    args = parser.parse_args()

    files = masters()
    if args.sample:
        step = max(1, len(files) // args.sample)
        files = files[::step][: args.sample]
    elif args.limit:
        files = files[: args.limit]

    args.out.mkdir(parents=True, exist_ok=True)
    print(f"{len(files)} masters -> {args.out}  ({args.workers} workers)", flush=True)

    jobs = [(str(p), str(args.out)) for p in files]
    tally: dict[str, int] = {}
    rows = []

    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        for i, (name, verdict, coverage) in enumerate(pool.map(whiten, jobs, chunksize=8), 1):
            key = verdict.split(":")[0]
            tally[key] = tally.get(key, 0) + 1
            rows.append((name, verdict, f"{coverage:.4f}"))
            if i % 250 == 0 or i == len(jobs):
                done = " ".join(f"{k}={v}" for k, v in sorted(tally.items()))
                print(f"  {i}/{len(jobs)}  {done}", flush=True)

    report = args.out / "report.tsv"
    with report.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, delimiter="\t")
        writer.writerow(("file", "verdict", "coverage"))
        writer.writerows(rows)

    print(f"\nreport: {report}")
    for key, count in sorted(tally.items()):
        print(f"  {key:16} {count:6}  {count / len(rows) * 100:5.1f}%")


if __name__ == "__main__":
    main()
