import { test, Page } from '@playwright/test';

test.setTimeout(120_000);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goto(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(1000);
}

async function smoothScroll(page: Page, px: number) {
  await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), px);
  await page.waitForTimeout(900);
}

async function scrollToTop(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(700);
}

async function hoverAllProductCards(page: Page) {
  const cards = page.locator('div[class*="group"]');
  const count = Math.min(await cards.count(), 4);
  for (let i = 0; i < count; i++) {
    await cards.nth(i).hover();
    await page.waitForTimeout(800);
  }
}

// ─── Test 1 : Homepage Tour ───────────────────────────────────────────────────
test('01 - Homepage tour', async ({ page }) => {
  await goto(page, '/');

  // Let the billboard render
  await page.waitForTimeout(2000);

  // Scroll down slowly to reveal products
  await smoothScroll(page, 300);
  await smoothScroll(page, 300);
  await smoothScroll(page, 300);

  // Hover over each product card to show the quick-add overlay
  await hoverAllProductCards(page);

  // Scroll further down
  await smoothScroll(page, 400);
  await page.waitForTimeout(1000);

  // Scroll back to top
  await scrollToTop(page);
  await page.waitForTimeout(1500);

  // Hover the logo
  await page.locator('a[href="/"]').first().hover();
  await page.waitForTimeout(800);
});

// ─── Test 2 : Browse All Categories ──────────────────────────────────────────
test('02 - Browse all categories', async ({ page }) => {
  await goto(page, '/');

  // Collect all category hrefs from the nav
  const catLinks = page.locator('nav a[href*="/category"]');
  const hrefs: string[] = [];
  const count = await catLinks.count();
  for (let i = 0; i < count; i++) {
    const href = await catLinks.nth(i).getAttribute('href');
    if (href) hrefs.push(href);
  }

  for (const href of hrefs) {
    // Hover the link in the nav (go back home first so the nav is visible)
    await goto(page, '/');
    const link = page.locator(`nav a[href="${href}"]`);
    await link.hover();
    await page.waitForTimeout(600);
    await link.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Read the category name heading
    await smoothScroll(page, 300);
    await page.waitForTimeout(800);

    // Hover product cards in this category
    await hoverAllProductCards(page);

    // Scroll down further
    await smoothScroll(page, 400);
    await page.waitForTimeout(1000);
    await scrollToTop(page);
    await page.waitForTimeout(800);
  }
});

// ─── Test 3 : Quick-add From Product Grid ────────────────────────────────────
test('03 - Quick-add products from grid', async ({ page }) => {
  await goto(page, '/');
  await page.waitForTimeout(1000);

  // Hover first card → click the cart icon in the overlay
  const firstCard = page.locator('div[class*="group"]').first();
  await firstCard.hover();
  await page.waitForTimeout(700);

  const cartIcon = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
  if (await cartIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cartIcon.click();
    await page.waitForTimeout(1800); // toast visible
  }

  // Hover second card → add it too
  const secondCard = page.locator('div[class*="group"]').nth(1);
  await secondCard.hover();
  await page.waitForTimeout(700);
  const cartIcon2 = secondCard.locator('button').filter({ has: page.locator('svg') }).last();
  if (await cartIcon2.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cartIcon2.click();
    await page.waitForTimeout(1800);
  }

  // Hover third card
  const thirdCard = page.locator('div[class*="group"]').nth(2);
  await thirdCard.hover();
  await page.waitForTimeout(700);
  const cartIcon3 = thirdCard.locator('button').filter({ has: page.locator('svg') }).last();
  if (await cartIcon3.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cartIcon3.click();
    await page.waitForTimeout(1800);
  }

  await scrollToTop(page);
  await page.waitForTimeout(1000);
});

