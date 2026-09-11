// Catalog + shared API layer for FF ID Sell Trusted.
const products = {
  ff: { title: 'FF ID', hint: 'Choose Full Payment or Half Payment, then pick your Prime level and rate.', levels: [ { name: 'Prime 7 ID Max', note: 'Prime 7 selection' }, { name: 'Prime 8 ID Max', note: 'Prime 8 selection' } ] },
  bgmi: { title: 'BGMI ID', hint: 'Choose Full Payment or Half Payment, then pick your BGMI level and rate.', levels: [ { name: 'LVL 70 ID', note: 'Level 70 selection' }, { name: 'LVL 80 ID', note: 'Level 80 selection' } ] },
  topup: { title: 'Low Cost Top Up', hint: 'Top-ups use Full Payment only.', items: [ { name: '2 Year Membership', note: 'Long-term membership option' }, { name: '5000 Diamonds', note: 'Diamond bundle' } ] }
};
const rates = [3499, 4499, 5499];
const STORE_API = {
  baseUrl: window.FF_API_BASE_URL || window.location.origin,
  async request(path, options) {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
      return data;
    } catch (error) {
      if (error instanceof TypeError) throw new Error('Could not reach the order server. Make sure the site is deployed through Netlify and /api/health is working.');
      throw error;
    }
  },
  async createOrder(order) {
    const data = await this.request('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
    return data.order;
  },
  async listOrders(password) {
    const data = await this.request('/api/orders/list', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    return data.orders || [];
  },
  async setOrderCompleted(id, password, completed) {
    const data = await this.request(`/api/orders/${encodeURIComponent(id)}/completed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, completed }) });
    return data.order;
  }
};
