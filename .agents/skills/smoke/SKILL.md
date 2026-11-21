---
name: smoke
description:
  Live read-only run against the Trailhead API that fails on GraphQL errors,
  null stats, or literal undefined, null or NaN in the rendered text and card
  HTML. Use after changing fetching, data handling or rendering, or to diagnose
  a broken card.
argument-hint: '[username]'
---

# Smoke

Run from the repository root: `bash scripts/agent/smoke.sh [username]`

The default username is `nabondance`. It calls the fetch and render code
directly and never writes a file, commits or pushes. A failure can come from a
transient API response, so run it once more before blaming the code.
