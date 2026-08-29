import { expect, test } from "@playwright/test";

test.describe("Template detail + install/buy", () => {
  test("free real bot shows Add to Grok Bot and records checkout", async ({ page }) => {
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

    await page.goto("/templates/ops-pager");
    await expect(page.getByRole("heading", { name: /ops pager/i })).toBeVisible();
    const cta = page.getByRole("button", { name: /add to grok bot/i });
    await expect(cta).toBeVisible();
    await cta.click();

    await expect
      .poll(() => checkoutBody?.free === true, { timeout: 10_000 })
      .toBe(true);
    expect(String(checkoutBody?.grokBotUrl)).toBe(
      "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
    );
  });

  test("paid listing can start Stripe Checkout", async ({ page, request }) => {
    // Seed catalog is free-only; create a temporary paid listing for checkout E2E.
    const create = await request.post("/api/templates", {
      data: {
        title: `E2E Paid ${Date.now().toString(36)}`,
        description: "Temporary paid listing for checkout E2E.",
        category: "Productivity",
        author: "E2E Paid",
        priceCents: 500,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Use Ops Pager URL as stand-in for paid checkout test.",
        integrations: ["browser"],
        listForSale: true,
      },
    });
    expect(create.ok()).toBeTruthy();
    const { template } = await create.json();

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

    await page.goto(`/templates/${template.slug}`);
    const buy = page.getByRole("button", { name: /buy for/i });
    await expect(buy).toBeVisible();
    await page.getByPlaceholder(/email for receipt/i).fill("e2e@botshelf.net");
    await buy.click();

    await expect
      .poll(() => Boolean(checkoutBody?.url?.startsWith("https://checkout.stripe.com/")), {
        timeout: 20_000,
      })
      .toBe(true);

    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
  });

  test("simulate sale path works for a paid listing", async ({ page, request }) => {
    const create = await request.post("/api/templates", {
      data: {
        title: `E2E Demo Sale ${Date.now().toString(36)}`,
        description: "Temporary paid listing for simulate-sale E2E.",
        category: "Productivity",
        author: "E2E Demo",
        priceCents: 900,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Simulate sale only.",
        integrations: ["browser"],
        listForSale: true,
      },
    });
    expect(create.ok()).toBeTruthy();
    const { template } = await create.json();

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

    await page.goto(`/templates/${template.slug}`);
    await page.getByRole("button", { name: /simulate sale/i }).click();
    await expect
      .poll(() => checkoutBody?.demo === true, { timeout: 10_000 })
      .toBe(true);
    await page.waitForURL(/\/success/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /purchase simulated/i })).toBeVisible();
  });
});
