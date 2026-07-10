# Go-To-Market (GTM)

**Project:** Syphus
**Date:** 2026-07-06
**Version:** 0.1
**Owner:** GTM lead
**Status:** Draft
**Last reconciled:** N/A (not yet reconciled)
**Sources:** [brd-syphus.md](brd-syphus.md), [prd-syphus.md](prd-syphus.md), [scrutiny-syphus.md](scrutiny-syphus.md)

---

## 1. Product Summary (GTM View)

Syphus is the payment ops layer for crypto-native companies paying Filipino contractors: USDC invoice links, same-day PHP off-ramp, and automatic income records. We sell to agencies and web3 finance teams, not to fiat-first freelancers.

**Launch gate:** CLR counsel review + 1 successful staging withdrawal + 3 pilot clients committed.

---

## 2. Target Audience

| Segment | Size (est.) | Channel fit |
|---------|-------------|-------------|
| Crypto agencies (5-50 contractors) | Hundreds globally | High |
| Web3 startups with PH devs | Thousands | High |
| DAOs with contributor payroll | Hundreds | Medium |
| General Upwork PH freelancers | 1.5M+ | **Exclude** (Higlobe/Wise win) |

**ICP:** Alex-type ops lead at agency paying 5+ PH contractors monthly from USDC treasury.

---

## 3. Pricing Model

| Tier | Price | Includes |
|------|-------|----------|
| Solo | Free | ≤ $2,000/mo volume, 1 wallet, export |
| Agency | $49/mo | Unlimited contractors, batch (v1.1), priority support |
| Enterprise | Custom | SLA, dedicated anchor routing |

**TBD from BRD:** Final pricing validated in pilot; no FX spread markup messaging.

---

## 4. Positioning & Messaging

**Headline:** "USDC payroll for your PH team. One link. PHP today."

**Not us:**

- "Cheaper than Wise" (false for fiat clients)
- "Beat PayPal fees" (only true vs PayPal, not vs Higlobe)

**Us:**

- "Stop copying Stellar addresses in Slack"
- "Income PDF exports itself from on-chain history"
- "Built for treasuries that already hold USDC"

**Competitive frame:**

| Competitor | Their win | Our win |
|------------|-----------|---------|
| Higlobe | Fiat US→PH at 0.6% | USDC treasury native |
| Wise | Fiat invoicing | USDC + on-chain record |
| Manual multisig | Free | Invoice links + export + reconciliation |

---

## 5. Launch Channels & Tactics

| Channel | Tactic | Owner |
|---------|--------|-------|
| Crypto PH Telegram/Discord | Pilot offer: free Agency tier 90 days | GTM |
| Dev3 / web3 hiring communities | Case study post after pilot | GTM |
| Stellar ecosystem | SDF ecosystem listing | Product |
| Direct outreach | 20 crypto agencies on LinkedIn | Founder |
| Freelancer Facebook groups | **Do not use** for v1 | - |

**Concierge pilot script:** Set up wallet → one client payment → one off-ramp → export PDF in one session.

---

## 6. Launch Phases

| Phase | Timeline | Goal |
|-------|----------|------|
| Alpha | Week 1-4 | 3 pilot agencies, PRD-F1 through PRD-F4 |
| Beta | Week 5-8 | 10 freelancers via agencies, repeat payout 50% |
| GA | Week 9+ | Public signup, Agency tier billing |

---

## 7. Success Metrics (30-day post-launch)

| Metric | Target |
|--------|--------|
| Paying agencies | 3 |
| USDC volume | $50k |
| Off-ramp success rate | 95%+ |
| NPS (pilots) | ≥ 40 |
| Support tickets / payment | < 0.1 |

**Kill signal:** Zero agencies complete second monthly batch after 60 days → revisit wedge or park.

---

## Self-Check

- [x] Fiat freelancer acquisition explicitly excluded
- [x] Pricing aligned with BRD TBD
- [x] Messaging avoids false fee claims
- [x] Cross-linked to scrutiny findings
- [x] No em-dashes
