import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("...")) return null;
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

export function appUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

/** Creator keeps 85% as credits; platform fee 15%. */
export function creatorCreditsFromSale(amountCents: number) {
  return Math.round(amountCents * 0.85);
}
