---
name: trailhead-api
description:
  Reference for the Trailhead GraphQL API as used by this action — endpoints,
  queries, variables, response paths and failure modes. Use when exploring,
  debugging or changing src/getStats.js or src/queries.js, or when a card shows
  missing or undefined data.
---

# Trailhead API

No auth is needed for public profiles. Requests are `POST` with
`Content-Type: application/json` and a `{ query, variables }` body.

| Fetch function (`src/getStats.js`) | Query (`src/queries.js`)        | Endpoint  | Response path                 |
| ---------------------------------- | ------------------------------- | --------- | ----------------------------- |
| `fetchTrailblazerRankInfo`         | `GET_TRAILBLAZER_RANK`          | `profile` | `data.profile.trailheadStats` |
| `fetchTrailblazerBadgesInfo`       | `GET_TRAILBLAZER_BADGES`        | `profile` | `data.profile.earnedAwards`   |
| `fetchTrailblazerSuperBadgesInfo`  | same, `filter: 'SUPERBADGE'`    | `profile` | `data.profile.earnedAwards`   |
| `fetchTrailblazerEventBadgesInfo`  | same, `filter: 'EVENT'`         | `profile` | `data.profile.earnedAwards`   |
| `fetchTrailblazerCertifsInfo`      | `GET_TRAILBLAZER_CERTIFS`       | `profile` | `data.profile.credential`     |
| `fetchTrailblazerSkillsInfo`       | `GET_TRAILBLAZER_SKILLS`        | `profile` | `data.profile.earnedSkills`   |
| `fetchTrailblazerEarnedStampsInfo` | `GET_TRAILBLAZER_EARNED_STAMPS` | `mobile`  | `data.earnedStamps`           |

Endpoints:

- `profile`: `https://profile.api.trailhead.com/graphql`
- `mobile`: `https://mobile.api.trailhead.com/graphql`

Profile queries use `{ slug, hasSlug: true }`. Paginated queries add `count` and
`after`. The stamps query also takes `first`.

## Failure Modes

- **HTTP 200 with `trailheadStats: null`:** intermittent, and usually gone on
  the next run. It renders as literal `undefined`. Do not treat it as a schema
  break.
- **GraphQL `errors`:** returned with HTTP 200, so axios does not throw.
- **`PrivateProfile`:** `__typename` is `PrivateProfile` and the stats are
  absent.
- **Partial pagination:** a failed page returns the edges fetched so far, so
  counts can be silently low.

## Debugging

Start with `bash scripts/agent/smoke.sh [username]`. For a raw response:

```bash
curl -s -X POST https://profile.api.trailhead.com/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query($slug:String){profile(slug:$slug){__typename ... on PublicProfile{trailheadStats{earnedPointsSum earnedBadgesCount rank{title}}}}}","variables":{"slug":"nabondance"}}'
```
