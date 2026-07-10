# Documentation Index: Syphus

**Project slug:** `syphus`
**Maintained by:** Project team
**Last updated:** 2026-07-06
**Built on FMD v1.14.0**

---

## 1. Document Suite

| Document | File | Version | Status | Last Updated | Last Reconciled |
|----------|------|---------|--------|--------------|-----------------|
| IDEA · Idea Brief | [idea-syphus.md](idea-syphus.md) | 0.1 | Draft | 2026-07-06 | N/A |
| SCRUTINY · Scrutiny Gate | [scrutiny-syphus.md](scrutiny-syphus.md) | 0.1 | Draft | 2026-07-06 | N/A |
| BRD · Business Requirements | [brd-syphus.md](brd-syphus.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| PRD · Product Requirements | [prd-syphus.md](prd-syphus.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| DSD · Design System | [dsd-syphus.md](dsd-syphus.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| SDD · System Design | [sdd-syphus.md](sdd-syphus.md) | 1.0 | Locked | 2026-07-06 | 2026-07-06 |
| QAD · QA & Test Plan | [qad-syphus.md](qad-syphus.md) | 0.1 | Draft | 2026-07-06 | N/A |
| SAD · Subagents | [sad-syphus.md](sad-syphus.md) | 0.1 | Draft | 2026-07-06 | N/A |
| BUILD · Build Guide | [build-syphus.md](build-syphus.md) | 0.1 | Draft | 2026-07-06 | 2026-07-06 |
| CLR · Compliance & Legal | [clr-syphus.md](clr-syphus.md) | 0.1 | Draft | 2026-07-06 | N/A |
| GTM · Go-To-Market | [gtm-syphus.md](gtm-syphus.md) | 0.1 | Draft | 2026-07-06 | N/A |
| OPS · Ops & Observability | [ops-syphus.md](ops-syphus.md) | 0.1 | Draft | 2026-07-06 | N/A |
| LOG · Build Session Log | [log-syphus.md](log-syphus.md) | 0.1 | Open | 2026-07-06 | N/A |
| Legacy Spec (pre-FMD) | [spec.md](spec.md) | 1.0 | Superseded | 2026-07-06 | N/A |
| VALIDATION | - | - | N/A (not written) | - | - |
| AIA | - | - | N/A (no AI component) | - | - |

**Materialized at project root:** `README.md`, `AGENTS.md` (from BUILD)

**Build authority:** PRD supersedes legacy [spec.md](spec.md) for implementation decisions.

### RFCs

| RFC ID | File | Feature | Status | Last Updated |
|--------|------|---------|--------|--------------|
| syphus-rfc-001 | [rfc-syphus-anchor-orchestration.md](rfc-syphus-anchor-orchestration.md) | PRD-F3 anchor off-ramp | Locked | 2026-07-06 |

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
