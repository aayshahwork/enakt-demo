/**
 * One Zustand store for the whole demo. Every page reads from it, which keeps the map continuous
 * across routes. Persisted to sessionStorage so an accidental reload does not lose a take; the reset
 * key wipes it back to the start of beat 1.
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { toast } from "sonner"
import { ACTIVITY, DEPLOY, NOW, READINESS, ROLLOUT, SCOPE, type Activity, type Colour, type SourceId, type Stage } from "./fixtures"
import { TIMELINES, type SeqName, type TimelineEvent } from "./script"
import { TimelinePlayer, type PlayerStatus } from "./player"
import { runProgress } from "./sim"

export type Phase = "idle" | "playing" | "paused" | "done"
export type Speed = 1 | 1.5 | 2
export type QA = { id: string; chips: boolean; picked: boolean }
export type OutState = { order: string[]; shown: Record<string, number> }

export type DemoState = {
  hydrated: boolean
  seq: Record<SeqName, Phase>

  // beat 2
  tourStep: number
  // beat 3
  askTyped: number
  askStatus: "idle" | "working" | "done"
  // beat 4
  qa: QA[]
  lit: SourceId[]
  excluded: SourceId[]
  confirmations: Record<string, "pending" | "done">
  // beat 5
  buildStep: number
  // hero agent
  heroStage: Stage | null
  // beat 6
  writeEnabled: boolean
  // beat 7
  deployStatus: "open" | "deploying" | "deployed"
  deployPct: number
  approvals: string[]
  overrides: Partial<Record<SourceId, Colour>>
  readiness: number
  rolloutDay: number
  // beat 8
  runStep: number
  blockedPulse: boolean
  fresh: OutState
  trained: OutState
  compare: boolean
  // close
  endCard: boolean

  extraActivity: Activity[]
  rec: boolean
  speed: Speed
  sidebarCollapsed: boolean
}

export type DemoActions = {
  applyEvent: (e: TimelineEvent) => void
  reset: () => void
  startSeq: (name: SeqName) => void
  skipSeq: (name: SeqName) => void
  togglePause: () => boolean
  setWrite: (v: boolean) => void
  deploy: () => Promise<void>
  setCompare: (v: boolean) => void
  setEndCard: (v: boolean) => void
  setRec: (v: boolean) => void
  toggleRec: () => void
  setSpeed: (s: Speed) => void
  setSidebar: (v: boolean) => void
  addActivity: (a: Activity) => void
}

const EMPTY_OUT: OutState = { order: [], shown: {} }

const INITIAL: DemoState = {
  hydrated: false,
  seq: { tour: "idle", ask: "idle", scope: "idle", build: "idle", run: "idle" },
  tourStep: -1,
  askTyped: 0,
  askStatus: "idle",
  qa: [],
  lit: [],
  excluded: [],
  confirmations: {},
  buildStep: 0,
  heroStage: null,
  writeEnabled: true,
  deployStatus: "open",
  deployPct: 0,
  approvals: ["ruth"],
  overrides: {},
  readiness: READINESS.before,
  rolloutDay: ROLLOUT.day,
  runStep: 0,
  blockedPulse: false,
  fresh: EMPTY_OUT,
  trained: EMPTY_OUT,
  compare: false,
  endCard: false,
  extraActivity: [],
  rec: false,
  speed: 1,
  sidebarCollapsed: false,
}

/** State each sequence owns and resets when it starts again. */
const SEQ_KEYS: Record<SeqName, (keyof DemoState)[]> = {
  tour: ["tourStep"],
  ask: ["askTyped", "askStatus"],
  scope: ["qa", "lit", "excluded", "confirmations"],
  build: ["buildStep"],
  run: ["runStep", "blockedPulse", "fresh", "trained", "compare"],
}

const players: Partial<Record<SeqName, TimelinePlayer>> = {}

