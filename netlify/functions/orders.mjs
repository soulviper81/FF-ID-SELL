import { getStore } from '@netlify/blobs';

const STORE_NAME = 'ff-id-sell-orders';
const ORDER_PASSWORD = process.env.ORDER_PASSWORD || '4545';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
function safeString(value, fallback = '') { return typeof value === 'string' ? value.slice(0, 300) : fallback; }
function makeId() { return `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`; }
async function readJsonBody(request) { try { return await request.json(); } catch { return null; } }

export default async (request) => {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
  const store = getStore(STORE_NAME);

  if (request.method === 'GET' && pathname === '/api/health') return json({ ok: true, storage: 'netlify-blobs' });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  const body = await readJsonBody(request);
  if (!body || typeof body !== 'object') return json({ error: 'Invalid request body.' }, 400);

  if (pathname === '/api/orders') {
    const customer = safeString(body.customer, 'Guest');
    const category = safeString(body.category);
    const product = safeString(body.product);
    const payment = safeString(body.payment);
    if (!category || !product || !payment) return json({ error: 'Order is missing required details.' }, 400);
    const id = makeId();
    const order = { id, customer, category, product, level: safeString(body.level, product), payment, rate: Number.isFinite(body.rate) ? body.rate : null, amount: Number.isFinite(body.amount) ? body.amount : null, coupon: safeString(body.coupon), time: Date.now(), completed: false, completedAt: null };
    await store.setJSON(`order-${id}`, order, { metadata: { createdAt: order.time } });
    return json({ order }, 201);
  }

  if (pathname === '/api/orders/list') {
    if (String(body.password ?? '') !== ORDER_PASSWORD) return json({ error: 'Incorrect password.' }, 401);
    const listed = await store.list({ prefix: 'order-', consistency: 'strong' });
    const orders = [];
    for (const item of listed.blobs) {
      try { const order = await store.get(item.key, { type: 'json', consistency: 'strong' }); if (order) orders.push(order); } catch {}
    }
    orders.sort((a, b) => Number(b.time || 0) - Number(a.time || 0));
    return json({ orders });
  }

  const completedMatch = pathname.match(/^\/api\/orders\/([^/]+)\/completed$/);
  if (completedMatch) {
    if (String(body.password ?? '') !== ORDER_PASSWORD) return json({ error: 'Incorrect password.' }, 401);
    const id = decodeURIComponent(completedMatch[1]);
    const key = `order-${id}`;
    const order = await store.get(key, { type: 'json', consistency: 'strong' });
    if (!order) return json({ error: 'Order not found.' }, 404);
    order.completed = Boolean(body.completed);
    order.completedAt = order.completed ? Date.now() : null;
    await store.setJSON(key, order);
    return json({ order });
  }

  return json({ error: 'Not found.' }, 404);
};

export const config = { path: ['/api/health', '/api/orders', '/api/orders/list', '/api/orders/*'] };
