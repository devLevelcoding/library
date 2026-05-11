# Performance Plan — v1.1

## Baseline Scores

| Environment | Run date |
|---|---|
| Production build (`next start`) | 2026-05-11 |

### Category Scores

| Category | Dev server | Production | Target |
|---|---|---|---|
| Performance | 36 | **78** | 90+ |
| Accessibility | 92 | **85** | 95+ |
| Best Practices | 100 | **96** | 100 |
| SEO | 100 | **91** | 100 |

### Core Web Vitals (production)

| Metric | Current | Target (Good) |
|---|---|---|
| FCP (First Contentful Paint) | 2.7 s | < 1.8 s |
| LCP (Largest Contentful Paint) | 3.6 s | < 2.5 s |
| TBT (Total Blocking Time) | 0 ms | < 200 ms ✅ |
| CLS (Cumulative Layout Shift) | 0.173 | < 0.1 |
| Speed Index | 2.8 s | < 2.0 s |
| TTI (Time to Interactive) | 3.6 s | < 3.8 s ✅ |

---

## Issues & Fixes

### 1. CLS — 0.173 (biggest impact, target < 0.1)

**Root cause:** Images render without reserved dimensions — layout shifts when they load in.

**Fix:**
- Add explicit `width` / `height` to every `<Image>` in [components/product-card.tsx](components/product-card.tsx) and [components/gallery/index.tsx](components/gallery/index.tsx)
- Use `aspect-ratio` CSS on image wrappers to pre-reserve space before the image loads

**Effort:** Low — 1–2 files  
**Expected gain:** +8–12 Performance points

---

### 2. LCP — 3.6 s (target < 2.5 s)

**Root cause:** The hero/billboard image and first product images are not preloaded; they block LCP.

**Fix:**
- Add `priority` prop to the billboard `<Image>` in [components/ui/billboard.tsx](components/ui/billboard.tsx)
- Add `priority` to the first visible product card image in [components/product-card.tsx](components/product-card.tsx)
- In [next.config.js](next.config.js) add `cdn.dummyjson.com` and any other image hostnames to `images.domains`

**Effort:** Low  
**Expected gain:** −0.5–1 s LCP

---

### 3. FCP — 2.7 s (target < 1.8 s)

**Root cause:** Babel is used instead of SWC (because of `babel.config.js` for Jest). This produces larger, slower bundles.

**Fix:**
- Move Jest Babel config to `jest.config.js` `transform` option using `babel-jest` with an inline config, then delete `babel.config.js` so Next.js can switch to SWC
- SWC compiles ~20× faster and generates smaller output

**Effort:** Medium — requires testing Jest still works  
**Expected gain:** −0.4–0.8 s FCP, smaller JS bundles

---

### 4. Accessibility — 85 (target 95+)

**Likely issues** (common causes for this score range):
- Missing `alt` text on some images
- Insufficient color contrast on muted text/buttons
- Form inputs without associated `<label>` elements
- Missing `aria-label` on icon-only buttons (cart, close, etc.)

**Fix:**
- Audit with `axe` DevTools or the Lighthouse accessibility detail tab
- Add `alt` props to all images in [components/product-card.tsx](components/product-card.tsx), [components/gallery/gallery-tab.tsx](components/gallery/gallery-tab.tsx)
- Check contrast ratios on gray text in [app/globals.css](app/globals.css)

**Effort:** Medium  
**Expected gain:** +8–12 Accessibility points

---

### 5. SEO — 91 (target 100)

**Likely issues:**
- Missing `<meta name="description">` on some pages
- Missing `og:image` / Open Graph tags

**Fix:**
- Add `metadata` exports to [app/(root)/page.tsx](app/(root)/page.tsx), [app/(root)/product/[productId]/page.tsx](app/(root)/product/[productId]/page.tsx), and category pages
- Include `description`, `openGraph.title`, `openGraph.image`

**Effort:** Low  
**Expected gain:** +6–9 SEO points

---

### 6. Best Practices — 96 (target 100)

**Likely issue:** Console errors or use of deprecated APIs detected by Lighthouse.

**Fix:**
- Open DevTools Console in production build and clear any errors
- Check for any `http://` image src (should be `https://`)

**Effort:** Low

---

## Priority Order

| Priority | Task | Impact | Effort |
|---|---|---|---|
| 1 | Fix CLS — reserve image dimensions | High | Low |
| 2 | Fix LCP — add `priority` to hero images | High | Low |
| 3 | Fix SEO metadata on all pages | Medium | Low |
| 4 | Fix Accessibility — alt text + contrast | Medium | Medium |
| 5 | Replace Babel with SWC (fix Jest config) | Medium | Medium |
| 6 | Fix Best Practices console errors | Low | Low |

---

## Re-testing

After each fix, re-run:

```bash
npm run build
npx next start &
lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices,seo
```
