import { expect, test } from "@playwright/test";

test.describe("Marketplace browse", () => {
  test("homepage shows brand, hero, and empty gallery CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /botshelf/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/bot template/i);
    await expect(page.getByRole("link", { name: /browse templates/i })).toBeVisible();
    await expect(page.locator("#gallery")).toBeVisible();
    await expect(page.getByText(/no bots listed yet/i)).toBeVisible();
  });

  test("search empty state when no matches", async ({ page, request }) => {
    await request.post("/api/templates", {
      data: {
        title: `E2E Search Bot ${Date.now().toString(36)}`,
        description: "Temporary bot for search e2e.",
        category: "Productivity",
        author: "E2E Search",
        priceCents: 0,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Search coverage.",
        integrations: ["browser"],
        listForSale: false,
      },
    });

    await page.goto("/#gallery");
    const search = page.getByPlaceholder(/search bots/i);
    await expect(search).toBeVisible();

    const emptyRes = page.waitForResponse(
      (res) => res.url().includes("/api/templates?") && res.url().includes("q=zzzz"),
    );
    await search.fill("zzzz-no-such-bot-xyz");
    await emptyRes;
    await expect(page.getByText(/no templates match/i)).toBeVisible({ timeout: 15_000 });
  });

  test("nav links reach core pages", async ({ page }) => {
    await page.goto("/");
    const studioDesktop = page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "Studio",
    });
    if (await studioDesktop.isVisible().catch(() => false)) {
      await studioDesktop.click();
    } else {
      await page.getByRole("button", { name: /open menu/i }).click();
      await page
        .getByRole("navigation", { name: "Mobile" })
        .getByRole("link", { name: "Studio" })
        .click();
    }
    await expect(page).toHaveURL(/\/studio/);
  });

  test("no horizontal overflow on homepage", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      };
    });
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });

  test("yellow CTAs use black text", async ({ page }) => {
    await page.goto("/");
    const browse = page.getByRole("link", { name: /browse templates/i });
    await expect(browse).toBeVisible();
    const color = await browse.evaluate((el) => getComputedStyle(el).color);
    // rgb(0, 0, 0)
    expect(color).toMatch(/rgb\(0,\s*0,\s*0\)/);
  });
});