// ─── Test 4 : Product Detail Page Deep Dive ──────────────────────────────────
test('04 - Product detail deep dive', async ({ page }) => {
  await goto(page, '/');

  // Click the first product
  const firstProduct = page.locator('a[href*="/product"]').first();
  if (await firstProduct.isVisible({ timeout: 5000 }).catch(() => false)) {
    await firstProduct.hover();
    await page.waitForTimeout(600);
    await firstProduct.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Read product name & price
    await smoothScroll(page, 200);
    await page.waitForTimeout(1000);

    // Add to cart
    const addBtn = page.getByRole('button', { name: /add to cart/i });
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.hover();
      await page.waitForTimeout(600);
      await addBtn.click();
      await page.waitForTimeout(2000); // toast

      // Button should now say "Remove from cart"
      const removeBtn = page.getByRole('button', { name: /remove from cart/i });
      if (await removeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.waitForTimeout(800);
        await removeBtn.hover();
        await page.waitForTimeout(600);
        // Add back
        await removeBtn.click();
        await page.waitForTimeout(1500);
        // Add again
        const addAgain = page.getByRole('button', { name: /add to cart/i });
        if (await addAgain.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addAgain.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    // Scroll down to see "You might also like"
    await smoothScroll(page, 400);
    await page.waitForTimeout(1000);
    await smoothScroll(page, 400);
    await page.waitForTimeout(1200);

    // Hover suggested products
    await hoverAllProductCards(page);

    await scrollToTop(page);
    await page.waitForTimeout(1000);
  }
});

// ─── Test 5 : Visit Multiple Products ────────────────────────────────────────
test('05 - Visit multiple products', async ({ page }) => {
  await goto(page, '/');

  // Collect up to 4 product links
  const links = page.locator('a[href*="/product"]');
  const count = Math.min(await links.count(), 4);
  const hrefs: string[] = [];
  for (let i = 0; i < count; i++) {
    const h = await links.nth(i).getAttribute('href');
    if (h) hrefs.push(h);
  }

  for (const href of hrefs) {
    await goto(page, href);
    await page.waitForTimeout(1200);

    // Read name + price, scroll
    await smoothScroll(page, 300);
    await page.waitForTimeout(800);

    // Add to cart
    const addBtn = page.getByRole('button', { name: /add to cart/i });
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(1800);
    }

    await scrollToTop(page);
    await page.waitForTimeout(600);
  }
});

// ─── Test 6 : Shopping Cart Management ───────────────────────────────────────
test('06 - Shopping cart management', async ({ page }) => {
  // Add 2 products first
  await goto(page, '/');
  const productLinks = page.locator('a[href*="/product"]');

  for (let i = 0; i < 2; i++) {
    const link = productLinks.nth(i);
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await link.getAttribute('href');
      if (href) {
        await goto(page, href);
        const addBtn = page.getByRole('button', { name: /add to cart/i });
        if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await addBtn.click();
          await page.waitForTimeout(1800);
        }
      }
    }
  }

  // Navigate to cart
  await goto(page, '/cart');
  await page.waitForTimeout(1500);

  // Read cart contents
  await smoothScroll(page, 200);
  await page.waitForTimeout(1000);

  // Hover the checkout button
  const checkoutBtn = page.getByRole('button', { name: /checkout/i });
  if (await checkoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await checkoutBtn.hover();
    await page.waitForTimeout(1000);
  }

  // Hover remove buttons
  const removeButtons = page.locator('button').filter({ has: page.locator('svg') });
  const rbCount = Math.min(await removeButtons.count(), 3);
  for (let i = 0; i < rbCount; i++) {
    await removeButtons.nth(i).hover();
    await page.waitForTimeout(600);
  }

  // Remove one item
  if (rbCount > 0) {
    await removeButtons.first().click();
    await page.waitForTimeout(1500);
  }

  await scrollToTop(page);
  await page.waitForTimeout(1000);
});

// ─── Test 7 : Auth & Sign-in Flow ────────────────────────────────────────────
test('07 - Auth and sign-in flow', async ({ page }) => {
  await goto(page, '/');
  await page.waitForTimeout(1000);

  // Click user nav / sign-in trigger
  const userBtn = page.getByRole('button', { name: /sign in|login|account|user/i }).first();
  if (await userBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await userBtn.hover();
    await page.waitForTimeout(600);
    await userBtn.click();
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  }

  // Visit my-orders (should redirect or show empty)
  await goto(page, '/my-orders');
  await page.waitForTimeout(2000);
  await smoothScroll(page, 300);
  await page.waitForTimeout(1000);
  await scrollToTop(page);
  await page.waitForTimeout(800);
});

// ─── Test 8 : Navbar & Footer Exploration ────────────────────────────────────
test('08 - Navbar and footer exploration', async ({ page }) => {
  await goto(page, '/');
  await page.waitForTimeout(1200);

  // Hover each nav link slowly
  const navLinks = page.locator('nav a');
  const navCount = await navLinks.count();
  for (let i = 0; i < navCount; i++) {
    await navLinks.nth(i).hover();
    await page.waitForTimeout(600);
  }

  // Scroll to footer
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  // Scroll back to top
  await scrollToTop(page);
  await page.waitForTimeout(1000);

  // Click logo to confirm home
  await page.locator('a[href="/"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
});

// ─── Test 9 : Full End-to-End Shopping Journey ───────────────────────────────
test('09 - Full end-to-end shopping journey', async ({ page }) => {
  // 1. Land on homepage
  await goto(page, '/');
  await page.waitForTimeout(1500);

  // 2. Browse a category
  const catLink = page.locator('nav a[href*="/category"]').first();
  if (await catLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await catLink.hover();
    await page.waitForTimeout(600);
    await catLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await smoothScroll(page, 300);
    await page.waitForTimeout(800);
  }

  // 3. Open a product
  const productLink = page.locator('a[href*="/product"]').first();
  if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await productLink.hover();
    await page.waitForTimeout(600);
    await productLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // 4. Add to cart
    const addBtn = page.getByRole('button', { name: /add to cart/i });
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(2000);
    }

    // 5. Check suggested products
    await smoothScroll(page, 500);
    await page.waitForTimeout(1000);
    await hoverAllProductCards(page);
    await scrollToTop(page);
    await page.waitForTimeout(800);
  }

  // 6. Go back to homepage and add one more product via quick-add
  await goto(page, '/');
  await page.waitForTimeout(1000);
  const secondCard = page.locator('div[class*="group"]').nth(1);
  await secondCard.hover();
  await page.waitForTimeout(700);

  // 7. Head to cart
  await goto(page, '/cart');
  await page.waitForTimeout(2000);
  await smoothScroll(page, 300);
  await page.waitForTimeout(1000);

  // 8. Hover checkout
  const checkoutBtn = page.getByRole('button', { name: /checkout/i });
  if (await checkoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await checkoutBtn.hover();
    await page.waitForTimeout(1200);
  }

  // 9. Return home — end of journey
  await goto(page, '/');
  await page.waitForTimeout(2000);
});
