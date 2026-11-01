/**
 * One Zustand store for the whole demo. Every page reads from it, which is what keeps the
 * canvas continuous across routes. Persisted to sessionStorage so an accidental reload does
 * not lose a take; Shift+R wipes it.
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { toast } from "sonner"
import {
  AUDIT,
  BRAIN,
  INITIAL_MATRIX,
  MR,
  MR14_SOURCES,
  NOW,
  POLICY_BY_ID,
  SOURCES,
  type AccessLevel,
  type AuditEntry,
  type Matrix,
  type ResourceId,
  type Verdict,
  type Viewer,
  href,
} from "./fixtures"
import { buildIntakeTimeline, buildRunTimeline, type IntervieweeStatus, type TimelineEvent, type TranscriptEntry } from "./script"
import { TimelinePlayer, type PlayerStatus } from "./player"
import { runProgress } from "./sim"

export type Phase = "idle" | "playing" | "paused" | "done"
export type MergeStatus = "open" | "merging" | "merged"
export type Speed = 1 | 1.5 | 2

export type NodeState = {
  verdict: Verdict
  placeholder?: { label: string; hint: string }
  noOwner?: boolean
  policies: string[]
}

export type DemoState = {
  hydrated: boolean

  // Intake
  intakePhase: Phase
  transcript: TranscriptEntry[]
  interviewees: Record<string, IntervieweeStatus>
  readiness: "idle" | "running" | "done"
  people: string[]
  workflows: string[]
  openQuestions: Record<string, "open" | "resolved">

  // Canvas
  brainVisible: boolean
  brainMerged: number
  brainPolicies: string[]
  nodes: Partial<Record<string, NodeState>>
  edges: string[]
  policies: string[]
  progress: number

  // Build / merge
  mergeStatus: MergeStatus
  mergePct: number

  // Permissions
  matrix: Matrix
  draft: Matrix | null

  // Agent run
  runPhase: Phase
  traceShown: number
  blockedPulse: boolean
  briefOrder: string[]
  briefShown: Record<string, number>
  hoverStep: number | null

  // Audit and shell
  extraAudit: AuditEntry[]
  viewAs: Viewer
  rec: boolean
  speed: Speed
  sidebarCollapsed: boolean
  notificationsRead: boolean
}

export type DemoActions = {
  applyEvent: (e: TimelineEvent) => void
  reset: () => void
  startIntake: () => void
  pauseIntake: () => void
  resumeIntake: () => void
  skipIntake: () => void
  startRun: () => void
  pauseRun: () => void
  resumeRun: () => void
  togglePause: () => boolean
  approveMerge: () => Promise<void>
  setCell: (actor: string, resource: ResourceId, level: AccessLevel) => void
  discardDraft: () => void
  saveDraft: () => void
  setHover: (n: number | null) => void
  setViewAs: (v: Viewer) => void
  setRec: (v: boolean) => void
  toggleRec: () => void
  setSpeed: (s: Speed) => void
  setSidebar: (v: boolean) => void
  readNotifications: () => void
  addAudit: (e: AuditEntry) => void
}

const INITIAL: DemoState = {
  hydrated: false,
  intakePhase: "idle",
  transcript: [],
  interviewees: { dana: "scheduled", marcus: "scheduled", priya: "scheduled", sam: "scheduled", chris: "scheduled", planning: "scheduled" },
  readiness: "idle",
  people: [],
  workflows: [],
  openQuestions: {},
  brainVisible: false,
  brainMerged: 0,
  brainPolicies: [],
  nodes: {},
  edges: [],
  policies: [],
  progress: BRAIN.before,
  mergeStatus: "open",
  mergePct: 0,
  matrix: INITIAL_MATRIX,
  draft: null,
  runPhase: "idle",
  traceShown: 0,
  blockedPulse: false,
  briefOrder: [],
  briefShown: {},
  hoverStep: null,
  extraAudit: [],
  viewAs: "dana",
  rec: false,
  speed: 1,
  sidebarCollapsed: false,
  notificationsRead: false,
}

// Players live outside the persisted state.
let intakePlayer: TimelinePlayer | null = null
let runPlayer: TimelinePlayer | null = null

function reduceEvent(s: DemoState, e: TimelineEvent): Partial<DemoState> {
  switch (e.type) {
    case "interviewee":
      return { interviewees: { ...s.interviewees, [e.id]: e.status } }
    case "entry:add":
      return s.transcript.some((x) => x.id === e.entry.id) ? {} : { transcript: [...s.transcript, e.entry] }
    case "entry:progress":
      return { transcript: s.transcript.map((x) => (x.id === e.id ? { ...x, shown: e.shown } : x)) }
    case "entry:done":
      return { transcript: s.transcript.map((x) => (x.id === e.id ? { ...x, shown: x.text.length, done: true } : x)) }
    case "chip:add":
      return {
        transcript: s.transcript.map((x) => (x.id === e.entryId && !x.chips.some((c) => c.id === e.chip.id) ? { ...x, chips: [...x.chips, e.chip] } : x)),
      }
    case "workflow:add":
      return s.workflows.includes(e.id) ? {} : { workflows: [...s.workflows, e.id] }
    case "question:add":
      return { openQuestions: { ...s.openQuestions, [e.id]: "open" } }
    case "question:resolve":
      return { openQuestions: { ...s.openQuestions, [e.id]: "resolved" } }
    case "person:add":
      return s.people.includes(e.id) ? {} : { people: [...s.people, e.id] }
    case "readiness":
      return { readiness: e.status }
    case "progress":
      return { progress: e.value }
    case "intake:done":
      return { intakePhase: "done" }
    case "canvas": {
      const ev = e.event
      switch (ev.type) {
        case "brain:show":
          return { brainVisible: true }
        case "source:add":
          return { nodes: { ...s.nodes, [ev.id]: { verdict: ev.verdict ?? "unchecked", noOwner: ev.noOwner, policies: s.nodes[ev.id]?.policies ?? [] } } }
        case "placeholder:add":
          return { nodes: { ...s.nodes, [ev.id]: { verdict: "unchecked", placeholder: { label: ev.label, hint: ev.hint }, policies: [] } } }
        case "placeholder:resolve": {
          const n = s.nodes[ev.id]
          return { nodes: { ...s.nodes, [ev.id]: { verdict: "unchecked", policies: n?.policies ?? [] } } }
        }
        case "edge:add":
          return s.edges.includes(ev.id) ? {} : { edges: [...s.edges, ev.id] }
        case "policy:add": {
          const p = POLICY_BY_ID[ev.id]
          const nodes = { ...s.nodes }
          for (const g of p.governs) {
            if (g === "brain") continue
            const n = nodes[g]
            if (n && !n.policies.includes(ev.id)) nodes[g] = { ...n, policies: [...n.policies, ev.id] }
          }
          return {
            policies: s.policies.includes(ev.id) ? s.policies : [...s.policies, ev.id],
            brainPolicies: p.governs.includes("brain") && !s.brainPolicies.includes(ev.id) ? [...s.brainPolicies, ev.id] : s.brainPolicies,
            nodes,
          }
        }
        case "verdict:set": {
          const n = s.nodes[ev.id]
          if (!n) return {}
          return { nodes: { ...s.nodes, [ev.id]: { ...n, verdict: ev.verdict } } }
        }
        case "brain:fill":
          return { brainMerged: ev.merged }
      }
      return {}
    }
    case "trace:step":
      return { traceShown: Math.max(s.traceShown, e.n), blockedPulse: false }
    case "trace:pulse":
      return { blockedPulse: true }
    case "brief:block":
      return s.briefOrder.includes(e.id) ? {} : { briefOrder: [...s.briefOrder, e.id], briefShown: { ...s.briefShown, [e.id]: 0 } }
    case "brief:progress":
      return { briefShown: { ...s.briefShown, [e.id]: e.shown } }
    case "run:done":
      return { runPhase: "done" }
  }
  return {}
}

const INTAKE_KEYS: (keyof DemoState)[] = ["intakePhase", "transcript", "interviewees", "readiness", "people", "workflows", "openQuestions", "brainVisible", "brainMerged", "brainPolicies", "nodes", "edges", "policies", "progress"]
const RUN_KEYS: (keyof DemoState)[] = ["runPhase", "traceShown", "blockedPulse", "briefOrder", "briefShown", "hoverStep"]

function pick(keys: (keyof DemoState)[]): Partial<DemoState> {
  const out: Partial<DemoState> = {}
  for (const k of keys) (out as Record<string, unknown>)[k] = INITIAL[k]
  return out
}

function statusToPhase(s: PlayerStatus): Phase {
  return s === "idle" ? "idle" : s === "playing" ? "playing" : s === "paused" ? "paused" : "done"
}

export const useDemo = create<DemoState & DemoActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      applyEvent: (e) => set((s) => reduceEvent(s, e)),

      reset: () => {
        intakePlayer?.stop()
        runPlayer?.stop()
        intakePlayer = null
        runPlayer = null
        const { rec, sidebarCollapsed, speed } = get()
        set({ ...INITIAL, hydrated: true, rec, sidebarCollapsed, speed: rec ? 1.5 : speed })
      },

      startIntake: () => {
        const s = get()
        if (s.intakePhase === "playing") return
        intakePlayer?.stop()
        set({ ...pick(INTAKE_KEYS), intakePhase: "playing" })
        intakePlayer = new TimelinePlayer(buildIntakeTimeline(), (e) => get().applyEvent(e), {
          speed: () => get().speed,
          onStatus: (st) => {
            if (st === "done") return // intake:done event sets the phase
            set({ intakePhase: statusToPhase(st) })
          },
        })
        intakePlayer.start()
      },
      pauseIntake: () => intakePlayer?.pause(),
      resumeIntake: () => intakePlayer?.resume(),
      skipIntake: () => {
        const s = get()
        if (s.intakePhase === "done") return
        if (!intakePlayer) {
          set({ ...pick(INTAKE_KEYS), intakePhase: "playing" })
          intakePlayer = new TimelinePlayer(buildIntakeTimeline(), (e) => get().applyEvent(e))
        }
        intakePlayer.skipToEnd()
        set({ intakePhase: "done" })
      },

      startRun: () => {
        const s = get()
        if (s.runPhase === "playing") return
        runPlayer?.stop()
        set({ ...pick(RUN_KEYS), runPhase: "playing" })
        runPlayer = new TimelinePlayer(buildRunTimeline(), (e) => get().applyEvent(e), {
          speed: () => get().speed,
          onStatus: (st) => {
            if (st === "done") {
              const { extraAudit } = get()
              if (!extraAudit.some((a) => a.id === "A-2035")) {
                get().addAudit({
                  id: "A-2035",
                  at: new Date(NOW.getTime() + 60_000),
                  actorId: "marcus-assistant",
                  kind: "blocked",
                  text: "blocked: compare with similar households · policy advisor-scope · brief delivered with 5 citations",
                  path: "policy://advisor-scope → audit/A-2035",
                  href: href("/agents/marcus-assistant"),
                })
              }
              return
            }
            set({ runPhase: statusToPhase(st) })
          },
        })
        runPlayer.start()
      },
      pauseRun: () => runPlayer?.pause(),
      resumeRun: () => runPlayer?.resume(),

      togglePause: () => {
        const s = get()
        if (s.intakePhase === "playing" || s.intakePhase === "paused") {
          intakePlayer?.toggle()
          return true
        }
        if (s.runPhase === "playing" || s.runPhase === "paused") {
          runPlayer?.toggle()
          return true
        }
        return false
      },

      approveMerge: async () => {
        const s = get()
        if (s.mergeStatus !== "open") return
        set({ mergeStatus: "merging", mergePct: 0 })
        await runProgress(1200, (pct) => set({ mergePct: pct }))
        const nodes = { ...get().nodes }
        for (const id of MR14_SOURCES) {
          const n = nodes[id]
          if (n) nodes[id] = { ...n, verdict: "inbrain" }
        }
        const edges = [...get().edges]
        for (const id of MR14_SOURCES) if (!edges.includes(`${id}>brain`)) edges.push(`${id}>brain`)
        set({ mergeStatus: "merged", mergePct: 100, nodes, edges, brainMerged: BRAIN.mergedAfter, progress: BRAIN.after })
        get().addAudit({
          id: "A-2036",
          at: new Date(NOW.getTime() + 120_000),
          actorId: "dana",
          kind: "merge",
          text: `approved and merged MR-${MR.number} · ${MR.stats.merged.toLocaleString("en-US")} records into the firm brain, ${MR.stats.held} held`,
          href: href("/build/mr-14"),
        })
        toast.success(`MR-${MR.number} merged`, { description: `2,184 records in the brain. 37 held for you. Firm in the brain ${BRAIN.before}% → ${BRAIN.after}%.` })
      },

      setCell: (actor, resource, level) => {
        const s = get()
        const base = s.draft ?? s.matrix
        const draft: Matrix = { ...base, [actor]: { ...base[actor], [resource]: level } }
        const same = Object.keys(draft).every((a) => Object.keys(draft[a]).every((r) => draft[a][r as ResourceId] === s.matrix[a][r as ResourceId]))
        set({ draft: same ? null : draft })
      },
      discardDraft: () => set({ draft: null }),
      saveDraft: () => {
        const s = get()
        if (!s.draft) return
        let changed = 0
        for (const a of Object.keys(s.draft)) for (const r of Object.keys(s.draft[a])) if (s.draft[a][r as ResourceId] !== s.matrix[a][r as ResourceId]) changed++
        set({ matrix: s.draft, draft: null })
        get().addAudit({
          id: `A-${2037 + s.extraAudit.length}`,
          at: new Date(NOW.getTime() + 180_000),
          actorId: "dana",
          kind: "policy",
          text: `changed ${changed} permission${changed === 1 ? "" : "s"} · enforced at the data layer immediately`,
          href: href("/permissions"),
        })
        toast.success("Policy saved", { description: `${changed} change${changed === 1 ? "" : "s"} enforced at the data layer. Logged to the audit trail.` })
      },

      setHover: (n) => set({ hoverStep: n }),
      setViewAs: (v) => set({ viewAs: v }),
      setRec: (v) => set({ rec: v, speed: v ? 1.5 : 1 }),
      toggleRec: () => get().setRec(!get().rec),
      setSpeed: (speed) => {
        set({ speed })
        intakePlayer?.retime()
        runPlayer?.retime()
      },
      setSidebar: (v) => set({ sidebarCollapsed: v }),
      readNotifications: () => set({ notificationsRead: true }),
      addAudit: (e) => set((s) => (s.extraAudit.some((x) => x.id === e.id) ? {} : { extraAudit: [e, ...s.extraAudit] })),
    }),
    {
      name: "enakt-ashcombe-demo-v1",
      storage: createJSONStorage(() => sessionStorage, {
        reviver: (k, v) => (k === "at" && typeof v === "string" ? new Date(v) : v),
      }),
      skipHydration: true,
      partialize: (s) => {
        const { hydrated: _h, hoverStep: _hs, blockedPulse: _bp, mergePct: _mp, ...rest } = s
        void _h
        void _hs
        void _bp
        void _mp
        return rest as unknown as DemoState
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DemoState>
        const next: DemoState & DemoActions = { ...current, ...p, hydrated: true }
        // A reload mid-script lands on the finished state. Nothing is half-done.
        if (next.intakePhase === "playing" || next.intakePhase === "paused") {
          let s: DemoState = { ...next, ...pick(INTAKE_KEYS) }
          for (const e of buildIntakeTimeline()) s = { ...s, ...reduceEvent(s, e) }
          Object.assign(next, s, { intakePhase: "done" })
        }
        if (next.runPhase === "playing" || next.runPhase === "paused") {
          let s: DemoState = { ...next, ...pick(RUN_KEYS) }
          for (const e of buildRunTimeline()) s = { ...s, ...reduceEvent(s, e) }
          Object.assign(next, s, { runPhase: "done" })
        }
        if (next.mergeStatus === "merging") next.mergeStatus = "open"
        return next
      },
    },
  ),
)

/** Finished intake, derived from the state. */
export const selectIntakeDone = (s: DemoState) => s.intakePhase === "done"

/** All audit entries, newest first. */
export const selectAudit = (s: DemoState): AuditEntry[] => [...s.extraAudit, ...AUDIT]

/** Sources discovered on the canvas, in fixture order. */
export const selectDiscovered = (s: DemoState) => SOURCES.filter((src) => s.nodes[src.id] && !s.nodes[src.id]?.placeholder)

export { NOW }
