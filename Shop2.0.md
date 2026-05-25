# Shop 2.0 — Feature Tracker

Last push: `1.1_variants` branch

## Features

| Feature | Description | Branch | Status |
|---------|-------------|--------|--------|
| Multi-currency | 12 currencies, live rates from frankfurter.app, selector in navbar, prices update on cards / product page / cart | shop-1.0 | UnTestedByMarian |
| Product Comparison | ↔ button on card hover, sticky bottom bar, side-by-side modal (author, category, price, tags), best-price highlighted green | shop-1.0 | UnTestedByMarian |
| Gift Cards | Auto-creates Turso table, demo codes BOOK10 / BOOK25 / WELCOME5, input in cart summary, validates single-use, shows discount line | shop-1.0 | UnTestedByMarian |
| Loyalty Points | Auto-creates Turso tables, GET /api/loyalty returns balance, POST /api/loyalty credits 1pt per $1, balance shown with ⭐ in user dropdown | shop-1.0 | UnTestedByMarian |
| Product Variants | Paperback / Hardcover / eBook / Audiobook selector on product page with per-format pricing (multipliers: 1.0x / 1.35x / 0.7x / 1.15x). Variant label shown in cart, supports adding same book in multiple formats | 1.1_variants | UnTestedByMarian |

## Status legend

| Label | Meaning |
|-------|---------|
| UnTestedByMarian | Built and pushed — waiting for Marian to test |
| Confirmed | Marian tested and approved |
| NeedsFixMarian | Marian found issues — to be fixed |
| Shipped | Merged to main and deployed to Vercel |
