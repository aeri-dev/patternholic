# Patternholic

Patternholic is a Vue app for discovering ranked osu!standard beatmaps, with a workspace for future pattern analysis.

## Run locally

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and fill in `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET`.
3. Start `npm run dev` and open the URL printed by Vite.

The local API now runs inside Vite. A separate server on port 8787 is **not** required. `npm run preview` also includes the local API after a production build. Restart Vite after changing credentials.

### Connect the official osu! API

Register an OAuth application in [osu! account settings](https://osu.ppy.sh/home/account/edit#oauth). The client credentials flow uses a Client ID and Client Secret; its callback URL may be left blank. See the [official authentication documentation](https://osu.ppy.sh/docs/#authentication).

```dotenv
OSU_CLIENT_ID=your_client_id
OSU_CLIENT_SECRET=your_client_secret
```

Keep these in `.env.local` locally, or in your hosting provider's server environment variables. Do not prefix them with `VITE_`: that prefix exposes variables to the browser. Local environment files are ignored by Git. No credentials or fake beatmap data are bundled into the frontend.

Without valid credentials, the app displays an explicit connection notice. Live results cannot be obtained from the authenticated osu! API until the connection is configured.

## Beatmap library

- Searches the official osu! API v2 with `m=0` and `s=ranked` and filters the returned sets and difficulties again. Only native osu!standard difficulties with `status=ranked` are displayed; loved, approved, qualified, unranked, other modes, and converts are excluded.
- Supports relevance, ranking date, plays, favourites, difficulty sorting, and cursor pagination.
- Shows osu! cover images, duration, BPM, star ratings, difficulty links, and an image fallback.
- Plays a single audio preview at a time; playback stops on navigation. Failed previews stay local to their controls.
- Links to the official map page and download route. Downloads may require an osu! login and respect osu!'s `download_disabled` flag.
- Opens an internal map page with selectable difficulties, real metadata, and clearly labelled, uncalculated pattern placeholders.

### Community tags

The app uses each difficulty's `top_tag_ids` joined to the set's `related_tags` from the official detail endpoint. It never uses the mapper's `tags` string. Only votes attached to the displayed ranked standard difficulties are used, with a minimum of five votes per difficulty, matching [osu!'s public tag display rule](https://osu.ppy.sh/wiki/en/Beatmap/Beatmap_tags).

Search responses do not include these tag details, so visible cards fetch them separately. Requests are limited to three at a time and cached; a tag failure does not fail search. Cards show the union of their standard difficulties' tags. The detail page shows votes for the selected difficulty. Missing data and an empty tag list have separate states.

## Deployment

For Vercel, set both `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET` for the appropriate project environments, then redeploy. The canonical detail endpoint is `/api/beatmap?id=123`; `/api/beatmapset/123` is retained as an alias. The duplicate `.js` serverless handlers have been removed to avoid conflicts with `.ts` handlers.

For Cloudflare, configure the existing D1/asset bindings and add both credentials with `wrangler secret put`. The Worker uses the same search/detail adapter as Vercel and local Vite.

Server code lives in `server/osu.ts` (authentication, filtering, normalization, caching) and `server/beatmap-api.ts` (HTTP handling). Tokens remain server-side, are reused until expiry, and are refreshed once after an authentication failure. Upstream failures return bounded, structured responses.

## Pattern analysis integration

`src/views/BeatmapDetail.vue` deliberately shows placeholders while the owner finishes the analyzer. The selected difficulty's official ID is available as `selected.id`. Replace the `pattern-workspace` placeholder with the future analysis response; do not interpret an uncalculated score as zero. The existing prototype parser and analysis code are retained in `src/lib/`, along with the existing analysis endpoints and result route.

## Checks

```sh
npm run build
npm test
```

The API regression tests cover filtering, community-tag provenance, missing/invalid credentials, token refresh, pagination, duplicate detail requests, invalid routes, and upstream failures using mocked osu! responses. Live API verification additionally requires configured credentials.

## Tech stack
- Frontend: Vue 3, TypeScript, Vite
- Backend: shared TypeScript osu! adapter for local Vite, Vercel functions, and Cloudflare Workers
- Database: Cloudflare D1 for the existing prototype analysis storage; the Vercel rankings endpoint currently returns an empty list

## Styles

Shared design tokens and controls are in `src/styles/`. `beatmaps.css` contains the library cards and detail workspace, using the site's charcoal and mint theme.
