# Idea Brief (IDEA)

**Project:** Gig Payout
**Date:** 2026-07-06
**Version:** 0.1
**Owner:** Project team
**Status:** Draft
**Last reconciled:** N/A (not yet reconciled with reality)
**Event / context:** Full-scale FMD build; reframed wedge from [spec.md](spec.md) after margin scrutiny

---

## 1. The Spark

**Production intent:** Real, deployable payment rail from day one. Not a rate-comparison demo. Ship auth, tests, anchor integration, and rollback; demo proves the crypto-native payout loop.

**One-line pitch:** Web3 teams and crypto agencies pay Filipino freelancers in USDC on Stellar in seconds; one address, one invoice link, same-day PHP off-ramp, and income history that builds itself.

**Problem:** Crypto-native companies (DAOs, web3 startups, crypto agencies) hold USDC treasuries but lack a purpose-built rail to pay distributed PH contractors. Manual wallet sends scale poorly: no invoice links, no batch payouts, no unified off-ramp UX, no exportable income record for recipients. Fiat-first freelancers still use PayPal or Wise; that corridor is already won by Higlobe (0.6%) and Wise (~0.7%). Our wedge is clients who already have USDC, not clients we must convert to crypto.

**Insight (why us, why now):** The original spec assumed we beat PayPal/Wise on fees. Research (Jul 2026) contradicts that for fiat clients: Higlobe partnered with Coins.ph (Aug 2025) on the same anchor at 0.6% all-in. We win where incumbents do not play: SEP-7 invoice links, batch agency payouts, and automatic on-chain income history for recipients who already receive USDC. Coinbase supports USDC withdrawals on Stellar; the client-side rail exists for crypto-native payers.

*Prior validation in [spec.md](spec.md): Exp 1 (Stellar/Coins.ph 2.1% worse than Xoom on rate), Exp 6 (1-2 PHP anchors). Evidence links to `../idea-lab/` are broken; claims preserved in spec only.*

---

## 2. Who It's For

**Primary user (named, specific):** Maria, a senior React developer in Cebu paid by a US-based web3 startup that pays contractors from a USDC treasury via multisig.

**Their moment of pain:** Finance sends USDC manually each month to five contractors across three wallets. Maria waits for the ops lead to batch transfers, copies addresses from Slack, and keeps a spreadsheet for BIR income proof. Off-ramping to GCash takes a separate Coins.ph flow with no link to the payment record.

**Success in their words:** "My client pays one link; I see USDC in five seconds and PHP in my bank today. My income PDF exports itself."

**Secondary user:** Alex, ops lead at a crypto agency paying 12 PH designers monthly from a Safe multisig. Needs batch payout + reconciliation, not another remittance app.

---

## 3. Scope & Cut Line

**In scope for v1 (PH corridor, crypto-native clients):**

| # | Capability | Demo-critical? |
|---|------------|----------------|
| 1 | Freelancer Stellar address + SEP-7 payment link / QR | YES |
| 2 | Client checkout page ("Pay [Name] in USDC") | YES |
| 3 | SEP-24 off-ramp to PHP via Coins.ph (or BCRemit fallback) | YES |
| 4 | Dashboard: payment history + 6-month CSV/PDF export | YES |
| 5 | Agency batch payout (CSV upload → multiple SEP-7 requests) | NO (v1.1) |

**Explicitly out of scope (v0):**

- Competing with Wise/Higlobe on fiat-client remittance (Exp 1 FAIL; Higlobe owns US→PH at 0.6%)
- Upwork/platform withdrawal acceleration (requires platform API; not v1)
- Standalone income-proof product (downstream feature only)
- Multi-corridor (IN, NG, LATAM) until PH corridor proves repeat use
- Full tax filing / BIR submission

**If we only ship one thing:** Freelancer receives USDC via payment link; off-ramps to PHP same day; exports one income PDF.

---

## 4. Success & Judging Criteria

**How we win (metrics):**

| Metric | Target |
|--------|--------|
| Crypto-native pilot clients | 3 agencies or web3 teams in 90 days |
| Freelancer repeat payout | 50%+ second payout within 30 days |
| Time to PHP | <24h from client USDC send |
| Batch payout adoption | 1 agency runs monthly batch by month 4 |
| Income export usage | 20%+ generate PDF within 90 days |

**Demo script (60 seconds):**

1. Show agency dashboard with 3 pending contractor invoices.
2. Client opens SEP-7 payment link; sends 500 USDC from Coinbase (Stellar network).
3. Freelancer dashboard credits in ~5 seconds; tap "Off-ramp to PHP."
4. Show GCash receipt; tap "Export income PDF" with 6-month on-chain history.

---

## 5. Concept Visuals

**Visual direction:** Clean fintech dashboard; trust-forward, not crypto-bro. Dark-on-light editorial; PHP amounts prominent; USDC as secondary label.

**Tooling used:** TBD at DSD stage (`imagegen-frontend-web` + impeccable shape)

| Screen / section | Asset path | Notes |
|------------------|------------|-------|
| Freelancer dashboard | `docs/assets/concept/dashboard.png` | TBD at DSD |
| Client payment link | `docs/assets/concept/payment-link.png` | TBD at DSD |
| Agency batch view | `docs/assets/concept/batch-payout.png` | TBD at DSD |

**Team decision:** Concept visuals deferred to DSD §0; IDEA locks product wedge only.

---

## 6. Open Questions

| Question | Owner | Resolve by |
|----------|-------|------------|
| Revenue model: SaaS fee vs flat batch fee vs anchor rev-share? | BRD | Before PRD lock |
| Minimum viable anchor partnership (Coins.ph API vs SEP-24 redirect)? | SDD | Before build |
| Can 3 crypto agencies be recruited without paid GTM? | GTM | Before launch |
| Do lenders accept on-chain income export (Exp 4 analog)? | CLR/GTM | v2 decision |

---

## Self-Check

- [x] Production intent stated in §1 (real product, not throwaway demo)
- [x] One-line pitch is specific to this project (not generic)
- [x] Cut line is explicit; minimum demo is named
- [x] Success metrics defined for crypto-native wedge
- [ ] Concept visuals linked if UI exists (deferred to DSD)
- [x] VOICE house style applied (no em-dashes)
- [x] Next suggested doc: SCRUTINY (Build the FMD gate), then BRD/PRD

**Related:** [spec.md](spec.md) (original thesis, experiments), [Wage Lock](../../wage-lock/docs/spec.md) (adjacent portfolio build)
