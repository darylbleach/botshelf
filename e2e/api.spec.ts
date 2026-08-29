import { expect, test } from "@playwright/test";

test.describe("API contracts", () => {
  test("templates API returns published catalog", async ({ request }) => {
    const res = await request.get("/api/templates");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.templates)).toBeTruthy();
    expect(data.templates.length).toBeGreaterThan(0);
    expect(data.templates.some((t: { slug: string }) => t.slug === "harvey-specter")).toBeTruthy();
  });

  test("templates search API filters", async ({ request }) => {
    const res = await request.get("/api/templates?q=Harvey");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.templates.every((t: { title: string }) => /harvey/i.test(t.title))).toBeTruthy();
  });

  test("free checkout API", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { templateId: "tpl_harvey" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.free).toBe(true);
    expect(data.grokBotUrl).toMatch(/^https:\/\/x\.ai\/bot\//);
  });

  test("paid checkout API returns Stripe URL", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { templateId: "tpl_inbox_triage", buyerEmail: "e2e-api@botshelf.net" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
  });

  test("demo checkout API skips Stripe", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { templateId: "tpl_inbox_triage", buyerEmail: "e2e-demo@botshelf.net", demo: true },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(String(data.url)).toMatch(/\/success/);
  });

  test("analytics API for seed author", async ({ request }) => {
    const res = await request.get("/api/analytics?authorId=author_maya");
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
    expect(data.authors.some((a: { authorId: string }) => a.authorId === "author_maya")).toBeTruthy();
  });
});
