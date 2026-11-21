---
name: v3-next
description:
  'Take the next [v3.0] item from the private GitHub Project #1 through branch,
  implementation, verification, review and a draft PR. Use when the user asks to
  work on the next v3 item.'
argument-hint: '[item title]'
disable-model-invocation: true
---

# v3 Next

Never create repo issues, labels or milestones. Never touch `dist/`.

1. **List** the roadmap:
   `gh project item-list 1 --owner nabondance --format json --limit 100`. Keep
   titles starting with `[v3.0]`.
2. **Pick** the item named by the user, else the first with status `Ready Prio`.
   If there is none, show the `Todo` items with a recommended next one and ask.
   Leave `[v3.0][Release]` for last.
3. **Start:** set the item to `In Progress` with `gh project item-edit`, using
   IDs from `gh project field-list 1 --owner nabondance --format json`. Create a
   worktree on a new `type/short-name` branch from `origin/main`, then run
   `pnpm install --frozen-lockfile` inside it.
4. **Implement** only that item. Add or update tests.
5. **Check:** run `verify`. Also run `smoke` if fetching or rendering changed,
   `golden` if output changed, `action-contract` if inputs changed, and
   `card-preview` if the card changed.
6. **Review:** run `full-review` with `--goal "<item title and body>"`. Fix real
   findings and run `verify` again.
7. **Ship:** commit, push the branch and open a **draft** PR that lists any
   user-visible or breaking change. Do not merge it, and leave the item
   `In Progress` until it is merged.
