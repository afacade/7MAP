# Video

The homepage carries one video: the shop's own store reel, in its **own
section below the banner** (`.reel` in `src/styles/pages.css`, built by
`storeReel` in `src/pages/home.js`). Video on the left, heading and Zalo call
to action on the right; the row stacks on a phone.

Drop the file here as **`store.mp4`** and it appears automatically. Until then
the slot shows a labelled placeholder in the same warm well the images use —
nothing breaks, and no black box is rendered.

## What to supply

- **`store.mp4`** — H.264/AAC MP4, which every browser plays.
- **Vertical, 9:16** (the current file is 480×854). The frame is 9:16 and the
  video is drawn with `object-fit: cover`, so another ratio still works but
  gets cropped to fit. Phone footage shot for TikTok or Reels needs no edit.
- **Keep it short and small.** It autoplays muted and loops, so aim for under
  30 seconds and a few MB. The current reel is 16s / 1.8 MB.

Replacing the reel is a file swap — no code change, as long as it stays
roughly vertical.

## How it behaves

Muted, looping, `playsinline` and autoplaying — the only combination browsers
allow to start without a tap, and it never grabs audio. A **sound button** sits
in the bottom-right corner, because a reel cut for TikTok usually has a
voiceover worth hearing; the tap that unmutes also counts as the user gesture
that starts playback if autoplay was refused.

Two things keep it off the critical path:

- **Nothing is fetched until the reel is near the viewport.** `preload="none"`
  holds the file back; an `IntersectionObserver` with a 200px margin switches
  it to `preload="auto"` and calls `load()`. On a browser without
  `IntersectionObserver` the fetch simply starts immediately.
- **The element joins the DOM only once a frame has decoded** (`loadeddata`),
  so a missing or broken file leaves the placeholder in place rather than a
  black rectangle.

## Testing locally

Chromium builds without proprietary codecs (including the one Playwright
ships) cannot decode H.264 or AAC and will report
`DEMUXER_ERROR_NO_SUPPORTED_STREAMS`. That is the test browser, not the site —
Safari, Chrome, Edge and Firefox all play the file. To exercise the mount and
autoplay path in such a browser, serve a VP9/Opus copy at the same URL:

```bash
ffmpeg -i videos/store.mp4 -c:v libvpx-vp9 -b:v 800k -c:a libopus store.webm
```
