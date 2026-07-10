# RFC: Soroban Payment Registry

**Project:** Gig Payout
**RFC ID:** gig-payout-rfc-002
**Date:** 2026-07-07
**Version:** 1.0
**Owner:** Tech lead
**Status:** Locked
**Last reconciled:** 2026-07-07
**Feature:** PRD-F9 on-chain payment registry
**Sources:** [sdd-gig-payout.md](sdd-gig-payout.md), [prd-gig-payout.md](prd-gig-payout.md)

---

## 1. Context & Objective

Hackathon submissions require a deployed Soroban smart contract with meaningful integration. Gig Payout's product wedge is native Stellar USDC payments via SEP-7; replacing that flow with contract-mediated token transfers would break checkout UX and anchor compatibility.

**Objective:** Add a `PaymentRegistry` Soroban contract that attests payment links and agency batches on-chain and records settlement when the Horizon indexer confirms inbound USDC. USDC continues to move via native payments; the contract is an immutable audit layer.

---

## 2. Proposed Solution

### Contract: `PaymentRegistry`

| Function | Caller | Purpose |
|----------|--------|---------|
| `initialize(admin)` | Deployer (once) | Set admin address for writes |
| `register_link(slug, creator, destination, amount, memo)` | App admin key | On-chain invoice attestation |
| `register_batch(batch_id, creator, item_count, total)` | App admin key | On-chain batch attestation |
| `mark_link_paid(slug, tx_hash)` | App admin key | Settlement proof after indexer match |
| `get_link(slug)` | Anyone | Public verification read |
| `get_batch(batch_id)` | Anyone | Public verification read |

### Integration points

1. **Link create** ([`apps/web/src/app/actions/payments.ts`](../apps/web/src/app/actions/payments.ts)): after DB insert, invoke `register_link`; store `register_tx_hash`
2. **Batch create** ([`apps/web/src/app/actions/batch.ts`](../apps/web/src/app/actions/batch.ts)): after DB insert, invoke `register_batch`
3. **Indexer** ([`apps/web/src/lib/indexer.ts`](../apps/web/src/lib/indexer.ts)): when memo matches link slug, invoke `mark_link_paid`
4. **Checkout** (`/p/:slug`): show on-chain verification badge when `get_link` status is `paid`

### Memo convention

Payment links default memo to `slug` when the freelancer does not set one. This lets the indexer match inbound payments to registered links without extra DB joins on amount alone.

### Auth model

- Contract stores one `admin` address at `initialize`
- All writes require `admin.require_auth()`
- App holds `SOROBAN_ADMIN_SECRET` server-side only; never exposed to browser
- Reads are public (no auth)

---

## 3. Technical Details

### Storage

- `links`: `Map<Symbol, LinkRecord>` keyed by 16-char slug
- `batches`: `Map<Symbol, BatchRecord>` keyed by first 16 hex chars of batch UUID
- `LinkRecord`: creator, destination, amount (optional i128 stroops), memo, status, register_ts, paid_tx_hash
- `BatchRecord`: creator, item_count, total stroops, register_ts

### Environment

| Variable | Purpose |
|----------|---------|
| `SOROBAN_ENABLED` | `true` to invoke contract; `false` skips gracefully |
| `SOROBAN_RPC_URL` | Soroban RPC endpoint (testnet default) |
| `PAYMENT_REGISTRY_CONTRACT_ID` | Deployed contract address |
| `SOROBAN_ADMIN_SECRET` | Signs register/mark invoke txs |

When `SOROBAN_ENABLED=false` or contract ID is missing, app sets `on_chain_status=skipped` and continues without Soroban.

### WSL build & deploy runbook

All Rust/`stellar` CLI work runs in WSL. Node app on Windows reads env only.

```bash
# From repo root in WSL
cd packages/contracts/payment-registry
stellar contract build

# Fund admin key (testnet)
export SOROBAN_ADMIN_SECRET=S...
curl "https://friendbot.stellar.org?addr=$(stellar keys address $SOROBAN_ADMIN_SECRET)"

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/payment_registry.wasm \
  --source-account $SOROBAN_ADMIN_SECRET \
  --network testnet

# Initialize (once)
stellar contract invoke \
  --id $PAYMENT_REGISTRY_CONTRACT_ID \
  --source-account $SOROBAN_ADMIN_SECRET \
  --network testnet \
  -- initialize --admin $(stellar keys address $SOROBAN_ADMIN_SECRET)

# Generate TypeScript bindings
../scripts/bindings.sh
```

### Failure modes

| Case | Behavior |
|------|----------|
| Soroban RPC down on link create | Log error; `on_chain_status=skipped`; link still works via SEP-7 |
| Register succeeds, mark fails | `on_chain_status=registered`; retry mark on next indexer pass |
| Memo mismatch | Payment still indexed in DB; on-chain status stays `registered` |
| Admin secret missing | Skip all Soroban calls |

---

## 4. Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| USDC escrow contract | Requires clients to pay contract, not freelancer address; breaks SEP-7 and anchor flows |
| Replace SEP-7 with contract invoke | Wallet UX regression; Coinbase/Freighter expect native pay URIs |
| On-chain batch item rows | Gas cost and complexity; DB remains per-recipient source of truth |
| No smart contract | Fails hackathon Soroban requirement |

---

## 5. Traceability

| PRD-F# | SDD | QAD |
|--------|-----|-----|
| PRD-F9 | §2 Soroban layer, §3 schema | F9-* |

---

## Self-Check

- [x] Registry model preserves SEP-7 native pay
- [x] Admin auth documented
- [x] WSL runbook included
- [x] Failure modes with graceful degradation
- [x] No em-dashes
