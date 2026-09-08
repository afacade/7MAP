/**
 * Responsive image sources.
 *
 * The site is served from AZDIGI, which hands back files exactly as they are —
 * no resizing on the fly. So the sizes are generated ahead of time by
 * `tools/make_variants.py`, and this module mirrors that script's naming rule.
 * **The two must agree**: change a width here and change it there in the same
 * commit, or `srcset` will point at files that do not exist.
 *
 *     photo.webp  ->  photo-320.webp, photo-480.webp, photo.webp as the 800 rung
 *     photo.jpg   ->  photo-320.webp, photo-480.webp, photo-800.webp
 *
 * WebP masters are already 800px, so they serve as their own large candidate
 * rather than being duplicated to `-800.webp`.
 */

// Three rungs, not two. With only 320/800 a DPR-2 phone needing 288 device px
// fits the small file, but a DPR-3 phone needing ~432 jumps all the way to 800 —
// five times the bytes for no visible gain. 480 catches that case.
export const WIDTHS = [320, 480, 800];
export const SMALL = WIDTHS[0];
export const LARGE = WIDTHS[WIDTHS.length - 1];

const OURS = /^\/images\//;
const EXT = /\.(webp|jpe?g|png)$/i;

/**
 * Candidate sources for an image path, or `null` when there is nothing to
 * derive — an empty path, or one we do not host and therefore have no variants
 * for. Callers fall back to the plain `src` in that case.
 *
 * Returns `{ src, candidates }` where `src` is the file to use as the plain
 * attribute and `candidates` is `[[path, width], …]` for the srcset.
 */
export function responsiveSources(src) {
  if (!src || !OURS.test(src) || !EXT.test(src)) return null;

  const stem = src.replace(EXT, '');
  const isWebp = /\.webp$/i.test(src);
  // A WebP master is already the largest rung, so it stands in for `-800`
  // rather than being duplicated on disk.
  const pathFor = (width) =>
    isWebp && width === LARGE ? src : `${stem}-${width}.webp`;

  return {
    src: pathFor(LARGE),
    candidates: WIDTHS.map((width) => [pathFor(width), width]),
  };
}

/**
 * `sizes` values per context, so the browser can pick before layout is known.
 * Percentages track the grid definitions in pages.css — when a breakpoint moves
 * there, the matching entry here should move with it. Being a little generous is
 * safe; being too small ships a blurry image.
 */
export const SIZES = {
  /* Product grid. These are measured, not guessed: the card's media box is
     (container - gaps) / columns - 28px of card padding, which works out at
     36vw on a 390px phone — declaring 45vw there pushed every card onto the
     800px rung and made mobile heavier than desktop. Re-measure if the grid
     breakpoints in pages.css change. */
  card:
    '(max-width: 380px) 88vw, (max-width: 460px) 37vw, (max-width: 720px) 43vw,' +
    ' (max-width: 1180px) 29vw, 270px',
  // 1:1 hero on the product page, full width on a phone
  hero: '(max-width: 960px) 92vw, 585px',
  // four thumbnails under the hero
  thumb: '(max-width: 960px) 22vw, 140px',
  // fixed 62px tile in a cart row
  thumbnail: '62px',
  // wide decorative panels
  wide: '(max-width: 960px) 96vw, 560px',
};
