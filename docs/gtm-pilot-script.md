# Concierge Pilot Script

**Audience:** Crypto agency ops lead (Alex persona)  
**Goal:** One completed loop: register → payment link → receive USDC → off-ramp → export PDF  
**Duration:** 45 minutes

## Pre-call checklist

- [ ] Staging env up; `/api/health` returns `healthy`
- [ ] `ANCHOR_PROVIDER=mock` for first pilot (or Coins.ph credentials ready)
- [ ] Agency tier flag set manually in DB if pilot qualifies

## Script

1. **Problem (5 min):** "How do you pay PH contractors from your USDC treasury today?"
2. **Demo register (5 min):** Create account; show Stellar address auto-provisioned
3. **Trustline (10 min):** Walk through Freighter/Coinbase Stellar send; mark trustline ready
4. **Payment link (5 min):** Generate SEP-7 link; client sends test USDC
5. **Dashboard (5 min):** Wait for indexer (<60s); show confirmed payment row
6. **Off-ramp (10 min):** Start mock/Coins.ph SEP-24 withdrawal to PHP
7. **Export (5 min):** Download 6-month CSV/PDF for BIR documentation
8. **Close (5 min):** "Would you run next month's payroll through this?" Record yes/no

## Success signals

- Second payout scheduled within 30 days
- Ops lead shares link with finance teammate unprompted
- Zero mis-sent payments (memo/address errors)

## Kill signal

- Agency refuses to ask clients/treasury to use USDC rail
- Off-ramp fails twice in pilot session
