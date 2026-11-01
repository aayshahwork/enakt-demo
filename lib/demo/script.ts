/**
 * The demo script as typed data: the interview beats, the readiness pass, the agent run.
 * `buildIntakeTimeline()` and `buildRunTimeline()` turn it into a flat list of timed events
 * that `player.ts` plays and the store applies. Pure data in, pure data out: every take is identical.
 */

import { BRAIN, BRIEF, IN_BRAIN_BEFORE, SOURCES, TRACE, type SourceId, type Verdict } from "./fixtures"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChipKind = "source" | "workflow" | "policy" | "task" | "question"
export type Chip = { id: string; kind: ChipKind; label: string; ref?: string }

export type TranscriptEntry = {
  id: string
  beat: number
  kind: "question" | "answer" | "system"
  /** Who is speaking: "enakt" for questions and system lines, a person id for answers. */
  speaker: string
  /** Who actually typed the answer. */
  via?: "self" | "assistant" | "none"
  text: string
  shown: number
  done: boolean
  chips: Chip[]
  tone?: "error" | "progress"
}

export type CanvasEvent =
  | { type: "brain:show" }
  | { type: "source:add"; id: SourceId; verdict?: Verdict; noOwner?: boolean }
  | { type: "placeholder:add"; id: SourceId; label: string; hint: string }
  | { type: "placeholder:resolve"; id: SourceId }
  | { type: "edge:add"; id: string }
  | { type: "policy:add"; id: string }
  | { type: "verdict:set"; id: SourceId; verdict: Verdict }
  | { type: "brain:fill"; merged: number }

export type IntervieweeStatus = "scheduled" | "interviewing" | "done" | "noresponse"

export type TimelineEvent =
  | { t: number; type: "interviewee"; id: string; status: IntervieweeStatus }
  | { t: number; type: "entry:add"; entry: TranscriptEntry }
  | { t: number; type: "entry:progress"; id: string; shown: number }
  | { t: number; type: "entry:done"; id: string }
  | { t: number; type: "chip:add"; entryId: string; chip: Chip }
  | { t: number; type: "canvas"; event: CanvasEvent }
  | { t: number; type: "workflow:add"; id: string }
  | { t: number; type: "question:add"; id: string }
  | { t: number; type: "question:resolve"; id: string }
  | { t: number; type: "person:add"; id: string }
  | { t: number; type: "readiness"; status: "running" | "done" }
  | { t: number; type: "progress"; value: number }
  | { t: number; type: "intake:done" }
  // agent run
  | { t: number; type: "trace:step"; n: number }
  | { t: number; type: "trace:pulse"; n: number }
  | { t: number; type: "brief:block"; id: string }
  | { t: number; type: "brief:progress"; id: string; shown: number }
  | { t: number; type: "run:done" }

// ---------------------------------------------------------------------------
// Interview beats
// ---------------------------------------------------------------------------

export type Beat = {
  n: number
  person: string
  via: "self" | "assistant" | "none"
  question: string
  answer: string
  answerTone?: "error"
  chips: Chip[]
  /** Fired after the chips, in order, with a short stagger. */
  events: TimelineEvent[]
}

const c = (kind: ChipKind, label: string, ref?: string): Chip => ({ id: `${kind}:${ref ?? label}`, kind, label, ref })
const cv = (event: CanvasEvent): TimelineEvent => ({ t: 0, type: "canvas", event })

