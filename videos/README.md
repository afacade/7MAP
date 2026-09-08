# Video

The homepage hero is a two-column row: **store video on the left, banner artwork
on the right.**

Drop the store intro video here as **`store.mp4`** and it appears automatically.
Until then the left half shows a labelled placeholder in the same warm well the
images use — nothing breaks, and no black box is rendered.

## What to supply

- **`store.mp4`** — H.264/AAC MP4, which every browser plays.
- **Aspect ratio 1280×487 (about 2.6:1)** to match the banner beside it. Other
  ratios still work; the video is cropped with `object-fit: cover`.
- **Keep it short and small.** It autoplays muted and loops, so aim for under
  15 seconds and a few MB. `preload="none"` keeps it off the critical path, but
  a 50 MB file will still hurt anyone on mobile data.

## How it behaves

Muted, looping, `playsinline` and autoplaying — the only combination browsers
allow to start without a tap, and it never grabs audio. The element is added to
the page only once the browser reports it can actually play the file, so a
missing or broken video leaves the placeholder in place rather than a black
rectangle.
