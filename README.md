# BotShelf

Bot template marketplace at **[botshelf.net](https://botshelf.net)** — browse, buy, and sell automation / AI bot templates.

## Features

- Marketplace gallery with search, filters (Free / Sale / Top / New / Featured), and categories
- Template detail pages with one-click add (free) or Stripe Checkout (paid)
- Demo purchase path when you want to test selling without a card
- Submit flow for creators (free or priced listings)
- Seller desk with credits (creators keep 85% of each sale)

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` → `.env.local` and set Stripe keys. A claimable Stripe sandbox was provisioned for early testing.

## Domain

Production hostname: `botshelf.net` (Cloudflare DNS). Deploy attaches this custom domain once Cloudflare credentials are available to the agent.