export const BEATS: Beat[] = [
  {
    n: 1,
    person: "dana",
    via: "self",
    question: "Where do client records live today, and who keeps them current?",
    answer: "Salesforce is our main client record. I own it. New clients start in a SharePoint onboarding list, and scanned documents sit on the file share.",
    chips: [c("source", "Salesforce CRM", "salesforce-crm"), c("source", "Onboarding (SharePoint)", "onboarding"), c("source", "Client documents (file share)", "client-docs"), c("workflow", "Client onboarding", "onboarding")],
    events: [
      cv({ type: "source:add", id: "salesforce-crm" }),
      cv({ type: "source:add", id: "onboarding" }),
      cv({ type: "source:add", id: "client-docs" }),
      cv({ type: "edge:add", id: "onboarding>salesforce-crm" }),
      { t: 0, type: "workflow:add", id: "onboarding" },
    ],
  },
  {
    n: 2,
    person: "dana",
    via: "self",
    question: "You said Salesforce is the main record. Does anyone keep client information outside it?",
    answer: "Advisors do. Marcus has his own tracker. You should ask him.",
    chips: [c("question", "Marcus's tracker → routed to Marcus Lee", "marcus-tracker")],
    events: [{ t: 0, type: "question:add", id: "marcus-tracker" }, cv({ type: "placeholder:add", id: "client-tracker", label: "Unknown advisor tracker", hint: "Ask Marcus Lee" })],
  },
  {
    n: 3,
    person: "marcus",
    via: "assistant",
    question: "What do you do before a client review, and what should your assistant never see?",
    answer:
      "I pull the CRM, my own tracker, and their documents. My tracker is Client_Tracker_FINAL_v3, plus an old prospects sheet. My assistant should only ever see my own households, never another advisor's clients.",
    chips: [c("source", "Client_Tracker_FINAL_v3", "client-tracker"), c("source", "Prospects_2025.xlsx", "prospects"), c("workflow", "Client review prep", "review-prep"), c("policy", "Advisor assistants see only their advisor's households", "advisor-scope")],
    events: [
      cv({ type: "placeholder:resolve", id: "client-tracker" }),
      { t: 0, type: "question:resolve", id: "marcus-tracker" },
      cv({ type: "source:add", id: "prospects" }),
      cv({ type: "edge:add", id: "salesforce-crm>client-tracker" }),
      { t: 0, type: "workflow:add", id: "review-prep" },
      cv({ type: "policy:add", id: "advisor-scope" }),
    ],
  },
  {
    n: 4,
    person: "priya",
    via: "self",
    question: "Where do AUM numbers come from, and how often do they change?",
    answer: "The custodian sends a nightly export. I roll it up monthly in AUM_Rollup on the shared drive, and billing runs off that.",
    chips: [c("source", "Custodian feed", "custodian-feed"), c("source", "AUM_Rollup.xlsx", "aum-rollup"), c("source", "Billing (SQL Server)", "billing"), c("workflow", "Monthly AUM rollup", "aum-rollup"), c("workflow", "Billing run", "billing-run")],
    events: [
      cv({ type: "source:add", id: "custodian-feed" }),
      cv({ type: "source:add", id: "aum-rollup" }),
      cv({ type: "source:add", id: "billing" }),
      cv({ type: "edge:add", id: "custodian-feed>aum-rollup" }),
      cv({ type: "edge:add", id: "aum-rollup>billing" }),
      { t: 0, type: "workflow:add", id: "aum-rollup" },
      { t: 0, type: "workflow:add", id: "billing-run" },
    ],
  },
  {
    n: 5,
    person: "sam",
    via: "self",
    question: "Which data is regulated, and who is allowed to touch it?",
    answer: "KYC records in Oracle and our compliance log in Postgres. Only compliance reads KYC, people or agents.",
    chips: [c("source", "KYC records", "kyc"), c("source", "Compliance log", "compliance-log"), c("policy", "Only compliance reads KYC records", "kyc-compliance")],
    events: [cv({ type: "source:add", id: "kyc" }), cv({ type: "source:add", id: "compliance-log" }), cv({ type: "policy:add", id: "kyc-compliance" })],
  },
  {
    n: 6,
    person: "chris",
    via: "self",
    question: "Is there anything only leadership should see?",
    answer: "Advisor compensation. It's in a restricted spreadsheet and no AI goes near it.",
    chips: [c("source", "Advisor_Comp.xlsx", "advisor-comp"), c("policy", "Advisor compensation is leadership only, no agents", "comp-leadership")],
    events: [cv({ type: "source:add", id: "advisor-comp", verdict: "restricted" }), cv({ type: "policy:add", id: "comp-leadership" })],
  },
  {
    n: 7,
    person: "planning",
    via: "none",
    question: "How are planning cases tracked and updated?",
    answer: "No response after 2 reminders. Logged as an open question for Chris Hale.",
    answerTone: "error",
    chips: [c("source", "Planning cases (Access database)", "planning-cases"), c("question", "Needs an owner", "planning-owner")],
    events: [cv({ type: "source:add", id: "planning-cases", verdict: "unverified", noOwner: true }), { t: 0, type: "question:add", id: "planning-owner" }],
  },
]

