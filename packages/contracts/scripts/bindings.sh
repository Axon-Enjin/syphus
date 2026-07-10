#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PAYMENT_REGISTRY_CONTRACT_ID:-}" ]]; then
  echo "Set PAYMENT_REGISTRY_CONTRACT_ID to the deployed contract address."
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT="$ROOT/packages/stellar/src/contract"

mkdir -p "$OUT"

stellar contract bindings typescript \
  --contract-id "$PAYMENT_REGISTRY_CONTRACT_ID" \
  --network testnet \
  --output-dir "$OUT"

echo "TypeScript bindings written to $OUT"
