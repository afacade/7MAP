#!/usr/bin/env python3
"""Development server for the 7Map storefront.

Plain `python -m http.server` cannot serve this app: the router uses real paths
(/danh-muc, /san-pham/p1), so a deep link or a refresh must fall back to
index.html instead of 404ing. This adds that fallback, sets the right MIME types
for ES modules, and disables caching so edits show up on reload.

    python server.py            # http://localhost:8000
    python server.py 3000       # a different port

Standard library only — no dependencies, no build step.
"""

from __future__ import annotations

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent.resolve()

# Directories whose contents are served as files. Anything else falls back to
# index.html so client-side routes resolve — the same behaviour GitHub Pages
# gets from 404.html.
STATIC_PREFIXES = ("/src/", "/images/", "/design_handoff_7map_storefront/")


class StorefrontHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".avif": "image/avif",
    }

    def translate_path(self, path: str) -> str:
        translated = super().translate_path(path)

        # A request for a route (not a file) gets the app shell.
        if not Path(translated).exists() and not path.startswith(STATIC_PREFIXES):
            return str(ROOT / "index.html")

        return translated

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        # Quieter than the default: one line per request, no timestamps.
        sys.stderr.write("  %s\n" % (fmt % args))


def main() -> int:
    # Windows consoles still default to cp1252, which cannot encode "Siêu Thị".
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(StorefrontHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    print(f"Siêu Thị 7Map — http://localhost:{port}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
