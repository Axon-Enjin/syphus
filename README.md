# Gig Payout

[![Status: v1 scaffold](https://img.shields.io/badge/Status-v1_scaffold-green)](docs/index.md)
[![Stack: Next.js](https://img.shields.io/badge/Stack-Next.js-black)](docs/sdd-gig-payout.md)
[![Docs: FMD](https://img.shields.io/badge/Docs-FMD_v1.14.0-333)](docs/index.md)
[![Stellar](https://img.shields.io/badge/Rail-Stellar_USDC-7D00FF)](docs/sdd-gig-payout.md)

USDC payment rail for crypto-native companies paying Filipino contractors: SEP-7 invoice links, same-day PHP off-ramp, automatic income history.

Built on [FMD v1.14.0](docs/index.md). Legacy pre-FMD spec: [docs/spec.md](docs/spec.md).

## Quick start

```bash
pnpm install
cp .env.example apps/web/.env.local
# Apply schema: psql $DATABASE_URL -f packages/db/drizzle/0000_init.sql
pnpm dev          # http://localhost:3000
pnpm test         # unit tests (all packages)
pnpm typecheck
pnpm lint
```

**Requirements:** Node 22 LTS, pnpm 10+, PostgreSQL (Neon). Stellar testnet for live payment tests.

### Payment indexing (M2 testnet loop)

Run the dev server and indexer poller in parallel:

```bash
pnpm dev                 # terminal 1
pnpm --filter @gig-payout/web dev:indexer   # terminal 2
```

Manual smoke: register → enable USDC trustline → create payment link → send testnet USDC from Freighter/Coinbase → payment row appears on dashboard within ~60s.

Production: [`apps/web/vercel.json`](apps/web/vercel.json) runs `/api/cron/index-payments` every minute. Set `CRON_SECRET` in Vercel env; Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron invocations.

## What it does

- Freelancer Stellar wallet + SEP-7 payment links (PRD-F1, PRD-F2)
- USDC off-ramp to PHP via mock/Coins.ph anchor (PRD-F3)
- Payment dashboard + 6-month income CSV/PDF export (PRD-F4)
- Horizon indexer cron: `GET /api/cron/index-payments` (Bearer `CRON_SECRET`)
- Health: `GET /api/health`

**Wedge:** Crypto-native payers (web3 teams, DAOs, agencies) who already hold USDC.

## Monorepo layout

| Path | Purpose |
|------|---------|
| `apps/web` | Next.js 15 App Router UI + API |
| `packages/db` | Drizzle schema + Postgres client |
| `packages/stellar` | SEP-7 URIs, Horizon fetch, keypair gen |
| `packages/anchors` | AnchorProvider mock + Coins.ph + failover |

## Documentation

| Doc | Purpose |
|-----|---------|
| [Index](docs/index.md) | Full manifest |
| [PRD](docs/prd-gig-payout.md) | Locked features PRD-F1 through PRD-F4 |
| [BUILD](docs/build-gig-payout.md) | Stack pins + golden paths |
| [GTM pilot script](docs/gtm-pilot-script.md) | Concierge onboarding |
| [CLR launch checklist](docs/clr-launch-checklist.md) | Pre-GA counsel gate |

## License

TBD.
