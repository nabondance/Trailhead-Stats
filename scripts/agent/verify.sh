#!/bin/bash
# Full offline check. Builds to a temp folder so dist/ is never written.
# Usage: bash scripts/agent/verify.sh

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1

FAILED=()

step() {
  local name="$1"
  shift
  echo "--- $name"
  if "$@"; then
    echo "$name: OK"
  else
    echo "$name: FAIL"
    FAILED+=("$name")
  fi
}

# Quoted glob: matches what CI's shell passes to Prettier.
format_check() {
  pnpm exec prettier --check '**/*.{js,md,yml}'
}

build_to_temp() {
  local out status
  out="$(mktemp -d)"
  pnpm exec ncc build src/index.js -o "$out" --license licenses.txt > /dev/null
  status=$?
  rm -rf "$out"
  return "$status"
}

dist_untouched() {
  local branch base
  branch="$(git branch --show-current)"
  case "$branch" in
    release-please--*) return 0 ;;
  esac
  base="$(git merge-base origin/main HEAD)" || return 1
  git diff --quiet "$base" -- dist/ || return 1
  [ -z "$(git ls-files --others --exclude-standard -- dist/)" ]
}

step format format_check
step lint pnpm run lint
step tests pnpm exec jest --ci
step contract node scripts/agent/action-contract.js
step build build_to_temp
step dist dist_untouched

if [ "${#FAILED[@]}" -eq 0 ]; then
  echo "Verify: PASS"
else
  echo "Verify: FAIL (${FAILED[*]})"
  exit 1
fi