export const READINESS_LINE = "Checking freshness and consistency from metadata and row counts…"

/** Verdict cascade order for the readiness pass (beat 8). */
export const READINESS_ORDER: SourceId[] = ["custodian-feed", "compliance-log", "onboarding", "billing", "client-docs", "kyc", "salesforce-crm", "aum-rollup", "client-tracker", "prospects", "planning-cases", "advisor-comp"]

export const INTAKE_BANNER = "Intake complete · 12 sources · 6 people · 4 workflows · 3 policies · 1 open question · 0 rows read"

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

export const TIMING = {
  /** Characters per second for streamed answers. */
  cps: 35,
  questionPause: 650,
  afterQuestion: 500,
  chipStagger: 230,
  eventStagger: 140,
  betweenBeats: 550,
  readinessShimmer: 2000,
  cascade: 120,
  tracePause: 520,
  traceBlockedPause: 1100,
  briefCps: 110,
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
// Intake timeline
// ---------------------------------------------------------------------------

export function buildIntakeTimeline(): TimelineEvent[] {
  const out: TimelineEvent[] = []
  let t = 0
  const push = (e: TimelineEvent, at = t) => out.push({ ...e, t: at })

  push({ t, type: "canvas", event: { type: "brain:show" } })
  t += 400

  for (const b of BEATS) {
    const qid = `b${b.n}-q`
    const aid = `b${b.n}-a`
    push({ t, type: "interviewee", id: b.person, status: "interviewing" })
    push({ t, type: "entry:add", entry: { id: qid, beat: b.n, kind: "question", speaker: "enakt", text: b.question, shown: b.question.length, done: true, chips: [] } })
    t += TIMING.questionPause
    if (b.via === "none") {
      t += 900
      push({ t, type: "entry:add", entry: { id: aid, beat: b.n, kind: "system", speaker: "enakt", via: "none", text: b.answer, shown: b.answer.length, done: true, chips: [], tone: "error" } })
      push({ t, type: "interviewee", id: b.person, status: "noresponse" })
      t += 500
    } else {
      push({ t, type: "entry:add", entry: { id: aid, beat: b.n, kind: "answer", speaker: b.person, via: b.via, text: b.answer, shown: 0, done: false, chips: [] } })
      t += TIMING.afterQuestion
      t = streamEvents(out, aid, b.answer, t, TIMING.cps, "entry:progress")
      t += 120
      push({ t, type: "entry:done", id: aid })
      push({ t, type: "interviewee", id: b.person, status: "done" })
    }
    push({ t, type: "person:add", id: b.person })
    t += 260
    // Chips land one by one; the matching canvas events fire alongside.
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

  // Beat 8: readiness pass.
  push({ t, type: "entry:add", entry: { id: "b8-s", beat: 8, kind: "system", speaker: "enakt", via: "none", text: READINESS_LINE, shown: READINESS_LINE.length, done: false, chips: [], tone: "progress" } })
  push({ t, type: "readiness", status: "running" })
  t += TIMING.readinessShimmer
  for (const id of READINESS_ORDER) {
    push({ t, type: "canvas", event: { type: "verdict:set", id, verdict: SOURCES.find((s) => s.id === id)!.verdict } })
    if (IN_BRAIN_BEFORE.includes(id)) push({ t, type: "canvas", event: { type: "edge:add", id: `${id}>brain` } })
    t += TIMING.cascade
  }
  t += 200
  push({ t, type: "canvas", event: { type: "brain:fill", merged: BRAIN.mergedBefore } })
  push({ t, type: "progress", value: BRAIN.before })
  push({ t, type: "entry:done", id: "b8-s" })
  push({ t, type: "readiness", status: "done" })
  t += 350
  push({ t, type: "intake:done" })
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
  // The brief streams after step 7 lands.
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
