import { describe, it, expect } from 'vitest'
import { parseOsu } from '../src/lib/osuParser'

describe('parser', () => {
  it('parses basic', () => {
    const text = `osu file format v14\n[General]\nMode: 0\n[Metadata]\nTitle:Test\n[Difficulty]\nCircleSize:4\n[HitObjects]\n100,100,0,1,0,0:0:0:0:\n200,200,100,1,0,0:0:0:0:`
    const m = parseOsu(text)
    expect(m.hitObjects.length).toBe(2)
    expect(m.metadata.Title).toBe('Test')
  })
})
