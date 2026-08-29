import Stripe from "stripe";

let client: Stripe | null = null;

/** Platform keeps 15%; seller receives 85% in cash via Connect. */
export const PLATFORM_FEE_BPS = 1500;

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

export function platformFeeFromSale(amountCents: number) {
  return Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
}

export function sellerCashFromSale(amountCents: number) {
  return amountCents - platformFeeFromSale(amountCents);
}

/** @deprecated use sellerCashFromSale — kept briefly for older call sites */
export function creatorCreditsFromSale(amountCents: number) {
  return sellerCashFromSale(amountCents);
}
