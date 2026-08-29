import { expect, test } from "@playwright/test";

test.describe("API contracts", () => {
  test("templates API returns published catalog", async ({ request }) => {
    const res = await request.get("/api/templates");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.templates)).toBeTruthy();
    expect(data.templates.some((t: { slug: string }) => t.slug === "ops-pager")).toBeTruthy();
    // Launch catalog: published seed bots are free + real Grok URLs only
    for (const t of data.templates) {
      if (t.authorId === "author_botshelf") {
        expect(t.priceCents).toBe(0);
        expect(t.templateUrl).toMatch(/^https:\/\/x\.ai\/bot\//);
      }
    }
  });

  test("templates search API filters", async ({ request }) => {
    const res = await request.get("/api/templates?q=Ops");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.templates.every((t: { title: string }) => /ops/i.test(t.title))).toBeTruthy();
  });

  test("free checkout API", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { templateId: "tpl_ops_pager" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.free).toBe(true);
    expect(data.grokBotUrl).toBe("https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr");
  });

  test("paid checkout API returns Stripe URL", async ({ request }) => {
    const create = await request.post("/api/templates", {
      data: {
        title: `API Paid ${Date.now().toString(36)}`,
        description: "Paid API checkout fixture",
        category: "Productivity",
        author: "API Paid",
        priceCents: 500,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "fixture",
        integrations: ["browser"],
        listForSale: true,
      },
    });
    expect(create.ok()).toBeTruthy();
    const { template } = await create.json();

    const res = await request.post("/api/checkout", {
      data: { templateId: template.id, buyerEmail: "e2e-api@botshelf.net" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
  });

  test("demo checkout API skips Stripe", async ({ request }) => {
    const create = await request.post("/api/templates", {
      data: {
        title: `API Demo ${Date.now().toString(36)}`,
        description: "Demo checkout fixture",
        category: "Productivity",
        author: "API Demo",
        priceCents: 700,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "fixture",
        integrations: ["browser"],
        listForSale: true,
      },
    });
    expect(create.ok()).toBeTruthy();
    const { template } = await create.json();

    const res = await request.post("/api/checkout", {
      data: { templateId: template.id, buyerEmail: "e2e-demo@botshelf.net", demo: true },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(String(data.url)).toMatch(/\/success/);
  });

  test("analytics API for seed author", async ({ request }) => {
    const res = await request.get("/api/analytics?authorId=author_botshelf");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.analytics?.totals).toBeTruthy();
    expect(Array.isArray(data.analytics?.byTemplate)).toBeTruthy();
  });

  test("analytics authors directory", async ({ request }) => {
    const res = await request.get("/api/analytics");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.authors)).toBeTruthy();
    expect(
      data.authors.some((a: { authorId: string }) => a.authorId === "author_botshelf"),
    ).toBeTruthy();
  });
});
