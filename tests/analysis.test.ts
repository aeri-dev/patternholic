import { describe, it, expect } from 'vitest'
import { parseOsu } from '../src/lib/osuParser'
import { analyzeBeatmap } from '../src/lib/analysis'

describe('analysis', () => {
  it('deterministic', () => {
    const text = `osu file format v14\n[General]\nMode: 0\n[HitObjects]\n100,100,0,1,0,0:0:0:0:\n200,200,100,1,0,0:0:0:0:\n300,300,200,1,0,0:0:0:0:\n`
    const m = parseOsu(text)
    const a = analyzeBeatmap(m)
    const b = analyzeBeatmap(m)
    expect(a.score).toBe(b.score)
    expect(a.score).toBeGreaterThanOrEqual(0)
    expect(a.score).toBeLessThanOrEqual(100)
  })
})
