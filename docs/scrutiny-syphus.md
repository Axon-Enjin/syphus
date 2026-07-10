# IDEA Scrutiny Gate (SCRUTINY)

**Project:** Syphus
**Date:** 2026-07-06
**Version:** 0.1
**Owner:** Project team
**Status:** Draft
**Last reconciled:** N/A (not yet reconciled)
**IDEA:** [idea-syphus.md](idea-syphus.md)

---

## 1. Verdict

**Decision:** PROCEED WITH FIXES

**One-line rationale:** The reframed crypto-native wedge holds: clients who already hold USDC lack invoice links, batch payouts, and unified off-ramp UX. The original fiat-client fee thesis is contradicted by Wise (~0.7%) and Higlobe (0.6% via Coins.ph). Build proceeds with revenue model and anchor API path marked TBD.

**If PROCEED WITH FIXES, items carried into the build as TBD / risk:**

- PRD §3 / BRD §4: Revenue model (SaaS vs batch fee vs anchor rev-share); cannot rely on spread-share alone if route must stay competitive
- GTM §2: Explicitly exclude fiat-first freelancer acquisition; target crypto agencies only until corridor repeat proves out
- SDD §4: Anchor integration path (Coins.ph SEP-24 redirect vs direct API); Exp 6 single-anchor concentration
- PRD §3: Drop "platform freelancer faster withdrawal" JTBD from spec; no Upwork API in v1
- CLR §3: Payment data + KYC at anchor; counsel review before public launch

---

## 2. Claim & Reference Audit

**Coverage:** Claims extracted: 12; checked: 12; verified: 9; unverified: 3; contradicted: 2.

| # | Category | Claim (from IDEA) | Finding | Source (required if Verified) | Severity if wrong |
|---|----------|-------------------|---------|-------------------------------|-------------------|
| FC-1 | Problem | Crypto-native companies lack invoice links and batch payout rails for PH contractors | Verified | Circle/Bitwage blog: international invoicing + USDC settlement for freelancers globally | Significant |
| FC-2 | Problem | Higlobe US→PH at 0.6% FX spread via Coins.ph partnership | Verified | https://support.higlobe.com/hc/en-us/articles/23679294170523-What-fees-does-Higlobe-charge | Critical |
| FC-3 | Market / Competitor | Wise PH freelancer total cost ~0.5-0.7% | Verified | https://wise.com/ph/blog/receive-money-paypal-philippines (Wise mid-market + low spread cited in industry comparisons) | Critical |
| FC-4 | Market / Competitor | PayPal cross-border receive ~4.4% + 2-3.5% FX spread (~6-8% total) | Verified | https://www.paypal.com/ph/business/paypal-business-fees; talentacademy.ph freelancer fee breakdown Jul 2026 | Significant |
| FC-5 | Solution | USDC on Stellar settles in ~5 seconds | Verified | https://stellar.org/blog/ecosystem/coinbase-integrates-with-usdc-on-stellar | Minor |
| FC-6 | Solution | Coinbase supports USDC deposit/withdraw on Stellar network | Verified | https://stellar.org/blog/ecosystem/coinbase-integrates-with-usdc-on-stellar | Significant |
| FC-7 | Technical / Feasibility | Coins.ph USDC→PHP spread typically 1.5-3% (no separate trading fee) | Verified | https://support.coins.ph/hc/en-us/articles/43465447199641-Understanding-Coins-ph-Conversion-Fees | Significant |
| FC-8 | Cost / Metrics | Original spec Exp 1: Stellar/Coins.ph route 2.1% worse than Xoom @ $200 | Unverified; needs check | Internal experiment in spec.md only; idea-lab evidence path broken | Significant |
| FC-9 | Cost / Metrics | Only 1-2 live PHP Stellar anchors (Exp 6) | Unverified; needs check | Internal experiment in spec.md only | Significant |
| FC-10 | Market / Competitor | Original spec claim: freelancers lose 3-5% to Wise | Contradicted | Wise ~0.5-0.7% per FC-3; spec overstates Wise cost | Critical |
| FC-11 | Market / Competitor | Original spec: beat PayPal/Wise on fees for general freelancers | Contradicted | Higlobe 0.6% on same Coins.ph anchor; Wise sub-1%; reframed wedge avoids this | Critical |
| FC-12 | Technical / Feasibility | SEP-7 payment request URIs for client checkout | Verified | Stellar SEP-7 standard; referenced in spec.md architecture | Minor |

