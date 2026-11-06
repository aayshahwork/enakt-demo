/**
 * The storyboard as typed data. Five fixed-timing sequences: the map tour (beat 2), the ask (beat 3),
 * the questions and scope (beat 4), the build checklist (beat 5) and the Juniper run (beat 8).
 * `player.ts` plays each one into the store. Pure data in, pure data out: two takes are identical.
 */

import { BUILD_STEPS, CONFIRMATIONS, FRESH_OUTPUT, HERO_REQUEST, QUESTIONS, RUN_TRACE, TOUR, TRAINED_OUTPUT, type SourceId } from "./fixtures"

export type SeqName = "tour" | "ask" | "scope" | "build" | "run"

export type TimelineEvent =
  | { t: number; type: "tour"; step: number }
  | { t: number; type: "ask:typed"; shown: number }
  | { t: number; type: "ask:status"; status: "working" | "done" }
  | { t: number; type: "qa:add"; id: string }
  | { t: number; type: "qa:chips"; id: string }
  | { t: number; type: "qa:pick"; id: string }
  | { t: number; type: "scope:light"; id: SourceId }
  | { t: number; type: "scope:exclude"; id: SourceId }
  | { t: number; type: "confirm"; id: string; status: "pending" | "done" }
  | { t: number; type: "build:step"; n: number }
  | { t: number; type: "run:step"; n: number }
  | { t: number; type: "run:pulse" }
  | { t: number; type: "out:block"; side: "fresh" | "trained"; id: string }
  | { t: number; type: "out:progress"; side: "fresh" | "trained"; id: string; shown: number }
  | { t: number; type: "compare" }
  | { t: number; type: "seq:done"; seq: SeqName }

export const TIMING = {
  tourStep: 2600,
  askCps: 34,
  qaQuestion: 650,
  qaChips: 850,
  qaAfterPick: 320,
  qaLightStagger: 170,
  qaBetween: 520,
  confirmDelay: 2300,
  buildStep: 1450,
  runStep: 700,
  runBlocked: 1200,
  outCps: 150,
  outBetween: 160,
  compareDelay: 1300,
}

export function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? []
}

function stream(out: TimelineEvent[], make: (shown: number) => TimelineEvent, text: string, t: number, cps: number): number {
  let shown = 0
  for (const tok of tokenize(text)) {
    shown += tok.length
    t += (tok.length / cps) * 1000 + (/[.,;:!?]\s*$/.test(tok) ? 60 : 0)
    out.push({ ...make(shown), t })
  }
  return t
}

export function buildTourTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 500
  TOUR.forEach((_, i) => {
    out.push({ t, type: "tour", step: i })
    t += TIMING.tourStep
  })
  out.push({ t, type: "tour", step: -1 })
  out.push({ t: t + 100, type: "seq:done", seq: "tour" })
  return out
}

export function buildAskTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 400
  t = stream(out, (shown) => ({ t: 0, type: "ask:typed", shown }), HERO_REQUEST.text, t, TIMING.askCps)
  t += 500
  out.push({ t, type: "ask:status", status: "working" })
  t += 2300
  out.push({ t, type: "ask:status", status: "done" })
  out.push({ t: t + 100, type: "seq:done", seq: "ask" })
  return out
}

export function buildScopeTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 300
  const confirmAt: Record<string, number> = {}
  for (const q of QUESTIONS) {
    out.push({ t, type: "qa:add", id: q.id })
    t += TIMING.qaQuestion
    out.push({ t, type: "qa:chips", id: q.id })
    t += TIMING.qaChips
    out.push({ t, type: "qa:pick", id: q.id })
    if (q.confirms) {
      out.push({ t: t + 120, type: "confirm", id: q.confirms, status: "pending" })
      confirmAt[q.confirms] = t + TIMING.confirmDelay
    }
    t += TIMING.qaAfterPick
    for (const id of q.lights) {
      out.push({ t, type: "scope:light", id })
      t += TIMING.qaLightStagger
    }
    for (const id of q.excludes) {
      out.push({ t, type: "scope:exclude", id })
      t += TIMING.qaLightStagger
    }
    t += TIMING.qaBetween
  }
  for (const c of CONFIRMATIONS) {
    const at = Math.min(confirmAt[c.id] ?? t, t - 200)
    out.push({ t: at, type: "confirm", id: c.id, status: "done" })
  }
  out.push({ t: t + 300, type: "seq:done", seq: "scope" })
  return out
}

export function buildBuildTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 400
  for (const s of BUILD_STEPS) {
    out.push({ t, type: "build:step", n: s.n })
    t += TIMING.buildStep
  }
  out.push({ t: t - TIMING.buildStep + 500, type: "seq:done", seq: "build" })
  return out
}

export function buildRunTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 300
  for (const s of RUN_TRACE) {
    out.push({ t, type: "run:step", n: s.n })
    if (s.kind === "blocked") {
      t += TIMING.runBlocked
      out.push({ t, type: "run:pulse" })
      t += 500
    } else t += TIMING.runStep
  }
  t += 200
  for (const b of FRESH_OUTPUT) {
    out.push({ t, type: "out:block", side: "fresh", id: b.id })
    t += 60
    t = stream(out, (shown) => ({ t: 0, type: "out:progress", side: "fresh", id: b.id, shown }), b.text, t, TIMING.outCps)
    t += TIMING.outBetween
  }
  t += TIMING.compareDelay
  out.push({ t, type: "compare" })
  t += 500
  for (const b of TRAINED_OUTPUT) {
    out.push({ t, type: "out:block", side: "trained", id: b.id })
    t += 60
    t = stream(out, (shown) => ({ t: 0, type: "out:progress", side: "trained", id: b.id, shown }), b.text, t, TIMING.outCps)
    t += TIMING.outBetween
  }
  out.push({ t: t + 200, type: "seq:done", seq: "run" })
  return out
}

export const TIMELINES: Record<SeqName, () => TimelineEvent[]> = {
  tour: buildTourTimeline,
  ask: buildAskTimeline,
  scope: buildScopeTimeline,
  build: buildBuildTimeline,
  run: buildRunTimeline,
}
