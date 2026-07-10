# Documentation Index: Gig Payout

**Project slug:** `gig-payout`
**Maintained by:** Project team
**Last updated:** 2026-07-10
**Built on FMD v1.14.0**

---

## 1. Document Suite

| Document | File | Version | Status | Last Updated | Last Reconciled |
|----------|------|---------|--------|--------------|-----------------|
| IDEA · Idea Brief | [idea-gig-payout.md](idea-gig-payout.md) | 0.1 | Draft | 2026-07-06 | N/A |
| SCRUTINY · Scrutiny Gate | [scrutiny-gig-payout.md](scrutiny-gig-payout.md) | 0.1 | Draft | 2026-07-06 | N/A |
| BRD · Business Requirements | [brd-gig-payout.md](brd-gig-payout.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| PRD · Product Requirements | [prd-gig-payout.md](prd-gig-payout.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| DSD · Design System | [dsd-gig-payout.md](dsd-gig-payout.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| SDD · System Design | [sdd-gig-payout.md](sdd-gig-payout.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| QAD · QA & Test Plan | [qad-gig-payout.md](qad-gig-payout.md) | 0.1 | Draft | 2026-07-06 | N/A |
| SAD · Subagents | [sad-gig-payout.md](sad-gig-payout.md) | 0.1 | Draft | 2026-07-06 | N/A |
| BUILD · Build Guide | [build-gig-payout.md](build-gig-payout.md) | 0.1 | Draft | 2026-07-06 | 2026-07-06 |
| CLR · Compliance & Legal | [clr-gig-payout.md](clr-gig-payout.md) | 0.1 | Draft | 2026-07-06 | N/A |
| GTM · Go-To-Market | [gtm-gig-payout.md](gtm-gig-payout.md) | 0.1 | Draft | 2026-07-06 | N/A |
| OPS · Ops & Observability | [ops-gig-payout.md](ops-gig-payout.md) | 0.1 | Draft | 2026-07-06 | N/A |
| LOG · Build Session Log | [log-gig-payout.md](log-gig-payout.md) | 0.1 | Open | 2026-07-06 | N/A |
| Legacy Spec (pre-FMD) | [spec.md](spec.md) | 1.0 | Superseded | 2026-07-06 | N/A |
| VALIDATION | - | - | N/A (not written) | - | - |
| AIA | - | - | N/A (no AI component) | - | - |

**Materialized at project root:** `README.md`, `AGENTS.md` (from BUILD)

**Build authority:** PRD supersedes legacy [spec.md](spec.md) for implementation decisions.

### RFCs

| RFC ID | File | Feature | Status | Last Updated |
|--------|------|---------|--------|--------------|
| gig-payout-rfc-001 | [rfc-gig-payout-anchor-orchestration.md](rfc-gig-payout-anchor-orchestration.md) | PRD-F3 anchor off-ramp | Locked | 2026-07-06 |
| gig-payout-rfc-002 | [rfc-gig-payout-soroban-registry.md](rfc-gig-payout-soroban-registry.md) | PRD-F9 on-chain registry | Locked | 2026-07-07 |

---

## 2. Change Log

| CR ID | Date | Summary | Trigger doc | Docs touched | File |
|-------|------|---------|-------------|--------------|------|
| - | - | No change records yet | - | - | - |

---

## 3. Incident Log (Postmortems)

| PM ID | Incident date | Severity | Summary | Action items closed? | File |
|-------|---------------|----------|---------|----------------------|------|
| - | - | - | No incidents | - | - |

---

## 4. Health Check

Run at session start:

- [x] All Full-scale required docs present (BRD, PRD, DSD, SDD, QAD, BUILD, CLR, GTM, OPS)
- [x] Scrutiny verdict PROCEED WITH FIXES; TBD items tracked in BRD/GTM
- [x] PRD Must-Haves PRD-F1 through PRD-F4 referenced in SDD and QAD
- [x] PRD-F1..F4 (Must-Have) + F5 (batch) + F9 (Soroban) implemented; full suite green (74 tests, typecheck clean, 2026-07-10)
- [ ] Production Readiness Gate not yet passed (implemented against testnet; mainnet deploy + Soroban testnet deploy pending; F9 code uncommitted)
- [ ] Manual staging mainnet withdrawal (QAD §6) not yet run
- [ ] BUILD/QAD reconcile after pilot on testnet

**Next actions:** Commit uncommitted F9 Soroban work; deploy PaymentRegistry to testnet and wire contract ID; run manual staging withdrawal; move BUILD/QAD from Draft toward Locked after testnet pilot.

---

## 5. Production Readiness Gate

Reference: FMD AGENTS.md. Status: **In progress** (implementation complete for F1-F5 + F9 against testnet; not passed). Outstanding for gate: mainnet + Soroban testnet deploy, contract ID wiring, one manual staging withdrawal, OPS anchor-down alerts, and committing the F9 working tree.
