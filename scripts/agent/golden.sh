#!/bin/bash
# Compare rendered output with the v2 baseline.
# Usage: bash scripts/agent/golden.sh [--update]

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1

if [ "$1" = "--update" ]; then
  exec pnpm exec jest __tests__/golden.test.js --coverage=false -u
fi
exec pnpm exec jest __tests__/golden.test.js --coverage=false --ci
