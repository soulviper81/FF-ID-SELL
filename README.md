# FF ID Sell Trusted

Gaming marketplace frontend with Netlify Functions + Netlify Blobs for shared order storage.

## Netlify
- Existing site: `ffaccounts`
- Function: `netlify/functions/orders.mjs`
- API: `/api/health`, `/api/orders`, `/api/orders/list`, `/api/orders/:id/completed`
- Dealer password default: `4545` (set `ORDER_PASSWORD` in Netlify to change it)

## Notes
Orders are stored in a site-scoped Netlify Blobs store and are therefore shared across browsers/devices using the same deployed Netlify site. The repository intentionally does not use the old standalone `server.js` approach.
