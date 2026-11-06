/**
 * The demo script as typed data: the request scan, the scope plan, three clarifications, the agent run.
 * `buildRequestTimeline()` and `buildRunTimeline()` turn it into a flat list of timed events
 * that `player.ts` plays and the store applies. Pure data in, pure data out: every take is identical.
 */

import { BRIEF, SCAN, TRACE, type LaneId, type PlanColumn, type SourceId, type Verdict } from "./fixtures"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChipKind = "source" | "cleanup" | "policy" | "question"
/** Chip tone follows the status-pill token set: green / yellow / red / purple policy. */
export type Chip = { id: string; kind: ChipKind; label: string; ref?: string }

export type TranscriptEntry = {
  id: string
  beat: number
  kind: "question" | "answer"
  /** "enakt" for questions, a person id for answers. */
  speaker: string
  text: string
  shown: number
  done: boolean
  chips: Chip[]
}

export type CanvasEvent =
  | { type: "lane:add"; id: LaneId }
  | { type: "source:add"; id: SourceId; verdict?: Verdict }
  | { type: "placeholder:add"; id: SourceId; label: string; hint: string }
  | { type: "placeholder:resolve"; id: SourceId; verdict: Verdict }
  | { type: "verdict:set"; id: SourceId; verdict: Verdict }
  | { type: "edge:add"; id: string }
  | { type: "policy:add"; id: string }
  | { type: "agent:add"; id: string }

export type PersonStatus = "waiting" | "asking" | "answered"

export type TimelineEvent =
  | { t: number; type: "scan"; status: "running" | "done" }
  | { t: number; type: "scan:progress"; systems: number; files: number }
  | { t: number; type: "plan:add"; column: PlanColumn; id: string }
  | { t: number; type: "person"; id: string; status: PersonStatus }
  | { t: number; type: "entry:add"; entry: TranscriptEntry }
  | { t: number; type: "entry:progress"; id: string; shown: number }
  | { t: number; type: "entry:done"; id: string }
  | { t: number; type: "chip:add"; entryId: string; chip: Chip }
  | { t: number; type: "canvas"; event: CanvasEvent }
  | { t: number; type: "question:add"; id: string }
  | { t: number; type: "progress"; value: number }
  | { t: number; type: "request:done" }
  // agent run
  | { t: number; type: "trace:step"; n: number }
  | { t: number; type: "trace:pulse"; n: number }
  | { t: number; type: "brief:block"; id: string }
  | { t: number; type: "brief:progress"; id: string; shown: number }
  | { t: number; type: "run:done" }

// ---------------------------------------------------------------------------
// Clarification beats
// ---------------------------------------------------------------------------

export type Beat = {
  n: number
  person: string
  question: string
  answer: string
  chips: Chip[]
  /** Fired after the chips, in order, with a short stagger. */
  events: TimelineEvent[]
}

const c = (kind: ChipKind, label: string, ref?: string): Chip => ({ id: `${kind}:${ref ?? label}`, kind, label, ref })
const cv = (event: CanvasEvent): TimelineEvent => ({ t: 0, type: "canvas", event })

export const BEATS: Beat[] = [
  {
    n: 1,
    person: "nina",
    question: "Which Atlas model is current?",
    answer: "v7. v6 is dead but the memo draft still links it.",
    chips: [c("source", "Atlas_Model_v7", "atlas-model-v7"), c("cleanup", "retire v6 link", "atlas-model-v6")],
    events: [
      cv({ type: "placeholder:resolve", id: "atlas-model-v7", verdict: "ready" }),
      cv({ type: "edge:add", id: "atlas-memo-agent>atlas-model-v7" }),
      cv({ type: "source:add", id: "atlas-model-v6", verdict: "attention" }),
      cv({ type: "edge:add", id: "atlas-model-v6>atlas-model-v7" }),
    ],
  },
  {
    n: 2,
    person: "tom",
    question: "Can Atlas materials be used for anything outside Atlas?",
    answer: "No. The seller NDA limits use to evaluating the deal. Same for Birch on their side.",
    chips: [c("policy", "deal data used only within its deal", "deal-data-within-deal"), c("policy", "Birch NDA", "birch-nda")],
    events: [cv({ type: "policy:add", id: "deal-data-within-deal" }), cv({ type: "policy:add", id: "birch-nda" })],
  },
  {
    n: 3,
    person: "nina",
    question: "Which revenue figure should the memo lead with?",
    answer: "Monthly P&L, but flag the CIM number, they don't tie yet.",
    chips: [c("question", "TTM revenue conflict", "ttm-revenue")],
    events: [cv({ type: "verdict:set", id: "atlas-dataroom", verdict: "conflict" }), { t: 0, type: "question:add", id: "ttm-revenue" }],
  },
]

