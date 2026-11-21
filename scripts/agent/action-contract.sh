#!/bin/bash
# Check that action.yml, src/actionInputs.js and the README agree.
# Usage: bash scripts/agent/action-contract.sh

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1
exec node scripts/agent/action-contract.js