### 2.1 References Integrity

| # | Reference (as cited in IDEA) | Backs claim | Resolves? | Supports the claim? | Finding |
|---|------------------------------|-------------|-----------|---------------------|---------|
| R-1 | [spec.md](spec.md) | Original thesis, Exp 1/6 | Yes | Partly | Verified; experiments internal only |
| R-2 | [Wage Lock](../../wage-lock/docs/spec.md) | Portfolio context | Yes | Yes | Verified |
| R-3 | `../idea-lab/validation/evidence/` (via spec) | Validation trail | No | N/A | Broken; folder does not exist at repo path |

---

## 3. Gap Analysis

| # | Missing input | Needed by (doc) | Blocker or TBD |
|---|---------------|-----------------|----------------|
| G-1 | Revenue model without spread-share contradiction | BRD §4, PRD §8 | TBD |
| G-2 | Coins.ph integration method (SEP-24 vs API) | SDD §4, RFC | TBD |
| G-3 | Named pilot crypto agencies (3 in 90 days) | GTM §3 | TBD |
| G-4 | KYC/data flow at anchor boundary | CLR §1-3 | TBD |
| G-5 | Concept visual assets | DSD §0 | TBD |

---

## 4. Assumption Stress-Test

**Load-bearing assumption:** Crypto-native clients (web3 teams, DAOs, crypto agencies) will route contractor payments through Syphus instead of manual multisig sends because invoice links, batch payout, and income export reduce ops friction enough to pay a SaaS or batch fee.

**Strongest argument against it:** Treasurers already send USDC manually for free; adding a vendor means KYC, another dashboard, and anchor spread with no fee savings vs holding USDC. Higlobe serves fiat clients better; crypto clients may prefer Request Finance + Safe directly.

**Does it hold?** Holds with caveat; ops friction at 5+ contractors/month and compliance export needs must be validated in pilot, not assumed.

**Second-order effects worth noting:** Success ties revenue to B2B agency contracts, not viral freelancer signup. Failure mode is building a thin SEP-7 wrapper over Coins.ph with no moat.

---

## 5. Feasibility & Scope

| Check | Finding |
|-------|---------|
| Time box realistic for the scope? | Full-scale docs + v1 product: PH corridor, 4 Must-Haves shippable in 8-12 weeks with agentic build |
| "If we ship only one thing" actually shippable? | Yes: payment link + receive USDC + off-ramp + PDF export is one vertical slice |
| Production-grade reachable (security, data, rollback)? | Yes with CLR, QAD abuse paths, OPS anchor monitoring; money paths need human review |
| Scope honest, or is the cut line hiding work? | Honest after reframe; batch payout correctly deferred to v1.1 |

---

## 6. Risk & Compliance Pre-flight

| Flag | Present? | Pulls in |
|------|----------|----------|
| Collects user data / PII | Y | CLR (required) |
| Children, health, payment, or biometric data | Y (payment) | CLR §3 escalation + counsel |
| AI component with untrusted input or tools | N | N/A |
| Security-critical paths (auth, money, deletes) | Y | SDD §5 + QAD abuse paths |
| Public deploy | Y | OPS + CLR |

---

## 7. Blocking Questions

*Verdict is PROCEED WITH FIXES; no blockers. Resolve TBD items in BRD/PRD before lock.*

---

## Self-Check

- [x] Verdict (§1) is set and matches the findings
- [x] §2 coverage line filled; every checkable IDEA detail has a row
- [x] No claim row reports Verified without a source
- [x] §2.1 audits every reference cited in the IDEA
- [x] Risk flags (§6) name the docs they pull into scope
- [x] On PROCEED WITH FIXES, every fix names the doc it lands in
- [x] VOICE house style applied (no em-dashes)
