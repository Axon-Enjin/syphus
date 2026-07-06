# Build Guide (BUILD)

**Project:** Gig Payout
**Date:** 2026-07-06
**Version:** 0.1
**Owner:** Tech lead
**Status:** Draft
**Last reconciled:** 2026-07-06
**Sources:** [sdd-gig-payout.md](sdd-gig-payout.md), [dsd-gig-payout.md](dsd-gig-payout.md), [sad-gig-payout.md](sad-gig-payout.md)

---

## 1. How to Build From These Docs

**Read order:**

1. [docs/index.md](docs/index.md) (manifest)
2. [docs/prd-gig-payout.md](docs/prd-gig-payout.md) (Must-Haves PRD-F1 through PRD-F4)
3. [docs/sdd-gig-payout.md](docs/sdd-gig-payout.md) (architecture)
4. [docs/rfc-gig-payout-anchor-orchestration.md](docs/rfc-gig-payout-anchor-orchestration.md) (PRD-F3)
5. [docs/dsd-gig-payout.md](docs/dsd-gig-payout.md) (UI tokens)
6. [docs/qad-gig-payout.md](docs/qad-gig-payout.md) (test matrix)
7. [docs/sad-gig-payout.md](docs/sad-gig-payout.md) (agent roster)

**Traceability map:**

| PRD-F# | SDD | RFC | QAD | Agent |
|--------|-----|-----|-----|-------|
| PRD-F1 | §2, §3 | - | F1-* | wallet-auth |
| PRD-F2 | §4 SEP-7 | - | F2-* | payment-link |
| PRD-F3 | §4 anchor | anchor-orchestration | F3-* | anchor-offramp |
| PRD-F4 | §3 indexer | - | F4-* | horizon-indexer, export-qa |

**Definition of done:** QAD §6 + Production Readiness Gate in FMD AGENTS.md.

---

## 2. Subagents

See [sad-gig-payout.md](sad-gig-payout.md). Main agent orchestrates; do not spawn more than one agent per module concurrently on conflicting files.

---

## 3. Stack Currency & Deprecations

**Verified:** 2026-07-06

| Package | Version | Source |
|---------|---------|--------|
| Node.js | 22 LTS | https://nodejs.org |
| Next.js | 15.3.x | https://nextjs.org/docs |
| TypeScript | 5.8.x | https://www.typescriptlang.org |
| @stellar/stellar-sdk | 13.x | https://github.com/stellar/js-stellar-sdk |
| PostgreSQL (Neon) | 16 | https://neon.tech |
| Vitest | 3.x | https://vitest.dev |
| Playwright | 1.52.x | https://playwright.dev |
| Tailwind CSS | 4.x | https://tailwindcss.com |
| Auth.js v5 (`next-auth@5`) | 5.x | https://authjs.dev |
| Drizzle ORM | 0.39.x | https://orm.drizzle.team |
| Zod | 3.24.x | https://zod.dev |

### Deprecations register (use X not Y)

| Use | Not | Reason | Verified |
|-----|-----|--------|----------|
| App Router | Pages Router | Next.js 15 default | 2026-07-06 |
| `@stellar/stellar-sdk` | `stellar-sdk` v10 | Package rename | 2026-07-06 |
| Server Actions for mutations | API routes only | Next.js 15 pattern for forms | 2026-07-06 |
| SEP-24 interactive | Custom fiat API | Anchor standard | 2026-07-06 |

---

## 4. Golden-Path Patterns

### SEP-7 link generation (PRD-F2)

```typescript
// Verified 2026-07-06 against stellar-sdk 13.x docs
import { Networks, Operation, TransactionBuilder, Asset } from '@stellar/stellar-sdk';

export function buildSep7Uri(destination: string, amount: string, memo?: string) {
  const params = new URLSearchParams({
    destination,
    amount,
    asset_code: 'USDC',
    asset_issuer: process.env.USDC_ISSUER!,
    network_passphrase: Networks.PUBLIC,
  });
  if (memo) params.set('memo', memo);
  return `web+stellar:pay?${params.toString()}`;
}
```

### Horizon payment poll (PRD-F4)

Use cursor from last indexed `paging_token`; upsert on `transaction_hash` unique constraint.

---

## 5. Conventions & Guardrails

**Research-first:** Verify Stellar SEP changes at https://github.com/stellar/stellar-protocol before implementing.

**Ponytail restraint:** Do not add PRD-F5 batch until PRD-F1 through PRD-F4 ship. Do not cut QAD abuse tests or CLR money-path review.

**Security:**

- Secrets in `.env.local` only; never commit
- Validate all Stellar addresses with `StrKey.isValidEd25519PublicKey`
- Rate limit money endpoints

**File layout:**

```
apps/web/          # Next.js app
packages/anchors/  # AnchorProvider implementations
packages/stellar/  # SEP-7, Horizon helpers
packages/db/       # Drizzle schema + migrations
```

---

## 6. Materialization

This document is the source for project root `AGENTS.md`. After lock, copy §1-§5 into `AGENTS.md` with FMD pointer footer linking to `D:/PROJECTS/FMD` for doc generation commands.

Run implementation from this guide, not from training memory.

---

## Self-Check

- [x] Stack pinned with dates
- [x] Golden-path samples version-tagged
- [x] PRD-F traceability complete
- [x] Production gate referenced
- [x] No em-dashes
