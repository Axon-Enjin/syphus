# Compliance & Legal Readiness (CLR)

**Project:** Syphus
**Date:** 2026-07-06
**Version:** 0.1
**Owner:** Compliance lead
**Status:** Draft
**Last reconciled:** N/A (not yet reconciled)
**Sources:** [prd-syphus.md](prd-syphus.md), [sdd-syphus.md](sdd-syphus.md)

> **Legal disclaimer:** This document is a compliance register, not legal advice. Escalation flags in §3 require qualified counsel before launch.

---

## 0. Target Markets (drives the rest of this document)

| Market | v1 scope | Regulator |
|--------|----------|-----------|
| Philippines | Freelancers receiving USDC; PHP off-ramp | BSP (via anchor), NPC (DPA 2012) |
| United States | Crypto-native clients sending USDC | FinCEN (client-side MSB context) |

---

## 1. Data Inventory / Record of Processing

| Data | Purpose | Storage | Retention | Lawful basis (TBD counsel) |
|------|---------|---------|-----------|----------------------------|
| Email, name | Account | Postgres | Life of account + 7y | Contract |
| Stellar public key | Payments | Postgres | 7y | Contract |
| Tx hashes, amounts | History, export | Postgres | 7y | Contract / legal obligation |
| IP logs | Security | Vercel logs | 90d | Legitimate interest |
| Anchor KYC status | Off-ramp gate | Postgres flag only; PII at anchor | Life of account | Contract |

**Minimize on-chain PII:** No names or emails on Stellar ledger.

---

## 2. Multi-Jurisdiction Obligations Matrix

| Obligation | PH | US | Status |
|------------|----|----|--------|
| Privacy policy | DPA 2012 | State laws if US users | Draft needed |
| VASP / money transmission | Off-ramp via licensed Coins.ph | Client sends USDC; we do not custody fiat | Anchor handles VASP; we are software layer |
| KYC | At anchor for off-ramp | Client treasury responsibility | Document boundary |
| Tax reporting | Export only; not filing | 1099 not in v1 | Export feature disclaimer |
| Breach notification | NPC 72h | Varies | OPS runbook |

---

## 3. Escalation Flags; Counsel Required

| Flag | Present | Action |
|------|---------|--------|
| Payment processing | Y | Confirm we are not unlicensed VASP in PH/US |
| Cross-border personal data | Y | Privacy policy + DPA review |
| Stablecoin custody | N (non-custodial receive) | Document no custody claim |
| Children | N | No minor targeting |
| Biometric | N | - |

**Before public launch:** Counsel review of Terms of Use, Privacy Policy, and anchor agreement boundary.

---

## 4. Terms of Use / EULA Readiness

Required sections (draft):

- Not a bank or VASP; anchor partners handle fiat conversion
- User responsible for tax reporting; export is informational only
- Stellar transaction irreversibility
- Limitation of liability for anchor downtime
- Prohibited jurisdictions (OFAC screening TBD)

---

## 5. IP Infringement & Protection Readiness

- Trademark search: "Syphus" (TBD)
- Open-source licenses: stellar-sdk MIT, document in repo
- No Circle/USDC trademark misuse in marketing

---

## 6. App Store / Platform Compliance

Web-only v1. No app store submission. If mobile added: Apple/Google crypto payment rules apply.

---

## Self-Check

- [x] Data inventory from SDD §3
- [x] Payment escalation flagged
- [x] Disclaimer banner present
- [x] No em-dashes
- [x] Not presented as legal advice
