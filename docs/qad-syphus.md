# QA & Test Plan (QAD)

**Project:** Syphus
**Date:** 2026-07-06
**Version:** 0.1
**Owner:** QA lead
**Status:** Draft
**Last reconciled:** 2026-07-10 (unit/integration suite green: 74 tests across web + packages; E2E and manual staging withdrawal still pending)
**Sources:** [prd-syphus.md](prd-syphus.md), [sdd-syphus.md](sdd-syphus.md)

---

## 1. Testing Strategy & Scope

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | SEP-7 URI builder, anchor orchestrator, export formatter |
| Integration | Vitest + test DB | API routes, Horizon indexer mock |
| E2E | Playwright | Critical paths PRD-F1 through PRD-F4 |
| Manual | Staging mainnet | Real Coins.ph test withdrawal (pilot) |

**Environments:** dev (Stellar testnet), staging (mainnet small amounts), prod.

---

## 2. Test Environments & Data

| Env | Horizon | Anchor | Notes |
|-----|---------|--------|-------|
| dev | testnet | mock provider | CI on every PR |
| staging | mainnet | Coins.ph sandbox if available else mock | Weekly |
| prod | mainnet | Coins.ph live | Smoke only post-deploy |

Test wallets: funded testnet USDC accounts; never commit secrets.

---

## 3. Core Test Scenarios

### PRD-F1: Freelancer wallet & address

| ID | Type | Scenario | Expected |
|----|------|----------|----------|
| QAD-F1-01 | Happy | Register new user | Account + Stellar address displayed |
| QAD-F1-02 | Happy | Trustline setup complete | Can receive testnet USDC |
| QAD-F1-03 | Sad | Invalid email | Validation error |
| QAD-F1-04 | Abuse | Unauthenticated dashboard access | 401 redirect |

### PRD-F2: SEP-7 payment link

| ID | Type | Scenario | Expected |
|----|------|----------|----------|
| QAD-F2-01 | Happy | Generate link with amount | Valid SEP-7 URI |
| QAD-F2-02 | Happy | Simulate inbound payment | Row appears < 60s |
| QAD-F2-03 | Sad | Payment without trustline | User sees setup prompt |
| QAD-F2-04 | Abuse | Brute-force payment slug | Rate limited 429 |

### PRD-F3: Anchor off-ramp

| ID | Type | Scenario | Expected |
|----|------|----------|----------|
| QAD-F3-01 | Happy | Complete SEP-24 withdrawal | Status completed |
| QAD-F3-02 | Sad | Anchor down | Fallback or pause banner |
| QAD-F3-03 | Sad | KYC incomplete | Block with anchor redirect |
| QAD-F3-04 | Abuse | Withdraw over balance | Rejected |

### PRD-F4: Income history export

| ID | Type | Scenario | Expected |
|----|------|----------|----------|
| QAD-F4-01 | Happy | Export CSV 6 months | Correct row count and totals |
| QAD-F4-02 | Happy | Export PDF | PDF opens; totals match |
| QAD-F4-03 | Sad | Empty date range | Empty file or message |
| QAD-F4-04 | Abuse | Export another user's data | 403 |

### Cross-cutting abuse

| ID | Scenario | Expected |
|----|----------|----------|
| QAD-SEC-01 | SQL injection on login | Sanitized; no leak |
| QAD-SEC-02 | SSRF on anchor callback URL | Blocked |
| QAD-SEC-03 | Session fixation | New session on login |

### PRD-F9: On-chain payment registry

| ID | Type | Scenario | Expected |
|----|------|----------|----------|
| QAD-F9-01 | Happy | Create link with Soroban enabled | `register_link` tx hash stored; status `registered` |
| QAD-F9-02 | Happy | Inbound payment with matching memo | `mark_link_paid` invoked; status `paid` |
| QAD-F9-03 | Happy | Checkout shows paid link | Verification badge visible |
| QAD-F9-04 | Sad | Soroban disabled | Link created; `on_chain_status=skipped` |
| QAD-F9-05 | Smoke | WSL deploy + initialize | Contract ID in env; `get_link` returns record |

---

## 4. Automation vs. Manual Testing

| Suite | Automated | Manual |
|-------|-----------|--------|
| Unit + integration | 100% in CI | - |
| E2E happy paths | PR on staging | - |
| Real anchor withdrawal | - | Pre-launch checklist |
| Pilot client onboarding | - | Concierge script |

---

## 5. Bug Triage Protocol

| Severity | Definition | SLA |
|----------|------------|-----|
| P0 | Money loss, auth bypass | Fix before any deploy |
| P1 | Off-ramp broken, no receive | 4h response |
| P2 | Export wrong totals | 24h |
| P3 | UI polish | Next sprint |

---

## 6. Release Criteria (Definition of Done)

- [ ] All QAD-F1 through QAD-F4 happy + sad paths pass in CI
- [ ] QAD-F9-01 through QAD-F9-04 pass when Soroban env configured
- [ ] All abuse cases QAD-SEC-01 through QAD-SEC-03 pass
- [ ] Manual staging withdrawal completed once
- [ ] Production Readiness Gate (AGENTS.md) satisfied
- [ ] OPS alerts wired for anchor down

---

## 7. AI / LLM Evaluation

N/A. No AI product component.

---

## Self-Check

- [x] Every Must-Have PRD-F1 through PRD-F4 has test cases
- [x] Abuse paths for auth and money
- [x] Release criteria explicit
- [x] No em-dashes
