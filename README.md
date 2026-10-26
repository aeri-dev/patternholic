# Patternholic

Vue 3 + Vite frontend, Cloudflare Worker + D1 backend. osu! beatmap search and pattern analysis.

## Run locally (Windows)
```
npm install
npm run dev
```
Worker dev: `npx wrangler dev`

## Configure
Copy `.env.example` values into Cloudflare secrets:
```
npx wrangler secret put OSU_CLIENT_ID
npx wrangler secret put OSU_CLIENT_SECRET
```

## Database
```
npx wrangler d1 create patternholic-db
npx wrangler d1 execute patternholic-db --local --file=migrations/0001_init.sql
```

## Tests
```
npm test
npm run build
```

## Deploy
```
npm run build
npx wrangler deploy
```
Free domain: `patternholic.<account>.workers.dev`
