import { expect, test } from "@playwright/test";

test.describe("Seller surfaces", () => {
  test("sell page loads connect/earnings UI", async ({ page }) => {
    await page.goto("/sell");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.getByText(/connect|bank|payout|earn|stripe/i).first()).toBeVisible();
  });

  test("studio loads analytics and author selector", async ({ page }) => {
    await page.goto("/studio");
    const select = page.locator("select").first();
    await expect(select).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(async () => select.locator("option").count(), { timeout: 20_000 })
      .toBeGreaterThan(1);
    await expect(page.getByText(/studio|analytics|pricing|earnings|views|sales/i).first()).toBeVisible();
  });

  test("studio can open with author query and show template pricing", async ({ page }) => {
    await page.goto("/studio?authorId=author_botshelf");
    const select = page.locator("select").first();
    await expect(select).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(async () => select.inputValue(), { timeout: 20_000 })
      .toBe("author_botshelf");
    await expect(page.getByText(/ops pager/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
