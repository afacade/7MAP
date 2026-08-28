/**
 * Polite live region.
 *
 * Adding to the cart only changes a small badge in the header, which a screen
 * reader user would never notice. Every add announces itself here instead.
 */
let region = null;

export function mountAnnouncer(parent) {
  region = document.createElement('div');
  region.className = 'sr-status';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  parent.appendChild(region);
}

let pending = null;

export function announce(message) {
  if (!region) return;
  // Clearing first makes repeated identical messages announce again. A timeout
  // rather than requestAnimationFrame: rAF does not fire in a backgrounded tab,
  // which would swallow the announcement entirely.
  region.textContent = '';
  window.clearTimeout(pending);
  pending = window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}
