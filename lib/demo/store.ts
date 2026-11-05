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
  CR,
  INITIAL_MATRIX,
  METER,
  NOW,
  POLICY_BY_ID,
  SOURCES,
  type AccessLevel,
  type AuditEntry,
  type LaneId,
  type Matrix,
  type PlanColumn,
  type ResourceId,
  type Verdict,
  type Viewer,
  href,
} from "./fixtures"
import { buildRequestTimeline, buildRunTimeline, type PersonStatus, type TimelineEvent, type TranscriptEntry } from "./script"
import { TimelinePlayer, type PlayerStatus } from "./player"
import { runProgress } from "./sim"

export type Phase = "idle" | "playing" | "paused" | "done"
export type ConnectStatus = "open" | "merging" | "merged"
export type Speed = 1 | 1.5 | 2

export type NodeState = {
  verdict: Verdict
  placeholder?: { label: string; hint: string }
}

export type DemoState = {
  hydrated: boolean

  // Request R-3
  requestPhase: Phase
  scan: "idle" | "running" | "done"
  scanSystems: number
  scanFiles: number
  plan: Record<PlanColumn, string[]>
  people: Record<string, PersonStatus>
  transcript: TranscriptEntry[]
  openQuestions: Record<string, "open" | "resolved">

  // Canvas
  lanes: LaneId[]
  lanePolicies: Partial<Record<LaneId, string[]>>
  nodes: Partial<Record<string, NodeState>>
  edges: string[]
  policies: string[]
  agents: string[]
  liveAgents: string[]
  progress: number

  // Connection request CR-7
  crStatus: ConnectStatus
  crPct: number
  approvals: string[]
  milestonesDone: string[]

  // Policies matrix
  matrix: Matrix
  draft: Matrix | null

  // Agent run
  runPhase: Phase
  traceShown: number
  blockedPulse: boolean
  briefOrder: string[]
  briefShown: Record<string, number>
  hoverStep: number | null
  sentForReview: boolean

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
  startRequest: () => void
  pauseRequest: () => void
  resumeRequest: () => void
  skipRequest: () => void
  startRun: () => void
  pauseRun: () => void
  resumeRun: () => void
  togglePause: () => boolean
  approveAs: (id: string) => Promise<void>
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
  sendForReview: () => void
}

const INITIAL: DemoState = {
  hydrated: false,
  requestPhase: "idle",
  scan: "idle",
  scanSystems: 0,
  scanFiles: 0,
  plan: { needs: [], ask: [], never: [] },
  people: {},
  transcript: [],
  openQuestions: {},
  lanes: [],
  lanePolicies: {},
  nodes: {},
  edges: [],
  policies: [],
  agents: [],
  liveAgents: [],
  progress: METER.before,
  crStatus: "open",
  crPct: 0,
  approvals: [],
  milestonesDone: [],
  matrix: INITIAL_MATRIX,
  draft: null,
  runPhase: "idle",
  traceShown: 0,
  blockedPulse: false,
  briefOrder: [],
  briefShown: {},
  hoverStep: null,
  sentForReview: false,
  extraAudit: [],
  viewAs: "dana",
  rec: false,
  speed: 1,
  sidebarCollapsed: false,
  notificationsRead: false,
}

// Players live outside the persisted state.
let requestPlayer: TimelinePlayer | null = null
let runPlayer: TimelinePlayer | null = null

