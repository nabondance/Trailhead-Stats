# Agent Context - Trailhead Stats

GitHub Action that fetches a public Trailhead profile and writes the stats (text
or a PNG card) between `<!--TH_Stats:start-->` and `<!--TH_Stats:end-->` in a
file of the user's repository.

## Rules

1. **Use `pnpm`**, never `npm` or `yarn`.
2. **`dist/` is frozen.** It is what `@main` users run, and it only changes in
   release-please PRs. Never run `pnpm all`, `pnpm bundle` or `pnpm package`. A
   hook blocks them and CI (`dist-guard.yml`) fails any PR touching `dist/`.
3. **Check with `bash scripts/agent/verify.sh`, not `pnpm test`.** `pnpm test`
   can exit 0 when Jest fails, and it rewrites the coverage badge.
4. **Never call `run()` locally.** Unless `output-only` or `no-commit` is set,
   it commits and pushes. Use `bash scripts/agent/smoke.sh`, which cannot write.
5. **Everything ships as v3.0.0.** v2 is frozen, so never propose a v2.x
   release.
6. **Track work in the private GitHub Project #1** (owner `nabondance`). Never
   create repo issues, labels or milestones. Items with `Version` = `v3.0` are
   the roadmap.
7. **Commits** follow `type(scope): description`. Common scopes: `core`, `deps`,
   `ui`, `config`, `release`, `util`, `auth`.

## Code Map

| File                   | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `action.yml`           | Public contract: inputs, outputs, runtime          |
| `src/main.js`          | Orchestrates fetch, display, file update, push     |
| `src/actionInputs.js`  | Reads and validates inputs (`validators.js`)       |
| `src/getStats.js`      | Trailhead GraphQL calls (`queries.js`)             |
| `src/displayStats.js`  | Normalizes data, renders text, output and card     |
| `src/cardGenerator.js` | Card HTML and PNG through Puppeteer (`cardCss.js`) |
| `src/updateFile.js`    | Replaces the tagged block, commits and pushes      |

## Known Pitfalls

- The Trailhead API can return HTTP 200 with `trailheadStats: null` or with
  GraphQL `errors`. `src/getStats.js` validates every response, retries, then
  throws, so nothing is rendered or committed. Keep new fetches and fields on
  that path: never fall back to partial data.
- `createCardAsPng` hardcodes `/usr/bin/chromium-browser`, so use `card-preview`
  to render locally.
- Changing `action.yml` inputs means updating `actionInputs.js` and the README
  tables too. `action-contract` checks them.
- `__tests__/__snapshots__/golden.test.js.snap` is the v2 output baseline.
  Update it only for an intended output change, and say so in the PR.

## Skills

- **`verify`**: format, lint, tests, contract, temp build, `dist/` untouched
- **`smoke [username]`**: live read-only run, fails on `undefined` or `null`
- **`golden [--update]`**: compare rendered output with the v2 baseline
- **`card-preview [--out dir]`**: render text and cards from fixtures
- **`action-contract`**: check `action.yml`, `actionInputs.js` and README agree
- **`trailhead-api`**: endpoints, queries, and how to debug API responses
- **`v3-next`**: take the next `Version: v3.0` item through to a draft PR
- **`cold-review [pr]`**: zero-context review by the `code-goldfish` agent
- **`full-review [pr]`**: cold, full-context and security reviews, merged

### Design work (EGM plugin)

The [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model)
plugin (`egm@egm`) is enabled in `.claude/settings.json`. If its skills are
missing, install it once:

- Claude Code:
  `claude plugin marketplace add google/elephant-goldfish-model && claude plugin install egm@egm`
- Codex:
  `codex plugin marketplace add google/elephant-goldfish-model && codex plugin add egm@egm`

Its skills are user-only, so the repo wraps them in skills agents can pick on
their own:

- `design-brainstorm`: rough idea to brief
- `design-draft`: brief to design doc
- `design-review`: zero-context review of a design doc
- `design-drift`: design docs vs code

EGM artifact directory: docs/egm