function reduceEvent(s: DemoState, e: TimelineEvent): Partial<DemoState> {
  switch (e.type) {
    case "tour":
      return { tourStep: e.step }
    case "ask:typed":
      return { askTyped: e.shown }
    case "ask:status":
      return e.status === "done" ? { askStatus: "done", heroStage: "requested" } : { askStatus: "working" }
    case "qa:add":
      return s.qa.some((q) => q.id === e.id) ? {} : { qa: [...s.qa, { id: e.id, chips: false, picked: false }] }
    case "qa:chips":
      return { qa: s.qa.map((q) => (q.id === e.id ? { ...q, chips: true } : q)) }
    case "qa:pick":
      return { qa: s.qa.map((q) => (q.id === e.id ? { ...q, chips: true, picked: true } : q)) }
    case "scope:light":
      return s.lit.includes(e.id) ? {} : { lit: [...s.lit, e.id] }
    case "scope:exclude":
      return s.excluded.includes(e.id) ? {} : { excluded: [...s.excluded, e.id] }
    case "confirm":
      return { confirmations: { ...s.confirmations, [e.id]: e.status } }
    case "build:step":
      return { buildStep: Math.max(s.buildStep, e.n) }
    case "run:step":
      return { runStep: Math.max(s.runStep, e.n), blockedPulse: false }
    case "run:pulse":
      return { blockedPulse: true }
    case "out:block": {
      const cur = s[e.side]
      return cur.order.includes(e.id) ? {} : { [e.side]: { order: [...cur.order, e.id], shown: { ...cur.shown, [e.id]: 0 } } }
    }
    case "out:progress": {
      const cur = s[e.side]
      return { [e.side]: { ...cur, shown: { ...cur.shown, [e.id]: e.shown } } }
    }
    case "compare":
      return { compare: true }
    case "seq:done": {
      const extra: Partial<DemoState> = e.seq === "scope" ? { heroStage: "scoping" } : e.seq === "build" ? { heroStage: "review" } : {}
      return { seq: { ...s.seq, [e.seq]: "done" }, ...extra }
    }
  }
  return {}
}

function pick(keys: (keyof DemoState)[]): Partial<DemoState> {
  const out: Partial<DemoState> = {}
  for (const k of keys) (out as Record<string, unknown>)[k] = INITIAL[k]
  return out
}

function statusToPhase(s: PlayerStatus): Phase {
  return s === "idle" ? "idle" : s === "playing" ? "playing" : s === "paused" ? "paused" : "done"
}

/** Stage the hero reaches when a sequence starts. */
const STAGE_ON_START: Partial<Record<SeqName, Stage>> = { scope: "scoping", build: "building" }

