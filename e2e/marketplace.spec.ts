import { expect, test } from "@playwright/test";

test.describe("Marketplace browse", () => {
  test("homepage shows brand, hero, and template gallery", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /botshelf/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/bot template/i);
    await expect(page.getByRole("link", { name: /browse templates/i })).toBeVisible();
    await expect(page.locator("#gallery")).toBeVisible();
    await expect(page.getByRole("link", { name: /harvey specter/i }).first()).toBeVisible();
  });

  test("search filters gallery results", async ({ page }) => {
    await page.goto("/#gallery");
    const search = page.getByPlaceholder(/search bots/i);
    await expect(search).toBeVisible();

    await search.fill("Harvey");
    await expect
      .poll(async () => {
        return page.getByRole("link", { name: /harvey specter/i }).count();
      })
      .toBeGreaterThan(0);

    const emptyRes = page.waitForResponse(
      (res) => res.url().includes("/api/templates?") && res.url().includes("q=zzzz"),
    );
    await search.fill("zzzz-no-such-bot-xyz");
    await emptyRes;
    await expect(page.getByText(/no templates match/i)).toBeVisible({ timeout: 15_000 });
  });

  test("filter chips narrow results", async ({ page }) => {
    await page.goto("/#gallery");
    await page.getByRole("button", { name: "Free", exact: true }).click();
    await expect(page.getByRole("link", { name: /harvey specter/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    // Catalog uses Sale / Free — not "Paid"
    await page.getByRole("button", { name: "Sale", exact: true }).click();
    await expect(page.getByRole("link", { name: /inbox triage/i }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("nav links reach core pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Studio" }).click();
    await expect(page).toHaveURL(/\/studio/);
    await page.getByRole("navigation").getByRole("link", { name: "Submit" }).click();
    await expect(page).toHaveURL(/\/submit/);
    await page.getByRole("navigation").getByRole("link", { name: "Sell" }).click();
    await expect(page).toHaveURL(/\/sell/);
    await page.getByRole("navigation").getByRole("link", { name: "Browse" }).click();
    await expect(page).toHaveURL(/\/(#gallery)?/);
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
});
