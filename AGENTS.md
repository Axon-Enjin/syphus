# AGENTS.md: Syphus Build Guide

**Project:** Syphus · **Slug:** `syphus`
**Canonical BUILD source:** [docs/build-syphus.md](docs/build-syphus.md)
**Doc manifest:** [docs/index.md](docs/index.md) · Built on FMD v1.14.0

This file guides AI agents implementing Syphus. For FMD doc generation commands, see [FMD operations](#fmd-doc-operations) below.

---

## 1. How to Build From These Docs

**Read order:**

1. [docs/index.md](docs/index.md)
2. [docs/prd-syphus.md](docs/prd-syphus.md) (Must-Haves PRD-F1 through PRD-F4)
3. [docs/sdd-syphus.md](docs/sdd-syphus.md)
4. [docs/rfc-syphus-anchor-orchestration.md](docs/rfc-syphus-anchor-orchestration.md)
5. [docs/rfc-syphus-soroban-registry.md](docs/rfc-syphus-soroban-registry.md)
6. [docs/dsd-syphus.md](docs/dsd-syphus.md)
7. [docs/qad-syphus.md](docs/qad-syphus.md)
8. [docs/sad-syphus.md](docs/sad-syphus.md)

**Traceability:**

| PRD-F# | SDD | RFC | QAD | Agent |
|--------|-----|-----|-----|-------|
| PRD-F1 | §2, §3 | - | F1-* | wallet-auth |
| PRD-F2 | §4 SEP-7 | - | F2-* | payment-link |
| PRD-F3 | §4 anchor | anchor-orchestration | F3-* | anchor-offramp |
| PRD-F4 | §3 indexer | - | F4-* | horizon-indexer, export-qa |
| PRD-F9 | §2 Soroban | soroban-registry | F9-* | soroban-registry |

**Definition of done:** [docs/qad-syphus.md](docs/qad-syphus.md) §6 + FMD Production Readiness Gate.

**Product wedge (do not drift):** Crypto-native USDC payers only. Do not build "cheaper than Wise" messaging or fiat-client onboarding.

---

## 2. Subagents

See [docs/sad-syphus.md](docs/sad-syphus.md). Build order: wallet-auth → payment-link → soroban-registry → horizon-indexer → anchor-offramp → export-qa.

---

## 3. Stack Currency & Deprecations

**Verified:** 2026-07-06

| Package | Version | Source |
|---------|---------|--------|
| Node.js | 22 LTS | nodejs.org |
| Next.js | 15.3.x | nextjs.org/docs |
| TypeScript | 5.8.x | typescriptlang.org |
| @stellar/stellar-sdk | 13.x | github.com/stellar/js-stellar-sdk |
| PostgreSQL (Neon) | 16 | neon.tech |
| Vitest | 3.x | vitest.dev |
| Playwright | 1.52.x | playwright.dev |
| Tailwind CSS | 4.x | tailwindcss.com |
| Zod | 3.24.x | zod.dev |
| Soroban SDK (Rust) | 22.x | soroban.stellar.org |
| stellar CLI | latest | WSL build/deploy only |

| Use | Not | Reason |
|-----|-----|--------|
| App Router | Pages Router | Next.js 15 default |
| `@stellar/stellar-sdk` | `stellar-sdk` v10 | Package rename |
| Server Actions | API-only mutations | Next.js 15 forms |
| SEP-24 interactive | Custom fiat API | Anchor standard |

---

## 4. Golden-Path Patterns

### SEP-7 URI (PRD-F2)

```typescript
import { Networks } from '@stellar/stellar-sdk';

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

### Horizon indexer (PRD-F4)

Poll `/accounts/{id}/payments` with cursor; upsert on `transaction_hash` unique constraint.

### Soroban registry (PRD-F9)

Build in WSL: `packages/contracts/scripts/build.sh`. Deploy with `deploy-testnet.sh`. Invoke via `@syphus/stellar` soroban helpers.

---

## 5. Conventions & Guardrails

- **Research-first:** Verify SEP specs at github.com/stellar/stellar-protocol before implementing
- **Security:** Secrets in env only; validate Stellar addresses; rate limit money endpoints
- **Restraint:** Ship PRD-F1 through PRD-F4 before PRD-F5 batch payout
- **Layout:** `apps/web/`, `packages/anchors/`, `packages/stellar/`, `packages/contracts/`, `packages/db/`

---

## 6. FMD Doc Operations

This repo uses FMD via pointer. For doc generation/amendment:

- **Engine:** FMD 1.14.0 at `D:/PROJECTS/FMD` (offline) or https://github.com/delatorrecj/fmd tag v1.14.0
- **Validate:** `python D:/PROJECTS/FMD/scripts/check.py docs/ --scale full --strict`
- **Cockpit:** `python D:/PROJECTS/FMD/scripts/cockpit.py .`
- **Templates:** `D:/PROJECTS/FMD/templates/<NAME>_Template.md`
- **Session log:** Append to [docs/log-syphus.md](docs/log-syphus.md)

Do not duplicate FMD routing rules here; fetch canonical [FMD AGENTS.md](https://raw.githubusercontent.com/delatorrecj/fmd/v1.14.0/AGENTS.md) for doc triggers.

---

*Materialized from docs/build-syphus.md · 2026-07-06*
