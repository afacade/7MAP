import { h } from '../core/dom.js';
import { storeInfo } from '../config.js';
import { imageWell } from '../components/image.js';
import { field, selectField } from '../components/field.js';
import { submitContactMessage } from '../lib/orders.js';

export function contactPage(ctx) {
  const { t } = ctx;

  return h(
    'section',
    { class: 'page page--cart page-top' },
    h(
      'div',
      { class: 'page-intro' },
      h('h1', { class: 'page-title' }, t('contactTitle')),
      h('p', null, t('contactSub')),
    ),
    h('div', { class: 'contact-layout' }, detailsColumn(ctx), messageForm(ctx)),
  );
}

function detailsColumn({ t, lang }) {
  return h(
    'div',
    { class: 'contact-col' },
    h(
      'div',
      { class: 'contact-cards' },
      h(
        'div',
        { class: 'info-card' },
        h('h2', { class: 'info-card__label' }, t('hotlineH')),
        h('a', { class: 'info-card__hotline', href: `tel:${storeInfo.hotlineHref}` }, storeInfo.hotline),
        h('p', { class: 'info-card__note' }, t('zaloNote')),
      ),
      h(
        'div',
        { class: 'info-card' },
        h('h2', { class: 'info-card__label' }, t('hoursH')),
        h('div', { class: 'info-card__hours' }, t('hoursVal')),
        h('p', { class: 'info-card__note' }, t('hoursNote')),
      ),
    ),
    h(
      'div',
      { class: 'info-card' },
      h('h2', { class: 'info-card__label' }, t('addressH')),
      h('address', { class: 'info-card__address' }, lang === 'vi' ? storeInfo.addressVi : storeInfo.addressEn),
      h(
        'a',
        { class: 'info-card__map-link', href: storeInfo.mapsUrl, target: '_blank', rel: 'noopener noreferrer' },
        `${t('openMap')} →`,
      ),
    ),
    h(
      'div',
      { class: 'contact-map' },
      imageWell({
        src: '/images/store-map.jpg',
        alt: t('mapAlt'),
        className: 'well--cover',
        label: t('imagePending'),
        hint: 'Map screenshot of the store location, 1200×600',
      }),
    ),
  );
}

function messageForm(ctx) {
  const { t } = ctx;

  const name = field({ t, key: 'contact-name', label: t('fName'), placeholder: t('fNamePh'), autocomplete: 'name' });
  const phone = field({
    t,
    key: 'contact-phone',
    label: t('fPhone'),
    placeholder: t('fPhonePh'),
    type: 'tel',
    autocomplete: 'tel',
    inputmode: 'tel',
  });
  const message = field({
    t,
    key: 'contact-message',
    label: t('fMsg'),
    placeholder: t('fMsgPh'),
    multiline: true,
    rows: 5,
  });

  const address = field({
    t,
    key: 'contact-address',
    label: t('fDeliveryAddr'),
    placeholder: t('fAddrPh'),
    autocomplete: 'street-address',
  });

  const topic = selectField({
    key: 'contact-topic',
    label: t('fTopic'),
    options: [t('topic1'), t('topic2'), t('topic3'), t('topic4')],
  });

  const success = h('p', { class: 'form-success', role: 'status', hidden: true }, t('contactSent'));

  const form = h(
    'form',
    {
      class: 'contact-form',
      novalidate: true,
      onSubmit: async (event) => {
        event.preventDefault();

        const errors = {
          [name.key]: name.value().trim() ? null : t('errName'),
          [phone.key]: phone.value().trim() ? null : t('errRequired'),
          [address.key]: address.value().trim() ? null : t('errAddr'),
          [message.key]: message.value().trim() ? null : t('errMsg'),
        };
        const fields = [name, phone, address, message];
        for (const f of fields) f.setError(errors[f.key]);

        const firstInvalid = fields.find((f) => errors[f.key]);
        if (firstInvalid) {
          firstInvalid.focus();
          success.hidden = true;
          return;
        }

        await submitContactMessage({
          name: name.value().trim(),
          phone: phone.value().trim(),
          address: address.value().trim(),
          topic: topic.value(),
          message: message.value().trim(),
        });

        form.reset();
        success.hidden = false;
      },
    },
    h(
      'div',
      null,
      h('h2', { class: 'contact-form__title' }, t('formTitle')),
      h('p', { class: 'contact-form__sub' }, t('formSub')),
    ),
    success,
    h('div', { class: 'form-row' }, name.node, phone.node),
    address.node,
    topic.node,
    message.node,
    h('button', { type: 'submit', class: 'btn btn--primary btn--block' }, t('send')),
    h('p', { class: 'form-note' }, t('formFine')),
  );

  return form;
}
