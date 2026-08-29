import { getStripe } from "@/lib/stripe";
import type { Template } from "@/lib/types";
import { effectivePrice } from "@/lib/types";

/** Create/update Stripe Product + Price when a seller sets their own price. */
export async function syncTemplateStripePrice(
  template: Template,
): Promise<Pick<Template, "stripeProductId" | "stripePriceId"> | null> {
  const stripe = getStripe();
  const amount = effectivePrice(template);
  if (!stripe || amount <= 0) {
    return { stripeProductId: template.stripeProductId, stripePriceId: undefined };
  }

  let productId = template.stripeProductId;
  if (!productId) {
    const product = await stripe.products.create({
      name: template.title,
      description: `BotShelf template by ${template.author}`,
      metadata: {
        botshelf_template_id: template.id,
        platform: "botshelf",
        author_id: template.authorId,
      },
    });
    productId = product.id;
  } else {
    await stripe.products.update(productId, {
      name: template.title,
      description: `BotShelf template by ${template.author}`,
    });
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: amount,
    metadata: {
      botshelf_template_id: template.id,
      author_id: template.authorId,
    },
  });

  return { stripeProductId: productId, stripePriceId: price.id };
}
