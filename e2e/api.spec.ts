import { expect, test } from "@playwright/test";

test.describe("API contracts", () => {
  test("templates API returns published catalog array", async ({ request }) => {
    const res = await request.get("/api/templates");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.templates)).toBeTruthy();
  });

  test("create + search templates API", async ({ request }) => {
    const stamp = Date.now().toString(36);
    const create = await request.post("/api/templates", {
      data: {
        title: `API Search ${stamp}`,
        description: "API search coverage listing.",
        category: "Productivity",
        author: "API Author",
        priceCents: 0,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Search me.",
        integrations: ["browser"],
        listForSale: false,
      },
    });
    expect(create.ok()).toBeTruthy();

    const res = await request.get(`/api/templates?q=API%20Search%20${stamp}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.templates.length).toBeGreaterThan(0);
    expect(
      data.templates.every((t: { title: string }) => /api search/i.test(t.title)),
    ).toBeTruthy();
  });

  test("free checkout API", async ({ request }) => {
    const create = await request.post("/api/templates", {
      data: {
        title: `API Free ${Date.now().toString(36)}`,
        description: "Free checkout API coverage.",
        category: "Productivity",
        author: "API Free",
        priceCents: 0,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Free.",
        integrations: ["browser"],
        listForSale: false,
      },
    });
    expect(create.ok()).toBeTruthy();
    const { template } = await create.json();

    const res = await request.post("/api/checkout", {
      data: { templateId: template.id },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.free).toBe(true);
    expect(data.grokBotUrl).toMatch(/^https:\/\/x\.ai\/bot\//);
  });

  test("paid checkout API returns Stripe URL", async ({ request }) => {
    const create = await request.post("/api/templates", {
      data: {
        title: `API Paid ${Date.now().toString(36)}`,
        description: "Paid checkout API coverage.",
        category: "Productivity",
        author: "API Paid",
        priceCents: 700,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Paid.",
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
        description: "Demo checkout API coverage.",
        category: "Productivity",
        author: "API Demo",
        priceCents: 900,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Demo.",
        integrations: ["browser"],
        listForSale: true,
      },
    });
    expect(create.ok()).toBeTruthy();
    const { template } = await create.json();

    const res = await request.post("/api/checkout", {
      data: {
        templateId: template.id,
        buyerEmail: "e2e-demo@botshelf.net",
        demo: true,
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(String(data.url)).toMatch(/\/success/);
  });

  test("analytics API for created author", async ({ request }) => {
    const create = await request.post("/api/templates", {
      data: {
        title: `API Analytics ${Date.now().toString(36)}`,
        description: "Analytics coverage.",
        category: "Productivity",
        author: "Analytics Author",
        priceCents: 0,
        templateUrl: "https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr",
        instructions: "Analytics.",
        integrations: ["browser"],
        listForSale: false,
      },
    });
    expect(create.ok()).toBeTruthy();
    const { template } = await create.json();

    const res = await request.get(
      `/api/analytics?authorId=${encodeURIComponent(template.authorId)}`,
    );
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
  });
});
