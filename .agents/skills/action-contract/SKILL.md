---
name: action-contract
description:
  Check that the inputs in action.yml, src/actionInputs.js and the README tables
  agree on names, required flags, defaults and validation. Use when adding,
  renaming, removing or changing the default of an action input.
---

# Action Contract

Run from the repository root: `bash scripts/agent/action-contract.sh`

It prints `Contract: OK` or one line per mismatch. Fix the file that is wrong.
Renaming or removing an input is a breaking change, so it belongs in v3 and in
the release notes.
