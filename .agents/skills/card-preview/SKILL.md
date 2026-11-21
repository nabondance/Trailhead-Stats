---
name: card-preview
description:
  Render the text output and the light and dark PNG cards from offline fixtures,
  for full and empty profiles. Use to check a visual change to the card or its
  themes.
argument-hint: '[--out dir]'
---

# Card Preview

Run from the repository root: `bash scripts/agent/card-preview.sh [--out dir]`

Files go to the git-ignored `.agent-output/card-preview/` unless `--out` is
given. It uses local Chrome, or the binary in `CHROME_PATH`. Open the PNGs and
check them before calling a visual change done.
