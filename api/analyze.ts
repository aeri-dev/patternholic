import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseOsu } from '../src/lib/osuParser'
import { analyzeBeatmap } from '../src/lib/analysis'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const { content } = req.body || {}
  if (!content) return res.status(400).json({ error: 'missing content' })
  const map = parseOsu(String(content))
  const result = analyzeBeatmap(map)
  res.json({ ...result, metadata: map.metadata, mode: map.mode })
}