function reduceEvent(s: DemoState, e: TimelineEvent): Partial<DemoState> {
  switch (e.type) {
    case "scan":
      return e.status === "running" ? { scan: "running", scanSystems: 0, scanFiles: 0 } : { scan: "done" }
    case "scan:progress":
      return { scanSystems: e.systems, scanFiles: e.files }
    case "plan:add":
      return s.plan[e.column].includes(e.id) ? {} : { plan: { ...s.plan, [e.column]: [...s.plan[e.column], e.id] } }
    case "person":
      return { people: { ...s.people, [e.id]: e.status } }
    case "entry:add":
      return s.transcript.some((x) => x.id === e.entry.id) ? {} : { transcript: [...s.transcript, e.entry] }
    case "entry:progress":
      return { transcript: s.transcript.map((x) => (x.id === e.id ? { ...x, shown: e.shown } : x)) }
    case "entry:done":
      return { transcript: s.transcript.map((x) => (x.id === e.id ? { ...x, shown: x.text.length, done: true } : x)) }
    case "chip:add":
      return { transcript: s.transcript.map((x) => (x.id === e.entryId && !x.chips.some((c) => c.id === e.chip.id) ? { ...x, chips: [...x.chips, e.chip] } : x)) }
    case "question:add":
      return { openQuestions: { ...s.openQuestions, [e.id]: "open" } }
    case "progress":
      return { progress: e.value }
    case "request:done":
      return { requestPhase: "done" }
    case "canvas": {
      const ev = e.event
      switch (ev.type) {
        case "lane:add":
          return s.lanes.includes(ev.id) ? {} : { lanes: [...s.lanes, ev.id] }
        case "source:add":
          return { nodes: { ...s.nodes, [ev.id]: { verdict: ev.verdict ?? "unchecked" } } }
        case "placeholder:add":
          return { nodes: { ...s.nodes, [ev.id]: { verdict: "unchecked", placeholder: { label: ev.label, hint: ev.hint } } } }
        case "placeholder:resolve":
          return { nodes: { ...s.nodes, [ev.id]: { verdict: ev.verdict } } }
        case "verdict:set": {
          const n = s.nodes[ev.id]
          if (!n) return {}
          return { nodes: { ...s.nodes, [ev.id]: { ...n, verdict: ev.verdict } } }
        }
        case "edge:add":
          return s.edges.includes(ev.id) ? {} : { edges: [...s.edges, ev.id] }
        case "policy:add": {
          const p = POLICY_BY_ID[ev.id]
          const lanePolicies = { ...s.lanePolicies }
          for (const l of p.governsLanes) {
            const cur = lanePolicies[l] ?? []
            if (!cur.includes(ev.id)) lanePolicies[l] = [...cur, ev.id]
          }
          return { policies: s.policies.includes(ev.id) ? s.policies : [...s.policies, ev.id], lanePolicies }
        }
        case "agent:add":
          return s.agents.includes(ev.id) ? {} : { agents: [...s.agents, ev.id] }
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

const REQUEST_KEYS: (keyof DemoState)[] = ["requestPhase", "scan", "scanSystems", "scanFiles", "plan", "people", "transcript", "openQuestions", "lanes", "lanePolicies", "nodes", "edges", "policies", "agents", "progress"]
const RUN_KEYS: (keyof DemoState)[] = ["runPhase", "traceShown", "blockedPulse", "briefOrder", "briefShown", "hoverStep", "sentForReview"]

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
        requestPlayer?.stop()
        runPlayer?.stop()
        requestPlayer = null
        runPlayer = null
        const { rec, sidebarCollapsed, speed } = get()
        set({ ...INITIAL, hydrated: true, rec, sidebarCollapsed, speed: rec ? 1.5 : speed })
      },

      startRequest: () => {
        const s = get()
        if (s.requestPhase === "playing") return
        requestPlayer?.stop()
        // A re-run keeps the meter and the live agent where CR-7 left them.
        const keepProgress = s.crStatus === "merged" ? { progress: METER.after } : {}
        set({ ...pick(REQUEST_KEYS), ...keepProgress, requestPhase: "playing" })
        requestPlayer = new TimelinePlayer(buildRequestTimeline(), (e) => get().applyEvent(e), {
          speed: () => get().speed,
          onStatus: (st) => {
            if (st === "done") return // request:done sets the phase
            set({ requestPhase: statusToPhase(st) })
          },
        })
        requestPlayer.start()
      },
      pauseRequest: () => requestPlayer?.pause(),
      resumeRequest: () => requestPlayer?.resume(),
      skipRequest: () => {
        const s = get()
        if (s.requestPhase === "done") return
        if (!requestPlayer) {
          set({ ...pick(REQUEST_KEYS), requestPhase: "playing" })
          requestPlayer = new TimelinePlayer(buildRequestTimeline(), (e) => get().applyEvent(e))
        }
        requestPlayer.skipToEnd()
        set({ requestPhase: "done", progress: get().crStatus === "merged" ? METER.after : METER.before })
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
              get().addAudit({
                id: "A-0124",
                at: new Date(NOW.getTime() + 4 * 60_000),
                actorId: "atlas-memo-agent",
                kind: "blocked",
                text: "blocked: pull comparable deal metrics from Project Birch · policy deal-data-within-deal · draft returned with 23 citations",
                path: "datasite://birch/** → denied at Datasite group",
                href: href("/agents/atlas-memo-agent"),
              })
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
        if (s.requestPhase === "playing" || s.requestPhase === "paused") {
          requestPlayer?.toggle()
          return true
        }
        if (s.runPhase === "playing" || s.runPhase === "paused") {
          runPlayer?.toggle()
          return true
        }
        return false
      },

      approveAs: async (id) => {
        const s = get()
        if (s.crStatus !== "open" || s.approvals.includes(id)) return
        const approvals = [...s.approvals, id]
        const approver = CR.approvers.find((a) => a.id === id)
        set({ approvals })
        get().addAudit({
          id: `A-012${approvals.length}`,
          at: new Date(NOW.getTime() + approvals.length * 60_000),
          actorId: id,
          kind: "approve",
          text: `approved CR-${CR.number} as ${approver?.role.toLowerCase() ?? "approver"} · ${approvals.length} of ${CR.approvers.length}`,
          href: href("/connections/cr-7"),
        })
        if (approvals.length < CR.approvers.length) {
          toast(`Approved as ${approver ? approver.id === "ellen" ? "Ellen Marsh" : "Grace Liu" : id}`, { description: `${approvals.length} of ${CR.approvers.length} approvals. Waiting on the ${approvals.length === 1 ? "CCO" : "deal partner"}.` })
          return
        }
        set({ crStatus: "merging", crPct: 0 })
        await runProgress(1200, (pct) => set({ crPct: pct }))
        const edges = [...get().edges]
        for (const src of CR.sources) {
          const id = `${CR.agentId}>${src}`
          if (!edges.includes(id)) edges.push(id)
        }
        set({
          crStatus: "merged",
          crPct: 100,
          edges,
          liveAgents: [...new Set([...get().liveAgents, CR.agentId])],
          progress: METER.after,
          milestonesDone: [...new Set([...get().milestonesDone, "d15"])],
        })
        get().addAudit({
          id: "A-0123",
          at: new Date(NOW.getTime() + 3 * 60_000),
          actorId: "grace",
          kind: "connect",
          text: `merged CR-${CR.number} · atlas-memo-agent connected to 4 Atlas sources, enforced at Datasite, SharePoint and DealCloud`,
          href: href("/connections/cr-7"),
        })
        toast.success(`CR-${CR.number} merged`, { description: `atlas-memo-agent is live on Project Atlas. Firm AI-ready ${METER.before}% → ${METER.after}%. Day 15 milestone checked.` })
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
          id: `A-013${s.extraAudit.length}`,
          at: new Date(NOW.getTime() + 5 * 60_000),
          actorId: "dana",
          kind: "policy",
          text: `changed ${changed} access rule${changed === 1 ? "" : "s"} · enforced at the source on save`,
          href: href("/policies"),
        })
        toast.success("Policy saved", { description: `${changed} change${changed === 1 ? "" : "s"} pushed to Datasite, SharePoint and DealCloud. Logged to the audit trail.` })
      },

      setHover: (n) => set({ hoverStep: n }),
      setViewAs: (v) => set({ viewAs: v }),
      setRec: (v) => set({ rec: v, speed: v ? 1.5 : 1 }),
      toggleRec: () => get().setRec(!get().rec),
      setSpeed: (speed) => {
        set({ speed })
        requestPlayer?.retime()
        runPlayer?.retime()
      },
      setSidebar: (v) => set({ sidebarCollapsed: v }),
      readNotifications: () => set({ notificationsRead: true }),
      addAudit: (e) => set((s) => (s.extraAudit.some((x) => x.id === e.id) ? {} : { extraAudit: [e, ...s.extraAudit] })),
      sendForReview: () => {
        if (get().sentForReview) return
        set({ sentForReview: true })
        toast.success("Sent to the Atlas deal team", { description: "Ellen Marsh, Tom Becker and Nina Alvarez have the draft with every citation. Nothing was written to the data room." })
      },
    }),
    {
      name: "enakt-calloway-demo-v1",
      storage: createJSONStorage(() => sessionStorage, {
        reviver: (k, v) => (k === "at" && typeof v === "string" ? new Date(v) : v),
      }),
      skipHydration: true,
      partialize: (s) => {
        const { hydrated: _h, hoverStep: _hs, blockedPulse: _bp, crPct: _cp, ...rest } = s
        void _h
        void _hs
        void _bp
        void _cp
        return rest as unknown as DemoState
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DemoState>
        const next: DemoState & DemoActions = { ...current, ...p, hydrated: true }
        // A reload mid-script lands on the finished state. Nothing is half-done.
        if (next.requestPhase === "playing" || next.requestPhase === "paused") {
          let s: DemoState = { ...next, ...pick(REQUEST_KEYS) }
          for (const e of buildRequestTimeline()) s = { ...s, ...reduceEvent(s, e) }
          Object.assign(next, s, { requestPhase: "done", progress: next.crStatus === "merged" ? METER.after : METER.before })
        }
        if (next.runPhase === "playing" || next.runPhase === "paused") {
          let s: DemoState = { ...next, ...pick(RUN_KEYS) }
          for (const e of buildRunTimeline()) s = { ...s, ...reduceEvent(s, e) }
          Object.assign(next, s, { runPhase: "done" })
        }
        if (next.crStatus === "merging") {
          next.crStatus = "open"
          next.approvals = next.approvals.slice(0, 1)
        }
        return next
      },
    },
  ),
)

/** Finished request scene, derived from the state. */
export const selectRequestDone = (s: DemoState) => s.requestPhase === "done"

/** All audit entries, newest first. */
export const selectAudit = (s: DemoState): AuditEntry[] => [...s.extraAudit, ...AUDIT]

/** Sources on the canvas, in fixture order. */
export const selectDiscovered = (s: DemoState) => SOURCES.filter((src) => s.nodes[src.id] && !s.nodes[src.id]?.placeholder)

export { NOW }
