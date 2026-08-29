import { expect, test } from "@playwright/test";

test.describe("Template detail + install/buy", () => {
  test("free template shows Add to Grok Bot and records checkout", async ({ page }) => {
    let checkoutBody: { free?: boolean; grokBotUrl?: string } | null = null;

    await page.route("**/api/checkout", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      checkoutBody = await response.json();
      await route.fulfill({
        status: response.status(),
        contentType: "application/json",
        body: JSON.stringify(checkoutBody),
      });
    });

    await page.route("https://x.ai/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>grok-stub</body></html>",
      });
    });

    await page.goto("/templates/harvey-specter");
    await expect(page.getByRole("heading", { name: /harvey specter/i })).toBeVisible();
    const cta = page.getByRole("button", { name: /add to grok bot/i });
    await expect(cta).toBeVisible();
    await cta.click();

    await expect
      .poll(() => checkoutBody?.free === true, { timeout: 10_000 })
      .toBe(true);
    expect(String(checkoutBody?.grokBotUrl)).toMatch(/^https:\/\/x\.ai\/bot\//);
  });

  test("paid template creates Stripe Checkout session", async ({ page }) => {
    let checkoutBody: { url?: string } | null = null;

    await page.route("**/api/checkout", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      checkoutBody = await response.json();
      await route.fulfill({
        status: response.status(),
        contentType: "application/json",
        body: JSON.stringify(checkoutBody),
      });
    });

    await page.goto("/templates/inbox-triage");
    await expect(page.getByRole("heading", { name: /inbox triage/i })).toBeVisible();
    const buy = page.getByRole("button", { name: /buy for/i });
    await expect(buy).toBeVisible();

    await page.getByPlaceholder(/email for receipt/i).fill("e2e@botshelf.net");
    await buy.click();

    await expect
      .poll(() => Boolean(checkoutBody?.url?.startsWith("https://checkout.stripe.com/")), {
        timeout: 15_000,
      })
      .toBe(true);

    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });

  test("simulate sale path records purchase without Stripe redirect", async ({ page }) => {
    let checkoutBody: { demo?: boolean; url?: string } | null = null;

    await page.route("**/api/checkout", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      checkoutBody = await response.json();
      await route.fulfill({
        status: response.status(),
        contentType: "application/json",
        body: JSON.stringify(checkoutBody),
      });
    });

    await page.goto("/templates/inbox-triage");
    const simulate = page.getByRole("button", { name: /simulate sale/i });
    await expect(simulate).toBeVisible();
    await simulate.click();

    await expect
      .poll(() => checkoutBody?.demo === true, { timeout: 10_000 })
      .toBe(true);
    expect(String(checkoutBody?.url)).toMatch(/\/success/);

    await page.waitForURL(/\/success/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /purchase simulated/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /add to grok bot/i })).toBeVisible();
  });
});
