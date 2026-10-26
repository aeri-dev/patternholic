import type { VercelRequest, VercelResponse } from '@vercel/node'
export default async (req: VercelRequest, res: VercelResponse) => {
  const q = (req.query.q as string) || ''
  const id = process.env.OSU_CLIENT_ID, sec = process.env.OSU_CLIENT_SECRET
  if (!id || !sec) return res.status(500).json({ error: 'osu! API not configured' })
  // token
  const tr = await fetch('https://osu.ppy.sh/oauth/token', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({client_id:id, client_secret:sec, grant_type:'client_credentials', scope:'public'}) })
  const td = await tr.json()
  const r = await fetch('https://osu.ppy.sh/api/v2/beatmapsets/search?q='+encodeURIComponent(q)+'&m=0', { headers:{Authorization:'Bearer '+td.access_token} })
  res.json(await r.json())
}
