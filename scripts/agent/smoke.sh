#!/bin/bash
# Live read-only run against the Trailhead API.
# Usage: bash scripts/agent/smoke.sh [username]

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1
exec node scripts/agent/smoke.js "$@"
