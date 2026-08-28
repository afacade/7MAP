import { h } from '../core/dom.js';

/**
 * A labelled form control with an inline error slot.
 *
 * Returns a handle rather than a bare node so a page can read the value,
 * focus it, and set or clear an error without querying the DOM:
 *
 *   const phone = field({ t, key: 'phone', label: t('fPhone') });
 *   phone.setError(t('errPhone'));
 *
 * `data-field` lets main.js carry the typed value and caret across a re-render —
 * switching language halfway through a form must not clear what you have typed.
 */
export function field({
  t,
  key,
  label,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
  autocomplete,
  inputmode,
}) {
  const control = multiline
    ? h('textarea', { class: 'field__control', rows, placeholder, dataset: { field: key } })
    : h('input', {
        class: 'field__control',
        type,
        placeholder,
        autocomplete,
        inputmode,
        dataset: { field: key },
      });

  const errorId = `${key}-error`;
  const error = h('span', { class: 'field__error', id: errorId, hidden: true });
  const node = h('label', { class: 'field' }, label, control, error);

  return {
    key,
    node,
    control,
    value: () => control.value,
    focus: () => control.focus(),
    setError(message) {
      node.classList.toggle('is-invalid', Boolean(message));
      error.hidden = !message;
      error.textContent = message || '';
      if (message) {
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', errorId);
      } else {
        control.removeAttribute('aria-invalid');
        control.removeAttribute('aria-describedby');
      }
    },
  };
}

/** A `<select>` in the same wrapper, for the contact form's topic picker. */
export function selectField({ key, label, options }) {
  const control = h(
    'select',
    { class: 'field__control', dataset: { field: key } },
    ...options.map((option) => h('option', null, option)),
  );

  return {
    key,
    node: h('label', { class: 'field' }, label, control),
    control,
    value: () => control.value,
  };
}
