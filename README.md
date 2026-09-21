# TradingLegends

Crypto-intelligence platform: real-time markets, whale alerts, news
aggregation, liquidations and an alert engine, with a Discord bot layer
planned for a later phase.

**Phase 1**: website shell with dashboard, markets, coin detail, news,
whales, liquidations and watchlist — all running on demo data. No API keys
required to run and explore the full UI.

**Phase 2** (this codebase): live market data, on by default. Prices, 24h
change, volume, market cap, high/low, total market cap and BTC dominance
come from [CoinGecko](https://www.coingecko.com/en/api) (its Keyless Public
API — no signup needed); chart candles come from
[Binance](https://developers.binance.com/docs/binance-spot-api-docs)'s
public REST API (also no key). If a live call fails, the page shows an error
state — never demo numbers pretending to be real.

**Phase 3** (this codebase): live news, also on by default. An aggregator
combines official RSS feeds from Cointelegraph, Decrypt, CoinDesk and
CryptoSlate (see `lib/providers/live/newsSources.ts`) — no key needed. Every
dedicated crypto news API with a free tier (CryptoPanic, CryptoCompare/
CoinDesk Data) discontinued it in 2026, so RSS is the durable free option.
The `/news` page also has an **Economic Calendar** tab (`?view=calendar`)
covering macro events that move crypto too (FOMC, CPI, NFP), sourced from
ForexFactory's own free public JSON feed via FairEconomy — no key needed.

**Phase 4** (this codebase): live whale monitoring, scoped to **BTC + ETH
only**. Detects large transfers by scanning the latest confirmed block on
each chain: BTC via [mempool.space](https://mempool.space/docs/api/rest)
(free, no key), ETH via [Etherscan](https://etherscan.io/apis) (free tier,
but requires `ETHERSCAN_API_KEY`). Whale Alert's API — the obvious
alternative — has no free tier ($29.95/mo+). We have no address-labeling
database, so a transaction is never called a "buy"/"sell" and both sides
show as "Unknown wallet" — that's an honesty constraint, not a bug.

**Phase 9, pulled forward** (this codebase): real funding rates and open
interest for all 8 tracked assets from
[Hyperliquid](https://hyperliquid.gitbook.io)'s public Info API (free, no
key). Hyperliquid has no exchange-wide liquidation feed, and the free
alternative (Binance Futures' `!forceOrder@arr` stream) is WebSocket-only —
neither fits a server-rendered page or Vercel's serverless functions (no
long-lived connections). So `/liquidations` runs a **live client-side
ticker** instead: the browser itself holds the WebSocket to Binance,
showing real liquidations as they stream in plus session-accumulated
totals, honestly labeled as "since you opened this page" rather than a
fake fixed time window. The same WebSocket-from-the-browser approach powers
a live trade tape on each coin page, streamed directly from Hyperliquid.

**Phase 5** (this codebase): an automated Discord alert engine — **not** a
personal alert builder on the site. On a schedule, it checks BTC/ETH's 24h
price change against ±5%/±10% thresholds and round-number price levels
(e.g. every $1,000 for BTC, $100 for ETH — "BTC broke $72,000"), and posts
to a Discord webhook whenever one is crossed. State (which threshold band
and which price level was last seen per asset) lives in a small
[Upstash Redis](https://upstash.com) instance — serverless functions have
no memory between invocations, so this is the minimum persistence needed
to avoid re-announcing the same thing every run; checking frequently
(e.g. every 5 minutes) does not mean frequent Discord messages, since a
message only goes out on an actual new crossing. No news-based alerts —
price moves only, by request. The same fired-alert log is also shown
read-only on the dashboard. See
**Setting up the alert engine** below.

**Phase 7 + 8** (this codebase): real accounts and a persistent, per-user
watchlist, via [Supabase](https://supabase.com) (free: auth + Postgres in
one project). Signing in is entirely optional — a signed-out visitor gets
exactly the previous behavior (watchlist in `localStorage`, no login
prompts anywhere). A signed-in user's watchlist instead lives in a
`watchlist_items` Postgres table with Row Level Security, so it follows
them across devices and Postgres itself (not just our code) guarantees a
user can only ever read or write their own rows. See
**Setting up accounts** below.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local`. The app shows **live** market data by
default — no env vars required. Demo data only appears if you explicitly set
`DEMO_MODE=true`.

```
NEXT_PUBLIC_APP_NAME=TradingLegends
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
DEMO_MODE=
MARKET_API_KEY=
NEWS_API_KEY=
ETHERSCAN_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
DISCORD_WEBHOOK_URL=
CRON_SECRET=
```

Without `MARKET_API_KEY`, market data runs on CoinGecko's **Keyless Public
API** — fine for local development, but CoinGecko explicitly rate-limits it
(~10-30 calls/min, shared across everyone on your IP) and does not recommend
it for production. **Before deploying**, create a free CoinGecko Demo API
key at [coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing)
(no credit card) and set `MARKET_API_KEY` — this raises the limit to 100
calls/min / 10,000 per month. Binance's candle data needs no key either way.
The Settings page shows a warning while running keyless.

If CoinGecko or Binance is unreachable, unauthenticated, or rate-limited,
the affected page shows an explicit error state with a retry button
(`app/(app)/error.tsx`) — `LiveMarketProvider` never substitutes demo data
for a failed live call.

Set `ETHERSCAN_API_KEY` (free at [etherscan.io/apis](https://etherscan.io/apis))
to enable ETH whale detection. Without it, only BTC whales are detected
(mempool.space needs no key) — the Whales page shows a note when this is
the case.

Never commit real secrets — `.env.local` is gitignored.

## Deploying (Vercel region matters)

Binance geo-blocks US IP addresses (`451 Unauthorized For Legal Reasons`),
and Vercel's default Hobby-plan function region is US-based (`iad1`,
Washington D.C.) — this breaks every coin page's chart, since candle data
comes from Binance. `vercel.json` in this repo pins the function region to
`fra1` (Frankfurt) to avoid this; don't remove it unless you've confirmed
your deployment region isn't geo-blocked by Binance.

## Setting up accounts

Optional — the site works fully without this, watchlist just stays in
`localStorage`. To enable real sign-in and a per-account watchlist:

1. Create a free project at [supabase.com](https://supabase.com) (no
   credit card). Project Settings → API → copy the **Project URL** and
   **anon public** key into `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. In the Supabase SQL Editor, run:

   ```sql
   create table public.watchlist_items (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null references auth.users(id) on delete cascade,
     symbol text not null,
     created_at timestamptz not null default now(),
     unique (user_id, symbol)
   );

   alter table public.watchlist_items enable row level security;

   create policy "Users can view their own watchlist"
     on public.watchlist_items for select
     using (auth.uid() = user_id);

   create policy "Users can insert their own watchlist items"
     on public.watchlist_items for insert
     with check (auth.uid() = user_id);

   create policy "Users can delete their own watchlist items"
     on public.watchlist_items for delete
     using (auth.uid() = user_id);
   ```

   The Row Level Security policies are what actually enforce "users only
   see their own data" — not application code, so this holds even if a
   future feature queries the table a different way.
3. Email/password sign-up works out of the box (Supabase's default email
   sending, fine for low volume). No email verification is enforced by
   default — check Authentication → Providers in Supabase if you want that.

`/login` handles both sign-in and sign-up. Visiting it while already
configured but not signing in still works — "Continue without an account"
skips straight to the dashboard.

## Setting up the alert engine

Three things, all free:

1. **Upstash Redis** — go to [upstash.com](https://upstash.com), sign up
   (no credit card), create a Redis database. Copy the REST URL and REST
   token into `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
2. **Discord webhook** — in your TradingLegends Discord server: Server
   Settings → Integrations → Webhooks → New Webhook. Point it at
   `#market-alerts` (or wherever). Copy the webhook URL into
   `DISCORD_WEBHOOK_URL`.
3. **A schedule that calls the endpoint** — `GET /api/cron/discord-alerts`
   needs to be hit periodically; nothing does that on its own. Vercel's own
   free Cron only fires once/day (too slow for this), so use **Upstash
   QStash** instead (same account as step 1, free tier: 1,000 scheduled
   calls/day): create a schedule targeting
   `https://<your-domain>/api/cron/discord-alerts` on a `*/5 * * * *` cron
   expression (every 5 minutes — well under the free 1,000/day = 288
   calls), with a custom header `x-cron-secret: <your CRON_SECRET>`. Pick
   any value for `CRON_SECRET` yourself and set the same value in both
   places — it's what stops random requests from triggering the endpoint
   and spamming your Discord.

   Checking every 5 minutes does **not** mean a Discord message every 5
   minutes — a message only goes out when BTC/ETH actually crosses a new
   ±5%/±10% threshold or round-number price level (see
   `lib/alerts/priceAlerts.ts` / `roundNumberAlerts.ts` for the dedup
   logic). Checking more often only means a real crossing is caught
   sooner, not that you get pinged more.

Until all three (plus `CRON_SECRET`) are set, the endpoint returns 503 and
the dashboard's "Recent Alerts" card says the engine isn't configured yet
— it never shows fake alert history.

## Project structure

```
app/
  page.tsx                    landing page
  login/                       sign-in / sign-up (Supabase), optional
  (app)/layout.tsx            sidebar + topbar + demo banner + mobile nav + watchlist provider
  (app)/error.tsx             shared error state for any failed live call
  (app)/dashboard/            dashboard (incl. read-only Recent Alerts card)
  (app)/markets/              markets table + /markets/[symbol] coin detail
  (app)/news/                 news aggregator + economic calendar tab (?view=calendar)
  (app)/whales/               whale monitor (BTC + ETH)
  (app)/liquidations/         liquidations
  (app)/watchlist/            watchlist (Supabase if signed in, else localStorage)
  (app)/discord/              TradingLegends Discord + bot command reference
  (app)/settings/             data source + alert engine + account status
  api/cron/discord-alerts/    the alert engine's endpoint, called on a schedule (see above)
proxy.ts                       refreshes the Supabase session cookie on every request
components/
  layout/    Sidebar, Topbar, DemoBanner, MobileNav, CommandPalette
  auth/      LoginForm, AccountMenu
  dashboard/ PriceCard, StatCard, AlertsFeed, TrendingList, HighImpactEvents
  markets/   MarketsTable, CandleChart (lightweight-charts), TimeframeSelector, LiveTradeTape (Hyperliquid WS, client-side)
  news/      NewsList, NewsCalendarTabs
  calendar/  CalendarView, EconomicEventRow, ImpactBadge
  liquidations/ LiveLiquidationTicker (Binance WS, client-side), DerivativesStatsTable
  watchlist/ WatchlistProvider (shared context; Supabase or localStorage depending on auth), WatchlistStarButton, WatchlistView
  ui/        Card, Badge, Skeleton
lib/
  types.ts               shared domain types
  format.ts               currency/percent/time formatting helpers
  errors.ts               UnknownAssetError (real 404 vs a provider outage)
  countryFlags.ts         currency/country code -> flag emoji
  supabase/
    client.ts             browser Supabase client
    server.ts              server Supabase client + getCurrentUser()
  auth/
    actions.ts             signInAction / signUpAction / signOutAction (Server Actions)
  alerts/
    redis.ts              Upstash Redis: price-tier + price-level state, recent-alerts log
    discord.ts             post an embed to the Discord webhook
    priceAlerts.ts          BTC/ETH 24h change -> +-5%/+-10% threshold-crossing detection
    roundNumberAlerts.ts    BTC/ETH price -> round-number level crossing (e.g. "broke $72,000")
  providers/
    types.ts              MarketProvider / NewsProvider / WhaleProvider / DerivativesProvider / EconomicCalendarProvider interfaces
    index.ts               provider selection (live by default, demo only if DEMO_MODE=true)
    demo/                  demo data + demo provider implementations
    live/
      symbolMap.ts         tracked assets: symbol -> CoinGecko id + Binance pair
      coingecko.ts          CoinGecko fetch helpers (markets, global stats)
      binance.ts            Binance klines -> Candle[] mapping
      liveMarketProvider.ts  MarketProvider impl combining both; throws on failure, no fallback
      newsSources.ts        official RSS feed list (Cointelegraph, Decrypt, CoinDesk, CryptoSlate)
      rss.ts                 fetch + parse one feed -> NewsItem[], strips HTML, decodes entities
      newsClassify.ts        keyword-based category + related-symbol tagging for a headline
      liveNewsProvider.ts    NewsProvider impl: merges all feeds, dedupes, sorts by date
      economicCalendar.ts    ForexFactory/FairEconomy feed -> EconomicEvent[]
      liveWhaleProvider.ts   combines BTC + ETH whale detection
      whale/bitcoinExplorer.ts   mempool.space: scan latest block, sum output values
      whale/ethereumExplorer.ts Etherscan V2: scan latest block's transaction values
      hyperliquid.ts          fetch helper: funding + open interest for all tracked assets
      liveDerivativesProvider.ts DerivativesProvider impl; getLiquidations() returns [] (see Phase 9 note above)
```

Providers are interface-based: pages and components only ever call
`marketProvider.getTicker(...)` etc., so swapping the implementation (demo,
live, or a future third source) never touches a page or component.

## Testing what you built

- `npm run build` — production build, type-checks and prerenders all routes.
- `npm run dev` then click through: `/`, `/dashboard`, `/markets`,
  `/markets/BTC`, `/news`, `/whales`, `/liquidations`, `/watchlist`,
  `/discord`, `/settings`, `/login`.
- Try `⌘K` / `Ctrl+K` (or the Search button in the topbar) to jump to any
  page or coin.
- To test the alert engine locally once configured: `curl -H "x-cron-secret: <CRON_SECRET>" http://localhost:3000/api/cron/discord-alerts`
- Resize the browser to phone width — layout switches to a bottom nav bar.

## Known limitations (by design, current phase)

- Whale monitoring only covers BTC and ETH; other tracked assets (SOL,
  LINK, AVAX, XRP, DOGE, ADA) show no whale data yet.
- Whale transaction value is gross transaction output value (can include
  change back to the sender), not a verified net transfer — an
  approximation, same as most whale trackers without UTXO clustering.
- Whale transactions never say "buy"/"sell" or name an exchange — we have
  no address-labeling database, so both sides show as "Unknown wallet".
- No historical/aggregate liquidations data exists for free — the
  Liquidations page shows a live client-side feed (only what streams in
  while the page is open) instead of a fixed-window ($ in last 1h) summary.
- Economic calendar has no "actual" result after an event happens, only
  forecast/previous — the feed doesn't provide it.
- News category/related-symbol tagging is keyword-based (see
  `newsClassify.ts`), not perfect — it's a heuristic, not a source of truth.
- Watchlist is per-account (Supabase) only if signed in; otherwise it's
  still `localStorage`-only and doesn't follow you across devices/browsers.
- No email verification enforced on sign-up by default (Supabase setting,
  not code) — fine for a small trusted user base, worth revisiting before
  a public launch.
- Tracked assets are a fixed list (`lib/providers/live/symbolMap.ts`) —
  add an entry there to track a new asset.
- The alert engine is global (BTC/ETH price moves only), not per-user —
  there is deliberately no personal alert builder on the site. Its
  thresholds (±5%/±10%, $1,000/$100 round-number steps) are hardcoded in
  `lib/alerts/priceAlerts.ts` / `roundNumberAlerts.ts`, not configurable
  from the UI yet.
- The alert engine only runs when something (Upstash QStash or similar)
  actually calls its endpoint on a schedule — nothing triggers it on its
  own.

## Next steps

- Extend whale monitoring beyond BTC/ETH (needs a chain-specific explorer
  per asset: Solana RPC, XRPL, a Dogecoin explorer, Blockfrost for
  Cardano).
- Extend the alert engine to also fire on High-impact economic calendar
  events (e.g. "warn 30 min before any High-impact release") and whale
  transactions.
- Phase 6: TradingLegends Discord bot (discord.js) with slash commands
  (`/price`, `/whales`, etc.), reusing the same provider interfaces —
  the alert engine's Discord webhook already covers push notifications;
  the bot would add on-demand lookups.
