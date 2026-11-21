---
name: verify
description:
  Full offline check of the current code — format, lint, Jest with the v2 golden
  baseline, action contract, a temp build, and proof that dist/ is untouched.
  Use before committing or opening a PR.
---

# Verify

Run from the repository root: `bash scripts/agent/verify.sh`

It prints `Verify: PASS` or `Verify: FAIL (<steps>)`. Report any failing step
with its output. Never fix a failure by updating the golden snapshot unless the
output change is intended.
