# Documentation Index: Gig Payout

**Project slug:** `gig-payout`
**Maintained by:** Project team
**Last updated:** 2026-07-06
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

- [ ] All Full-scale required docs present (BRD, PRD, DSD, SDD, QAD, BUILD, CLR, GTM, OPS)
- [ ] Scrutiny verdict PROCEED WITH FIXES; TBD items tracked in BRD/GTM
- [ ] PRD Must-Haves PRD-F1 through PRD-F4 referenced in SDD and QAD
- [ ] Production Readiness Gate not yet passed (code scaffolded; mainnet deploy pending)
- [ ] BUILD/QAD reconcile after pilot on testnet

**Next actions:** Lock PRD after revenue model decision; begin BUILD implementation per SAD roster.

---

## 5. Production Readiness Gate

Reference: FMD AGENTS.md. Status: **Not started** (docs-only phase).
