# Shop 2.0 — Feature Tracker

Last push: `1.9_discounts` branch

## Features

| Feature | Description | Branch | Status |
|---------|-------------|--------|--------|
| Multi-currency | 12 currencies, live rates from frankfurter.app, selector in navbar, prices update on cards / product page / cart | shop-1.0 | UnTestedByMarian |
| Product Comparison | ↔ button on card hover, sticky bottom bar, side-by-side modal (author, category, price, tags), best-price highlighted green | shop-1.0 | UnTestedByMarian |
| Gift Cards | Auto-creates Turso table, demo codes BOOK10 / BOOK25 / WELCOME5, input in cart summary, validates single-use, shows discount line | shop-1.0 | UnTestedByMarian |
| Loyalty Points | Auto-creates Turso tables, GET /api/loyalty returns balance, POST /api/loyalty credits 1pt per $1, balance shown with ⭐ in user dropdown | shop-1.0 | UnTestedByMarian |
| Product Variants | Paperback / Hardcover / eBook / Audiobook selector on product page with per-format pricing (multipliers: 1.0x / 1.35x / 0.7x / 1.15x). Variant label shown in cart, supports adding same book in multiple formats | 1.1_variants | UnTestedByMarian |
| Quick View Modal | Eye button on product card hover opens a modal with cover, title, author, tags, price, variant selector and Add to Cart — no page navigation needed | 1.2_view_sticky | UnTestedByMarian |
| Sticky Add-to-Cart Bar | Slides in from top when the main buy button scrolls off screen on the product page. Shows thumbnail, title, selected format, price and cart toggle button | 1.2_view_sticky | UnTestedByMarian |
| Abandoned Cart Emails | Cart tracked in Turso when logged-in user visits cart page. GET /api/cart-abandon-check finds carts idle >1h and sends notification. Supports Telegram bot / Resend / console fallback | 1.3_emails_alerts | UnTestedByMarian |
| Back in Stock Alerts | "Notify me" email input on every product page. Subscriptions stored in Turso. POST /api/stock-alerts/notify/[productId] triggers alerts to all subscribers. Same Telegram/Resend/console notify helper | 1.3_emails_alerts | UnTestedByMarian |
| Product Reviews & Ratings | Star ratings (1–5), optional title, review text, verified buyer badge (checks OrderItem). Rating summary with distribution bar. One review per user per product (upsert). Review form on product page | 1.4_reviews_ratings | UnTestedByMarian |
| Recently Viewed | Horizontal scroll carousel of last 6 books browsed. Tracked in localStorage via Zustand. Persists across sessions. Appears at the bottom of every product page, hides the current product. Left/right arrow controls | 1.5_viewed | UnTestedByMarian |
| Customers Also Bought | Scored recommendations: +2 per shared tag, +1 same category. GET /api/recommendations returns up to 8 ranked products. Horizontal scroll carousel with per-card Add to Cart button | 1.6_recommendations | UnTestedByMarian |
| Wishlist / Save for Later | Heart button on every product card (hover overlay) and product page. Zustand store persisted to localStorage. /wishlist page with Add to Cart + Remove per book. Heart icon in navbar with badge count. Wishlist link in user dropdown | 1.7_whishList | UnTestedByMarian |
| Stock Badges | "In stock" / "Only N left" / "Out of stock" pill badges. Deterministic derived stock on cards (no N+1). Real stock stored in Turso via GET+PUT /api/stock/[productId] (admin-only PUT). StockStatus on product page fetches real value. Cart button disabled when out of stock | 1.8_badges | UnTestedByMarian |
| Discount Codes | % or fixed-amount coupon codes applied at cart. Turso DiscountCode table with type/value/minOrder/maxUses/expiresAt/active. POST /api/discounts/validate checks limits, expiry, min order. Admin CRUD via GET+POST+PATCH /api/discounts. Demo codes: SAVE10 (10%), SUMMER20 (20%), BOOKS5 ($5), WELCOME15 (15% min $20). Separate input from gift card in cart summary | 1.9_discounts | UnTestedByMarian |

## Status legend

| Label | Meaning |
|-------|---------|
| UnTestedByMarian | Built and pushed — waiting for Marian to test |
| Confirmed | Marian tested and approved |
| NeedsFixMarian | Marian found issues — to be fixed |
| Shipped | Merged to main and deployed to Vercel |
