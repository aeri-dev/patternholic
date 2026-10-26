export interface TimingPoint {
  time: number
  beatLength: number
  meter: number
  sampleSet: number
  sampleIndex: number
  volume: number
  uninherited: boolean
  kiai: boolean
}

export interface HitObject {
  x: number
  y: number
  time: number
  type: number
  hitSound: number
  params: string[]
}

export interface OsuBeatmap {
  formatVersion: number
  general: Record<string, string>
  metadata: Record<string, string>
  difficulty: Record<string, string>
  timingPoints: TimingPoint[]
  hitObjects: HitObject[]
  mode: number
}

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

export function parseOsu(text: string): OsuBeatmap {
  const lines = stripBom(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  let section = ''
  const general: Record<string, string> = {}
  const metadata: Record<string, string> = {}
  const difficulty: Record<string, string> = {}
  const timingPoints: TimingPoint[] = []
  const hitObjects: HitObject[] = []
  let formatVersion = 0

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('//')) continue
    const m = line.match(/^osu file format v(\d+)$/i)
    if (m) { formatVersion = parseInt(m[1], 10); continue }
    if (line.startsWith('[') && line.endsWith(']')) { section = line.slice(1, -1).toLowerCase(); continue }
    if (section === 'general' || section === 'metadata' || section === 'difficulty') {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (section === 'general') general[key] = val
      else if (section === 'metadata') metadata[key] = val
      else difficulty[key] = val
      continue
    }
    if (section === 'timingpoints') {
      const parts = line.split(',')
      const tp: TimingPoint = {
        time: parseFloat(parts[0]) || 0,
        beatLength: parseFloat(parts[1]) || 0,
        meter: parseInt(parts[2], 10) || 4,
        sampleSet: parseInt(parts[3], 10) || 1,
        sampleIndex: parseInt(parts[4], 10) || 1,
        volume: parseInt(parts[5], 10) || 100,
        uninherited: parts[6] === '1',
        kiai: parts[7] === '1'
      }
      timingPoints.push(tp)
      continue
    }
    if (section === 'hitobjects') {
      const parts = line.split(',')
      if (parts.length < 4) continue
      const ho: HitObject = {
        x: parseFloat(parts[0]) || 0,
        y: parseFloat(parts[1]) || 0,
        time: parseFloat(parts[2]) || 0,
        type: parseInt(parts[3], 10) || 0,
        hitSound: parseInt(parts[4], 10) || 0,
        params: parts.slice(5)
      }
      hitObjects.push(ho)
      continue
    }
  }

  const mode = parseInt(general['Mode'] || '0', 10)
  return { formatVersion, general, metadata, difficulty, timingPoints, hitObjects, mode }
}
