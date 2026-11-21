---
name: golden
description:
  Compare rendered text, output object and card HTML with the v2 golden
  baseline, to see exactly what a change does for users. Use when changing
  rendering, data handling or the stats output, or when the golden test fails.
argument-hint: '[--update]'
---

# Golden

Run from the repository root: `bash scripts/agent/golden.sh`

1. Read each snapshot diff and decide whether users should see that change.
2. An unintended diff is a bug, so fix the code.
3. Run `bash scripts/agent/golden.sh --update` only when every diff is intended,
   and list the output changes in the PR description.
