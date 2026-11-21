#!/bin/bash
# SessionStart hook: short environment status for the agent.

if [ ! -d "node_modules" ]; then
  echo "WARNING: node_modules missing, run: pnpm install"
fi

# Cloud sessions never install the plugins enabled in .claude/settings.json.
if [ "$CLAUDE_CODE_REMOTE" = "true" ] && command -v claude > /dev/null 2>&1; then
  for entry in megalinter:oxsecurity/megalinter egm:google/elephant-goldfish-model; do
    name="${entry%%:*}"
    repo="${entry#*:}"
    if ! grep -q "\"$name@$name\"" ~/.claude/plugins/installed_plugins.json 2> /dev/null; then
      if timeout 60 claude plugin marketplace add "$repo" > /dev/null 2>&1 \
        && timeout 60 claude plugin install "$name@$name" --scope user > /dev/null 2>&1; then
        echo "Plugin: $name installed, run /reload-plugins to load its skills"
      else
        echo "WARNING: $name plugin install failed"
      fi
    fi
  done
fi

NODE=$(node --version 2> /dev/null || echo 'not found')
PNPM=$(pnpm --version 2> /dev/null || echo 'not installed')
BRANCH=$(git branch --show-current 2> /dev/null || echo 'unknown')
CHANGES=$(git status --short 2> /dev/null | wc -l | tr -d ' ')
echo "Env: node $NODE | pnpm $PNPM | branch $BRANCH ($CHANGES changed files)"
echo "Reminder: dist/ is frozen until the v3 release."