export const REQUEST_BANNER = "Scope plan ready · 4 sources · 2 people asked · 2 policies · 1 open question · 0 rows read"

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

export const TIMING = {
  /** Characters per second for streamed answers. */
  cps: 38,
  questionPause: 600,
  afterQuestion: 450,
  chipStagger: 230,
  eventStagger: 140,
  betweenBeats: 500,
  planStagger: 240,
  scanTicks: 14,
  scanTick: 130,
  tracePause: 520,
  traceBlockedPause: 1100,
  briefCps: 120,
}

/** Split text into display tokens: words with trailing whitespace kept attached. */
export function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? []
}

/** Emit progress events for `text` starting at time `t`, at `cps` chars/sec. Returns the end time. */
function streamEvents(out: TimelineEvent[], id: string, text: string, t: number, cps: number, type: "entry:progress" | "brief:progress"): number {
  let shown = 0
  for (const tok of tokenize(text)) {
    shown += tok.length
    t += (tok.length / cps) * 1000 + (/[.,;:!?]\s*$/.test(tok) ? 70 : 0)
    out.push({ t, type, id, shown } as TimelineEvent)
  }
  return t
}

// ---------------------------------------------------------------------------
// Request timeline: scan → scope plan → clarifications → scan complete
// ---------------------------------------------------------------------------

