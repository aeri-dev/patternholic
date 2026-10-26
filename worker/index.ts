/// <reference types="@cloudflare/workers-types" />
import { parseOsu } from '../src/lib/osuParser'
import { analyzeBeatmap, ALGORITHM_VERSION } from '../src/lib/analysis'

interface Env { DB: D1Database; ASSETS: Fetcher; OSU_CLIENT_ID?: string; OSU_CLIENT_SECRET?: string }

let cachedToken: { token: string; expires: number } | null = null
async function getToken(env: Env): Promise<string | null> {
  if (!env.OSU_CLIENT_ID || !env.OSU_CLIENT_SECRET) return null
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token
  const res = await fetch('https://osu.ppy.sh/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.OSU_CLIENT_ID, client_secret: env.OSU_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'public' })
  })
  if (!res.ok) return null
  const data: any = await res.json()
  cachedToken = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 }
  return cachedToken.token
}

async function osuFetch(env: Env, path: string): Promise<any> {
  const token = await getToken(env)
  if (!token) throw new Error('osu! API not configured')
  const res = await fetch('https://osu.ppy.sh/api/v2' + path, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`osu! API error ${res.status}`)
  return res.json()
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    try {
      if (path === '/api/health') return json({ ok: true })
      if (path === '/api/search') {
        const q = url.searchParams.get('q') || ''
        const data = await osuFetch(env, `/beatmapsets/search?q=${encodeURIComponent(q)}&m=0`)
        return json(data)
      }
      if (path.startsWith('/api/beatmapset/')) {
        const id = path.split('/')[3]
        const data = await osuFetch(env, `/beatmapsets/${id}`)
        return json(data)
      }
      if (path === '/api/analyze' && request.method === 'POST') {
        const body: any = await request.json()
        const text = String(body?.content || '')
        if (!text) return json({ error: 'missing content' }, 400)
        if (text.length > 5_000_000) return json({ error: 'file too large' }, 413)
        const map = parseOsu(text)
        const result = analyzeBeatmap(map)
        // store
        try {
          const beatmapId = parseInt(map.metadata['BeatmapID'] || '0', 10) || 0
          if (beatmapId) {
            await env.DB.prepare('INSERT OR IGNORE INTO beatmaps (id, beatmapset_id, version, mode) VALUES (?,?,?,?)')
              .bind(beatmapId, parseInt(map.metadata['BeatmapSetID'] || '0', 10) || null, map.metadata['Version'] || '', map.mode).run()
            await env.DB.prepare('INSERT INTO analyses (beatmap_id, algorithm_version, status, score, metrics_json, events_json, warnings_json) VALUES (?,?,?,?,?,?,?)')
              .bind(beatmapId, result.algorithmVersion, 'completed', result.score, JSON.stringify(result.metrics), JSON.stringify(result.events), JSON.stringify(result.warnings)).run()
          }
        } catch (e) { /* ignore db errors in dev */ }
        return json({ ...result, metadata: map.metadata, mode: map.mode })
      }
      if (path === '/api/rankings') {
        const rows = await env.DB.prepare('SELECT a.score, a.beatmap_id, a.algorithm_version, a.completed_at, b.version FROM analyses a LEFT JOIN beatmaps b ON a.beatmap_id=b.id WHERE a.status="completed" ORDER BY a.score DESC LIMIT 50').all()
        return json({ items: rows.results })
      }
      if (path === '/api/methodology') {
        return json({ algorithmVersion: ALGORITHM_VERSION })
      }
      // serve assets
      return env.ASSETS.fetch(request)
    } catch (err: any) {
      return json({ error: err?.message || 'error' }, 500)
    }
  }
}
