#!/bin/bash
# Render text and card variants from fixtures.
# Usage: bash scripts/agent/card-preview.sh [--out dir]

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1
exec node scripts/agent/card-preview.js "$@"
