# Business Requirements Document (BRD)

**Project:** Syphus
**Date:** 2026-07-06
**Version:** 1.0
**Owner:** Project team
**Status:** Locked
**Last reconciled:** 2026-07-06
**Sources:** [idea-syphus.md](idea-syphus.md), [scrutiny-syphus.md](scrutiny-syphus.md)

---

## 1. Executive Summary

Syphus is a Stellar-based payment rail for crypto-native companies paying Filipino contractors in USDC, with same-day PHP off-ramp and automatic income history. The business targets web3 startups, DAOs, and crypto agencies where the payer already holds USDC, not fiat-first freelancers where Wise (~0.7%) and Higlobe (0.6%) already win on cost.

**Investment thesis:** Reduce ops friction (invoice links, reconciliation, batch payout, income export) for B2B payers; monetize via agency subscription and batch fees, not FX spread alone.

---

## 2. The Problem & Opportunity

### Problem

| Pain | Who feels it | Cost today |
|------|--------------|------------|
| Manual multisig USDC sends to multiple contractors | Crypto agency ops leads | 2-4 hours/month reconciliation |
| No unified invoice link for USDC payers | Web3 finance teams | Slack address sharing, error-prone |
| Off-ramp disconnected from payment record | PH freelancers receiving USDC | Manual Coins.ph + spreadsheet for BIR proof |
| Fiat remittance already optimized | General PH freelancers | Higlobe 0.6%, Wise ~0.7%; not our wedge |

### Opportunity

- PH remote export revenue $2-4B annually ([spec.md](spec.md)); crypto-native slice growing with web3 hiring
- Coinbase supports USDC on Stellar; client on-ramp exists for crypto treasuries
- Income proof as downstream feature (not standalone) after payout volume exists

### What we will not pursue

- Rate-comparison vs Xoom/Wise (Exp 1 FAIL in spec)
- Platform withdrawal acceleration without Upwork API
- Fiat-client acquisition competing with Higlobe

---

## 3. Strategic Alignment

| Alignment | Detail |
|-----------|--------|
| Portfolio | Adjacent to [Wage Lock](../../wage-lock/docs/spec.md); shared Stellar/Coins.ph corridor knowledge |
| Protocol | Universal USDC receipt + corridor off-ramp modules (PH first) |
| Validation | Scrutiny PROCEED WITH FIXES; original Exp 3 gate reframed to crypto-agency pilot, not general freelancer survey |
| Agentic build | Full FMD suite enables SAD-driven implementation at production grade |

---

## 4. Scope

### In scope (v1)

- PH corridor: USDC on Stellar → Coins.ph (BCRemit fallback) → PHP
- Freelancer dashboard, SEP-7 payment links, income export (PRD-F1 through PRD-F4)
- B2B agency onboarding path (concierge pilot)

### Out of scope (v1)

- IN/NG/LATAM corridors
- Upwork/Fiverr integration
- Standalone income-proof lending product
- Competing on remittance rates for fiat clients

### Revenue model (locked 2026-07-06)

**Decision:** Hybrid tier model. No FX spread markup; monetize ops value, not remittance rates.

| Tier | Price | Limits |
|------|-------|--------|
| Solo | Free | ≤ $2,000/mo inbound USDC; 1 wallet; CSV/PDF export |
| Agency | $49/mo | Unlimited contractors; reconciliation dashboard |
| Enterprise | Custom | SLA, dedicated support |

**v1.1 (deferred):** Per-batch fee (0.25% on volume above Solo cap). Anchor rev-share rejected (conflicts with competitive off-ramp cost).

---

## 5. Success Metrics

| Metric | 90-day target | 12-month target |
|--------|---------------|-----------------|
| Crypto-native pilot clients | 3 agencies/web3 teams | 15 paying agencies |
| Monthly USDC volume | $50k | $500k |
| Freelancer repeat payout | 50% month-2 retention | 65% |
| Gross margin | Break-even on ops | 40%+ on SaaS/batch fees |
| Anchor uptime | 99.5% | 99.9% |

---

## 6. Stakeholders & Owners

| Role | Responsibility |
|------|----------------|
| Product owner | PRD, corridor scope, pilot recruitment |
| Tech lead | SDD, anchor integration, security |
| Compliance | CLR, BSP/KYC boundary with anchor |
| GTM | Crypto agency channels, Dev3/DAO communities |

---

## Self-Check

- [x] Executive summary states reframed wedge
- [x] Problem quantified; fiat corridor explicitly excluded
- [x] Revenue TBD flagged per scrutiny
- [x] Cross-linked to IDEA and SCRUTINY
- [x] VOICE house style (no em-dashes)
