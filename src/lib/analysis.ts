import type { HitObject, OsuBeatmap } from './osuParser'

export interface PatternEvent {
  type: string
  startIndex: number
  endIndex: number
  startTime: number
  endTime: number
  value: number
}

export interface AnalysisMetrics {
  jumpCount: number
  streamCount: number
  burstCount: number
  repetitionScore: number
  densityPeak: number
  timingIntensity: number
  irregularity: number
}

export interface AnalysisResult {
  algorithmVersion: string
  score: number
  metrics: AnalysisMetrics
  events: PatternEvent[]
  warnings: string[]
}

export const ALGORITHM_VERSION = '1.0.0'

function dist(a: HitObject, b: HitObject): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function analyzeBeatmap(map: OsuBeatmap): AnalysisResult {
  const warnings: string[] = []
  const events: PatternEvent[] = []
  const objs = map.hitObjects.slice().sort((a, b) => a.time - b.time)

  if (map.mode !== 0) warnings.push('Non-standard mode; analysis may not be meaningful.')
  if (objs.length === 0) {
    return { algorithmVersion: ALGORITHM_VERSION, score: 0, metrics: { jumpCount: 0, streamCount: 0, burstCount: 0, repetitionScore: 0, densityPeak: 0, timingIntensity: 0, irregularity: 0 }, events, warnings }
  }

  // Jumps: consecutive objects close in time but far in space
  let jumpCount = 0
  for (let i = 0; i < objs.length - 1; i++) {
    const dt = objs[i + 1].time - objs[i].time
    const d = dist(objs[i], objs[i + 1])
    if (dt > 0 && dt <= 150 && d >= 120) {
      jumpCount++
      events.push({ type: 'jump', startIndex: i, endIndex: i + 1, startTime: objs[i].time, endTime: objs[i + 1].time, value: d })
    }
  }

  // Streams: runs of objects with dt between 40 and 125ms
  let streamCount = 0
  let runStart = 0
  for (let i = 1; i <= objs.length; i++) {
    const prevDt = i > 1 ? objs[i - 1].time - objs[i - 2].time : 0
    if (i === 1 || (prevDt >= 40 && prevDt <= 125)) {
      // continue
    } else {
      const len = i - 1 - runStart
      if (len >= 5) {
        streamCount++
        events.push({ type: 'stream', startIndex: runStart, endIndex: i - 2, startTime: objs[runStart].time, endTime: objs[i - 2].time, value: len })
      }
      runStart = i - 1
    }
    if (i === objs.length) {
      const len = i - runStart
      if (len >= 5) {
        streamCount++
        events.push({ type: 'stream', startIndex: runStart, endIndex: i - 1, startTime: objs[runStart].time, endTime: objs[i - 1].time, value: len })
      }
    }
  }
  // silence unused

  // Bursts: short dense windows (>=4 objects within 300ms)
  let burstCount = 0
  for (let i = 0; i < objs.length; i++) {
    let j = i
    while (j + 1 < objs.length && objs[j + 1].time - objs[i].time <= 300) j++
    const cnt = j - i + 1
    if (cnt >= 4) {
      burstCount++
      events.push({ type: 'burst', startIndex: i, endIndex: j, startTime: objs[i].time, endTime: objs[j].time, value: cnt })
      i = j
    }
  }

  // Density peak: max objects in 1s window
  let densityPeak = 0
  let left = 0
  for (let right = 0; right < objs.length; right++) {
    while (objs[right].time - objs[left].time > 1000) left++
    densityPeak = Math.max(densityPeak, right - left + 1)
  }

  // Timing intensity: mean inverse interval (objects per second) normalized
  const intervals: number[] = []
  for (let i = 1; i < objs.length; i++) intervals.push(objs[i].time - objs[i - 1].time)
  const meanInterval = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 1000
  const timingIntensity = Math.min(100, 1000 / Math.max(meanInterval, 1))

  // Repetition: count repeated (dx,dy,dt) triples
  const sigs = new Map<string, number>()
  for (let i = 0; i < objs.length - 1; i++) {
    const key = `${Math.round(objs[i + 1].x - objs[i].x)},${Math.round(objs[i + 1].y - objs[i].y)},${Math.round(objs[i + 1].time - objs[i].time)}`
    sigs.set(key, (sigs.get(key) || 0) + 1)
  }
  let repeated = 0
  for (const v of sigs.values()) if (v > 1) repeated += v - 1
  const repetitionScore = Math.min(100, (repeated / Math.max(objs.length, 1)) * 100)

  // Irregularity: std dev of intervals normalized
  const mean = meanInterval
  const variance = intervals.length ? intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length : 0
  const std = Math.sqrt(variance)
  const irregularity = Math.min(100, (std / Math.max(mean, 1)) * 100)

  const metrics: AnalysisMetrics = { jumpCount, streamCount, burstCount, repetitionScore, densityPeak, timingIntensity, irregularity }

  // Score: weighted heuristic, normalized
  const normJumps = Math.min(1, jumpCount / Math.max(objs.length * 0.1, 1))
  const normStreams = Math.min(1, streamCount / 5)
  const normBursts = Math.min(1, burstCount / 5)
  const normDensity = Math.min(1, densityPeak / 20)
  const normRep = repetitionScore / 100
  const normTiming = timingIntensity / 100
  const normIrr = irregularity / 100

  const score = Math.round(
    (normJumps * 18 + normStreams * 18 + normBursts * 14 + normDensity * 14 + normRep * 12 + normTiming * 12 + normIrr * 12) * 100
  ) / 100
  const clamped = Math.max(0, Math.min(100, score))

  return { algorithmVersion: ALGORITHM_VERSION, score: clamped, metrics, events, warnings }
}
