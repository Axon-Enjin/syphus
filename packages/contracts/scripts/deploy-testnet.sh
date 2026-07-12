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

# `stellar keys address` only resolves identity names (CLI 21+), so register
# the secret under a throwaway identity to derive the public key.
TMP_IDENTITY="syphus-deploy-tmp-$$"
echo "$SOROBAN_ADMIN_SECRET" | stellar keys add "$TMP_IDENTITY" --secret-key >/dev/null
ADMIN_PUB="$(stellar keys public-key "$TMP_IDENTITY")"
stellar keys rm "$TMP_IDENTITY" >/dev/null 2>&1 || true
if [[ -z "$ADMIN_PUB" ]]; then
  echo "Could not derive admin public key from SOROBAN_ADMIN_SECRET."
  exit 1
fi
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
