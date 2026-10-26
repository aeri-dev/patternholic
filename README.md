# Patternholic

osu! beatmap search + pattern analysis (Pattern Abuse Score 0-100).

## Run locally (Windows)
```
npm install
npm run dev
```
Open http://localhost:5173

## Configure osu! API (for search)
1. Create app at https://osu.ppy.sh/home/account/edit#new-oauth-application
2. Copy Client ID and Client Secret.
3. Local: create `.env` with:
```
OSU_CLIENT_ID=your_id
OSU_CLIENT_SECRET=your_secret
```
4. Vercel: Project → Settings → Environment Variables → add both.

## Deploy to Vercel
```
npm install -g vercel
vercel login
cd C:\Users\ilyesmisser\Documents\patternholic
vercel
vercel --prod
```

## Tests
```
npm test
npm run build
```

## Notes
- Analysis runs in browser/server by pasting `.osu` file content.
- Rankings are in-memory on Vercel (not persistent). Use Cloudflare/D1 version for persistent DB.
- Client-side routes handled by SPA fallback in vercel.json.