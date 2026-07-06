# RFC: Anchor Orchestration & Off-Ramp Provider Abstraction

**Project:** Gig Payout
**RFC ID:** gig-payout-rfc-001
**Date:** 2026-07-06
**Version:** 1.0
**Owner:** Tech lead
**Status:** Locked
**Last reconciled:** 2026-07-06
**Feature:** PRD-F3 anchor off-ramp
**Sources:** [sdd-gig-payout.md](sdd-gig-payout.md), [prd-gig-payout.md](prd-gig-payout.md)

---

## 1. Context & Objective

PH corridor off-ramp depends on 1-2 live Stellar anchors (Exp 6 caution in spec). Coins.ph is primary; BCRemit is fallback. We need a provider abstraction that supports SEP-24 interactive flows, health checks, failover, and future corridor modules without rewriting core payout logic.

**Objective:** Define `AnchorProvider` interface and orchestration rules for PRD-F3.

---

## 2. Proposed Solution

### Provider interface

```typescript
interface AnchorProvider {
  id: 'coinsph' | 'bcremit';
  getToml(): Promise<AnchorToml>;
  startWithdrawal(params: WithdrawParams): Promise<{ url: string; id: string }>;
  getWithdrawalStatus(id: string): Promise<WithdrawStatus>;
  healthCheck(): Promise<'healthy' | 'degraded' | 'down'>;
}
```

### Orchestration rules

1. Default provider from env `ANCHOR_PROVIDER=coinsph`
2. Cron health check every 5 min; if primary `down` for 2 consecutive checks, flip to fallback automatically
3. In-flight withdrawals complete on original provider; new withdrawals use active provider
4. Admin API to force provider (ops runbook)

---

## 3. Technical Details & Contracts

### SEP-24 flow (PRD-F3)

1. User submits amount + destination (GCash/bank) in app
2. Backend calls `startWithdrawal` → redirect URL
3. User completes KYC at anchor (first time)
4. Callback/webhook updates `withdrawals.status`
5. Horizon indexer confirms USDC debit from user wallet

### Failure modes

| Case | Behavior |
|------|----------|
| Anchor timeout | Retry 3x; show "try again" |
| KYC rejected | Block off-ramp; support link |
| Wrong memo on inbound | QAD abuse case; client guidance page |
| Both anchors down | Pause off-ramp banner; receive still works |

### Database

`withdrawals`: `id`, `user_id`, `provider`, `anchor_session_id`, `amount_usdc`, `status`, `created_at`

---

## 4. Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| Direct Coins.ph REST API only | SEP-24 is standard Stellar path; less vendor lock if multi-anchor |
| Single provider, no fallback | Exp 6 concentration risk |
| Custodial off-ramp (we convert) | Requires VASP license; anchor handles compliance |

---

## 5. AI / Agent Implementation Notes

Implement `AnchorProvider` in `packages/anchors/` with mock provider for tests. Agent task: coins-ph-provider + bcremit-provider + orchestrator unit tests.

---

## 6. Security, Privacy & Performance

- Never pass wallet secret to anchor; user signs SEP-24 auth via redirect
- Validate callback origin against anchor TOML `TRANSFER_SERVER`
- Rate limit withdrawal starts: 5/user/hour
- Log provider flips to ops channel

---

## 7. Execution Plan

| Step | Owner | Done when |
|------|-------|-----------|
| Interface + mock | Backend agent | Tests pass |
| Coins.ph SEP-24 | Backend agent | Testnet withdrawal |
| Health cron + failover | Backend agent | Simulated failover |
| BCRemit fallback | Backend agent | Staging verified |

---

## Self-Check

- [x] Trade-offs documented
- [x] PRD-F3 referenced throughout
- [x] Security on callback path
- [x] No em-dashes
