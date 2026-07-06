# Design System Document (DSD)

**Project:** Gig Payout
**Date:** 2026-07-06
**Version:** 1.0
**Owner:** Design lead
**Status:** Locked
**Last reconciled:** 2026-07-06
**Sources:** [idea-gig-payout.md](idea-gig-payout.md), [prd-gig-payout.md](prd-gig-payout.md)

---

## 0. Brand Stance

### Three Rules

1. **Trust before crypto.** PHP amounts are hero numbers; USDC is secondary metadata.
2. **Calm fintech, not Web3 casino.** No neon gradients, no rocket emojis, no wallet-connect theatrics on first screen.
3. **Proof is visible.** Every screen shows transaction state clearly: pending, confirmed, off-ramped.

**Mode:** Light editorial fintech (warm neutrals, single accent)
**Provenance:** Reframed B2B wedge; crypto-native but freelancer-friendly

### `/impeccable init`

Run before implementation: `npx @pbakaus/impeccable init` in web app root. Document output path in BUILD.

---

## 0.5 Concept Visuals (from IDEA)

| Screen | Asset path | Status |
|--------|------------|--------|
| Freelancer dashboard | `docs/assets/concept/dashboard.png` | TBD at polish gate |
| Client payment link | `docs/assets/concept/payment-link.png` | TBD |
| Agency batch view | `docs/assets/concept/batch-payout.png` | v1.1 |

**Visual direction:** Clean fintech dashboard; trust-forward. See IDEA §5.

---

## 1. Design Philosophy & Vision

Gig Payout should feel like Wise met a modern payroll tool, not a DeFi dashboard. Users are Filipino professionals who may not self-identify as "crypto users"; payers are ops leads who want reconciliation, not token charts.

---

## 2. Brand Primitives

### 2.1 Color

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#FAFAF8` | Page background |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-text` | `#1A1A18` | Primary text |
| `--color-muted` | `#6B6B63` | Secondary text |
| `--color-accent` | `#0D6E4F` | Primary actions (trust green) |
| `--color-warning` | `#B45309` | Pending states |
| `--color-success` | `#047857` | Confirmed payments |

### 2.2 Typography

| Role | Font | Size |
|------|------|------|
| Display | **Instrument Sans** or **DM Sans** | 32-40px |
| Body | **IBM Plex Sans** | 16px / 1.5 |
| Mono | **IBM Plex Mono** | Stellar addresses, tx hashes |

No Inter as primary. No indigo primary buttons.

### 2.3 Logo & wordmark

Wordmark: **Gig Payout** in DM Sans Semibold. Icon: abstract link/chain node (single stroke, not coin logo).

### 2.4 Voice (UI copy)

- Say "Receive payment" not "Mint" or "Bridge"
- Say "Withdraw to bank" not "Off-ramp to fiat"
- Show "₱26,500" before "500 USDC"

---

## 3. Layout & Spatial System

- 8px base grid
- Max content width 1120px
- Dashboard: sidebar nav (240px) + main content
- Mobile: bottom nav for Dashboard / Pay / Withdraw / Export

---

## 4. Core Component Specs

| Component | PRD-F# | Spec |
|-----------|--------|------|
| `PaymentRow` | PRD-F4 | Date, amount PHP equivalent, USDC, status badge, tx link |
| `PaymentLinkCard` | PRD-F2 | QR, copy link, share, amount field |
| `OffRampWizard` | PRD-F3 | Step indicator: amount → anchor KYC → confirm → receipt |
| `ExportPanel` | PRD-F4 | Date range picker, CSV/PDF buttons |
| `WalletSetup` | PRD-F1 | Address display, trustline status, copy button |
| `PublicCheckout` | PRD-F2 | Freelancer name, amount, SEP-7 deep link, network warning |

---

## 5. Motion & Micro-interactions

- Payment confirmed: subtle green pulse on row (300ms)
- Copy link: toast "Link copied"
- Off-ramp pending: skeleton + status poll every 10s
- Respect `prefers-reduced-motion`

---

## 6. Accessibility (a11y)

- WCAG 2.1 AA contrast on all text
- Focus rings visible on interactive elements
- Stellar addresses: copy button + readable monospace with word-break
- Screen reader labels for status badges ("Payment confirmed")

---

## 7. Taste-Skill Settings

**Dial:** minimalist-skill direction (warm monochrome, typographic contrast)
**Variant:** fintech dashboard, not landing page hero

Concept generation: `imagegen-frontend-web` at DSD polish if assets missing.

---

## 8. Impeccable Quality Gate

Before launch, run `/impeccable audit` on Dashboard, PaymentLink, OffRamp, Export screens.

| Dimension | Min score |
|-----------|-----------|
| Hierarchy | 3 |
| Spacing | 3 |
| Typography | 3 |
| Color | 3 |
| Accessibility | 3 |

No open P0/P1 issues at ship.

---

## 9. Materialization

Run from FMD clone after lock:

```
python D:/PROJECTS/FMD/scripts/materialize.py docs/
```

Outputs: `BRAND.md`, `DESIGN.md` at project root. Do not hand-edit generated files.

---

## Self-Check

- [x] §0 Brand Stance filled before tokens
- [x] Components map to PRD-F#
- [x] No Inter/indigo defaults
- [x] Impeccable gate in §8
- [x] No em-dashes
