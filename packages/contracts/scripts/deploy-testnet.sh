#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SOROBAN_ADMIN_SECRET:-}" ]]; then
  echo "Set SOROBAN_ADMIN_SECRET to a testnet keypair secret before deploying."
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../payment-registry" && pwd)"
WASM="$ROOT/target/wasm32v1-none/release/payment_registry.wasm"

if [[ ! -f "$WASM" ]]; then
  echo "WASM not found. Run packages/contracts/scripts/build.sh first."
  exit 1
fi

ADMIN_PUB="$(stellar keys address "$SOROBAN_ADMIN_SECRET")"
echo "Funding admin $ADMIN_PUB via Friendbot..."
curl -sf "https://friendbot.stellar.org?addr=${ADMIN_PUB}" >/dev/null || true

echo "Deploying PaymentRegistry to testnet..."
CONTRACT_ID="$(stellar contract deploy \
  --wasm "$WASM" \
  --source-account "$SOROBAN_ADMIN_SECRET" \
  --network testnet)"

echo "PAYMENT_REGISTRY_CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "Initialize (run once):"
echo "stellar contract invoke --id $CONTRACT_ID --source-account \$SOROBAN_ADMIN_SECRET --network testnet -- initialize --admin $ADMIN_PUB"