export function buildRequestTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 0
  const push = (e: TimelineEvent, at = t) => out.push({ ...e, t: at })

  // Scan starts; the counters climb while the lanes and the first nodes land.
  push({ t, type: "scan", status: "running" })
  for (let i = 1; i <= TIMING.scanTicks; i++) {
    const f = i / TIMING.scanTicks
    const eased = 1 - Math.pow(1 - f, 2)
    push({ t: t + i * TIMING.scanTick, type: "scan:progress", systems: Math.min(SCAN.systems, Math.ceil(f * SCAN.systems)), files: Math.round(eased * SCAN.files) })
  }
  t += 240
  push({ t, type: "canvas", event: { type: "lane:add", id: "atlas" } })
  t += 160
  push({ t, type: "canvas", event: { type: "lane:add", id: "firmwide" } })
  t += 160
  push({ t, type: "canvas", event: { type: "agent:add", id: "atlas-memo-agent" } })
  t += 320

  // Needs
  push({ t, type: "plan:add", column: "needs", id: "needs-dataroom" })
  push({ t, type: "canvas", event: { type: "source:add", id: "atlas-dataroom", verdict: "ready" } }, t + 80)
  push({ t, type: "canvas", event: { type: "edge:add", id: "atlas-memo-agent>atlas-dataroom" } }, t + 200)
  t += TIMING.planStagger
  push({ t, type: "plan:add", column: "needs", id: "needs-model" })
  push({ t, type: "canvas", event: { type: "placeholder:add", id: "atlas-model-v7", label: "Atlas model · which version?", hint: "Ask Nina Alvarez" } }, t + 80)
  t += TIMING.planStagger
  push({ t, type: "plan:add", column: "needs", id: "needs-record" })
  push({ t, type: "canvas", event: { type: "source:add", id: "deal-records", verdict: "ready" } }, t + 80)
  push({ t, type: "canvas", event: { type: "edge:add", id: "atlas-memo-agent>deal-records" } }, t + 200)
  t += TIMING.planStagger
  push({ t, type: "plan:add", column: "needs", id: "needs-template" })
  push({ t, type: "canvas", event: { type: "source:add", id: "ic-template", verdict: "ready" } }, t + 80)
  push({ t, type: "canvas", event: { type: "edge:add", id: "atlas-memo-agent>ic-template" } }, t + 200)
  t += TIMING.planStagger + 120

  // Ask
  push({ t, type: "plan:add", column: "ask", id: "ask-tom" })
  push({ t, type: "person", id: "tom", status: "waiting" })
  t += TIMING.planStagger
  push({ t, type: "plan:add", column: "ask", id: "ask-nina" })
  push({ t, type: "person", id: "nina", status: "waiting" })
  t += TIMING.planStagger + 120

  // Never touches
  push({ t, type: "plan:add", column: "never", id: "never-deals" })
  push({ t, type: "canvas", event: { type: "lane:add", id: "birch" } }, t + 60)
  push({ t, type: "canvas", event: { type: "source:add", id: "birch-dataroom", verdict: "restricted" } }, t + 180)
  push({ t, type: "canvas", event: { type: "source:add", id: "birch-model", verdict: "restricted" } }, t + 300)
  t += TIMING.planStagger + 120
  push({ t, type: "plan:add", column: "never", id: "never-lp" })
  push({ t, type: "canvas", event: { type: "lane:add", id: "fundops" } }, t + 60)
  push({ t, type: "canvas", event: { type: "source:add", id: "lp-database", verdict: "restricted" } }, t + 180)
  t += TIMING.planStagger + 60
  push({ t, type: "plan:add", column: "never", id: "never-fee" })
  push({ t, type: "canvas", event: { type: "source:add", id: "fee-carry", verdict: "restricted" } }, t + 120)
  t += TIMING.planStagger + 500

  // Clarifications
  for (const b of BEATS) {
    const qid = `b${b.n}-q`
    const aid = `b${b.n}-a`
    push({ t, type: "person", id: b.person, status: "asking" })
    push({ t, type: "entry:add", entry: { id: qid, beat: b.n, kind: "question", speaker: "enakt", text: b.question, shown: b.question.length, done: true, chips: [] } })
    t += TIMING.questionPause
    push({ t, type: "entry:add", entry: { id: aid, beat: b.n, kind: "answer", speaker: b.person, text: b.answer, shown: 0, done: false, chips: [] } })
    t += TIMING.afterQuestion
    t = streamEvents(out, aid, b.answer, t, TIMING.cps, "entry:progress")
    t += 120
    push({ t, type: "entry:done", id: aid })
    push({ t, type: "person", id: b.person, status: "answered" })
    t += 240
    for (const chip of b.chips) {
      push({ t, type: "chip:add", entryId: aid, chip })
      t += TIMING.chipStagger
    }
    let et = t - b.chips.length * TIMING.chipStagger + 120
    for (const e of b.events) {
      push(e, et)
      et += TIMING.eventStagger
    }
    t = Math.max(t, et) + TIMING.betweenBeats
  }

  // Scan completes: the rest of the firm lands as scanned, out of scope.
  push({ t, type: "canvas", event: { type: "lane:add", id: "portfolio" } })
  t += 140
  push({ t, type: "canvas", event: { type: "source:add", id: "kpi-pack", verdict: "attention" } })
  t += 120
  push({ t, type: "canvas", event: { type: "source:add", id: "board-decks", verdict: "ready" } })
  t += 120
  push({ t, type: "canvas", event: { type: "source:add", id: "deal-email", verdict: "attention" } })
  t += 160
  push({ t, type: "canvas", event: { type: "agent:add", id: "connect-agent" } })
  t += 100
  push({ t, type: "canvas", event: { type: "agent:add", id: "portfolio-kpi-agent" } })
  push({ t, type: "canvas", event: { type: "edge:add", id: "portfolio-kpi-agent>kpi-pack" } }, t + 100)
  push({ t, type: "canvas", event: { type: "edge:add", id: "portfolio-kpi-agent>board-decks" } }, t + 180)
  t += 220
  push({ t, type: "canvas", event: { type: "agent:add", id: "lp-letter-agent" } })
  push({ t, type: "canvas", event: { type: "edge:add", id: "lp-letter-agent>lp-database" } }, t + 100)
  t += 320
  push({ t, type: "scan", status: "done" })
  push({ t, type: "progress", value: 22 })
  t += 350
  push({ t, type: "request:done" })
  return out
}

// ---------------------------------------------------------------------------
// Agent run timeline
// ---------------------------------------------------------------------------

export function buildRunTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 300
  for (const step of TRACE) {
    out.push({ t, type: "trace:step", n: step.n })
    if (step.kind === "blocked") {
      t += TIMING.traceBlockedPause
      out.push({ t, type: "trace:pulse", n: step.n })
      t += 500
    } else {
      t += TIMING.tracePause
    }
  }
  // The brief streams after step 8 lands.
  t += 200
  for (const block of BRIEF) {
    out.push({ t, type: "brief:block", id: block.id })
    t += 80
    t = streamEvents(out, block.id, block.text, t, TIMING.briefCps, "brief:progress")
    t += 180
  }
  out.push({ t: t + 100, type: "run:done" })
  return out
}
