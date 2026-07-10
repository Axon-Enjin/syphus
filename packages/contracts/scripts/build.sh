#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../payment-registry" && pwd)"
cd "$ROOT"

echo "Building PaymentRegistry WASM..."
stellar contract build

echo "WASM: $ROOT/target/wasm32v1-none/release/payment_registry.wasm"
