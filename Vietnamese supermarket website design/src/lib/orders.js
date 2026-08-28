/**
 * Order and contact submission.
 *
 * THIS IS THE BACKEND SEAM. There is no order endpoint yet, so both calls
 * resolve locally after validating and log the payload they would have sent.
 * The storefront is otherwise complete: validation, the confirmation URL and
 * the cart clear all behave as they will in production.
 *
 * To wire it up, set ORDER_ENDPOINT / CONTACT_ENDPOINT and the fetch below
 * takes over — no page component needs to change.
 */
const ORDER_ENDPOINT = null; // e.g. '/api/orders'
const CONTACT_ENDPOINT = null; // e.g. '/api/messages'

export async function submitOrder(order) {
  const payload = {
    orderNo: order.orderNo,
    customer: { name: order.name, phone: order.phone, address: order.address, note: order.note },
    payment: order.payment,
    items: order.lines.map((line) => ({ productId: line.id, qty: line.qty, unitPrice: line.price })),
    subtotal: order.totals.subtotal,
    shipping: order.totals.shipping,
    total: order.totals.total,
    placedAt: new Date().toISOString(),
  };

  return post(ORDER_ENDPOINT, payload, 'order');
}

export async function submitContactMessage(message) {
  return post(CONTACT_ENDPOINT, { ...message, sentAt: new Date().toISOString() }, 'contact message');
}

async function post(endpoint, payload, label) {
  if (!endpoint) {
    console.info(`[7map] no endpoint configured — ${label} not sent:`, payload);
    return { ok: true, stubbed: true };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`${label} failed: ${response.status}`);
  return response.json();
}