export const useDemo = create<DemoState & DemoActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      applyEvent: (e) => set((s) => reduceEvent(s, e)),

      reset: () => {
        for (const k of Object.keys(players) as SeqName[]) players[k]?.stop()
        for (const k of Object.keys(players) as SeqName[]) delete players[k]
        const { rec, sidebarCollapsed, speed } = get()
        set({ ...INITIAL, hydrated: true, rec, sidebarCollapsed, speed: rec ? 1.5 : speed })
      },

      startSeq: (name) => {
        const s = get()
        if (s.seq[name] === "playing") return
        players[name]?.stop()
        const stage = STAGE_ON_START[name]
        set({ ...pick(SEQ_KEYS[name]), seq: { ...s.seq, [name]: "playing" }, ...(stage ? { heroStage: stage } : {}) })
        const p = new TimelinePlayer(TIMELINES[name](), (e) => get().applyEvent(e), {
          speed: () => get().speed,
          onStatus: (st) => {
            if (st === "done") return // seq:done sets the phase
            set({ seq: { ...get().seq, [name]: statusToPhase(st) } })
          },
        })
        players[name] = p
        p.start()
      },
      skipSeq: (name) => {
        const s = get()
        if (s.seq[name] === "done") return
        if (!players[name]) {
          const stage = STAGE_ON_START[name]
          set({ ...pick(SEQ_KEYS[name]), seq: { ...s.seq, [name]: "playing" }, ...(stage ? { heroStage: stage } : {}) })
          players[name] = new TimelinePlayer(TIMELINES[name](), (e) => get().applyEvent(e))
        }
        players[name]!.skipToEnd()
        set({ seq: { ...get().seq, [name]: "done" } })
      },
      togglePause: () => {
        const s = get()
        for (const name of Object.keys(s.seq) as SeqName[]) {
          if (s.seq[name] === "playing" || s.seq[name] === "paused") {
            players[name]?.toggle()
            return true
          }
        }
        return false
      },

      setWrite: (v) => {
        set({ writeEnabled: v })
        toast(v ? "Write to DealCloud on" : "Write to DealCloud off", { description: v ? "Screens post to the deal record again." : "Screens come to Maya's inbox first. Changed at the source, logged." })
      },

      deploy: async () => {
        const s = get()
        if (s.deployStatus !== "open") return
        set({ deployStatus: "deploying", deployPct: 0, approvals: [...new Set([...s.approvals, "maya"])] })
        await runProgress(1300, (pct) => set({ deployPct: pct }))
        set({ deployStatus: "deployed", deployPct: 100, heroStage: "deployed", overrides: { ...get().overrides, "deals-inbox": "yellow" }, readiness: READINESS.after, rolloutDay: ROLLOUT.liveDay })
        get().addActivity({ id: "a-0110", at: new Date(NOW.getTime() + 3 * 60_000), actorId: "maya", kind: "deploy", text: `deployed CIM screener · ${DEPLOY.summary[0].value} sources connected, ${DEPLOY.summary[2].value} exclusions enforced at source` })
        toast.success("CIM screener deployed", { description: `deals@ inbox is now connected. Firm AI-readiness ${READINESS.before}% → ${READINESS.after}%. First agent live, Day ${ROLLOUT.liveDay} of ${ROLLOUT.total}.` })
      },

      setCompare: (v) => set({ compare: v }),
      setEndCard: (v) => set({ endCard: v }),
      setRec: (v) => set({ rec: v, speed: v ? 1.5 : 1 }),
      toggleRec: () => get().setRec(!get().rec),
      setSpeed: (speed) => {
        set({ speed })
        for (const k of Object.keys(players) as SeqName[]) players[k]?.retime()
      },
      setSidebar: (v) => set({ sidebarCollapsed: v }),
      addActivity: (a) => set((s) => (s.extraActivity.some((x) => x.id === a.id) ? {} : { extraActivity: [a, ...s.extraActivity] })),
    }),
    {
      name: "enakt-kestrel-demo-v1",
      storage: createJSONStorage(() => sessionStorage, { reviver: (k, v) => (k === "at" && typeof v === "string" ? new Date(v) : v) }),
      skipHydration: true,
      partialize: (s) => {
        const { hydrated: _h, blockedPulse: _b, deployPct: _d, tourStep: _t, ...rest } = s
        void _h
        void _b
        void _d
        void _t
        return rest as unknown as DemoState
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DemoState>
        const next: DemoState & DemoActions = { ...current, ...p, hydrated: true }
        // A reload mid-sequence lands on the finished state. Nothing is half-done.
        for (const name of Object.keys(TIMELINES) as SeqName[]) {
          if (next.seq[name] === "playing" || next.seq[name] === "paused") {
            let s: DemoState = { ...next, ...pick(SEQ_KEYS[name]) }
            for (const e of TIMELINES[name]()) s = { ...s, ...reduceEvent(s, e) }
            Object.assign(next, s, { seq: { ...s.seq, [name]: "done" } })
          }
        }
        if (next.deployStatus === "deploying") next.deployStatus = "open"
        return next
      },
    },
  ),
)

export const selectActivity = (s: DemoState): Activity[] => [...s.extraActivity, ...ACTIVITY]
export const selectScopeDone = (s: DemoState) => s.seq.scope === "done"
export { SCOPE, NOW }
