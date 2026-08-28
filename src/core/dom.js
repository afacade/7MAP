/**
 * Minimal hyperscript. Every component in this codebase is a plain function
 * that returns a DOM node built with `h`.
 *
 *   h('div', { class: 'card' }, h('h2', null, title))
 *
 * Supported props:
 *   class / className   string
 *   style               object of CSS properties (custom properties allowed)
 *   dataset             object → data-* attributes
 *   on<Event>           function → addEventListener('event', fn)
 *   html                string → innerHTML (only for trusted, local strings)
 *   anything else       setAttribute, except booleans (true sets, false skips)
 *
 * Children may be nodes, strings, numbers, arrays, or null/false/undefined
 * (skipped) — so `cond && h(...)` works inline.
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;

      if (key === 'class' || key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        for (const [prop, v] of Object.entries(value)) {
          if (v === null || v === undefined) continue;
          if (prop.startsWith('--')) el.style.setProperty(prop, String(v));
          else el.style[prop] = v;
        }
      } else if (key === 'dataset') {
        for (const [k, v] of Object.entries(value)) el.dataset[k] = v;
      } else if (key === 'html') {
        el.innerHTML = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }

  append(el, children);
  return el;
}

/** Document fragment, for components that return a list of siblings. */
export function frag(...children) {
  const f = document.createDocumentFragment();
  append(f, children);
  return f;
}

function append(parent, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false || child === true) continue;
    if (Array.isArray(child)) {
      append(parent, child);
    } else if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

/** Replace everything inside `parent` with `node`. */
export function mount(parent, node) {
  parent.replaceChildren(node);
}

/**
 * Text with one embedded element, e.g. "Cần hỗ trợ thêm? Gọi hotline **number**".
 * Splits a catalogue string on `{slot}` and drops `node` in the gap, so we never
 * need innerHTML for translated copy.
 */
export function interpolate(template, slot, node) {
  const [before, after = ''] = template.split(`{${slot}}`);
  return frag(before, node, after);
}
