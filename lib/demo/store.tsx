"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ACTIVITY, CONSOLIDATION, INITIAL_ACCESS, NOW, type AccessLevel, type ActivityEntry, type ResourceId } from "./fixtures"

export type MergeStatus = "open" | "merging" | "merged"

export type DemoState = {
  intakeRun: boolean
  mergeStatus: MergeStatus
  progress: number
  access: Record<string, Record<ResourceId, AccessLevel>>
  extraActivity: ActivityEntry[]
  rec: boolean
  sidebarCollapsed: boolean
  notificationsRead: boolean
}

export const INITIAL_STATE: DemoState = {
  intakeRun: false,
  mergeStatus: "open",
  progress: CONSOLIDATION.before,
  access: INITIAL_ACCESS,
  extraActivity: [],
  rec: false,
  sidebarCollapsed: false,
  notificationsRead: false,
}

type Action =
  | { type: "reset" }
  | { type: "intake:done" }
  | { type: "merge:status"; status: MergeStatus }
  | { type: "progress"; value: number }
  | { type: "access:set"; access: DemoState["access"] }
  | { type: "activity:add"; entry: ActivityEntry }
  | { type: "rec"; value: boolean }
  | { type: "sidebar"; value: boolean }
  | { type: "notifications:read" }
  | { type: "hydrate"; state: DemoState }

function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case "reset":
      return { ...INITIAL_STATE, rec: s.rec, sidebarCollapsed: s.sidebarCollapsed }
    case "intake:done":
      return { ...s, intakeRun: true }
    case "merge:status":
      return { ...s, mergeStatus: a.status }
    case "progress":
      return { ...s, progress: a.value }
    case "access:set":
      return { ...s, access: a.access }
    case "activity:add":
      return s.extraActivity.some((e) => e.id === a.entry.id) ? s : { ...s, extraActivity: [a.entry, ...s.extraActivity] }
    case "rec":
      return { ...s, rec: a.value }
    case "sidebar":
      return { ...s, sidebarCollapsed: a.value }
    case "notifications:read":
      return { ...s, notificationsRead: true }
    case "hydrate":
      return a.state
  }
}

const STORAGE_KEY = "enakt-demo-state-v1"

type Ctx = { state: DemoState; dispatch: React.Dispatch<Action>; activity: ActivityEntry[] }
const DemoContext = React.createContext<Ctx | null>(null)

function load(): DemoState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      ...INITIAL_STATE,
      ...parsed,
      mergeStatus: parsed.mergeStatus === "merging" ? "open" : parsed.mergeStatus,
      extraActivity: (parsed.extraActivity ?? []).map((e: ActivityEntry) => ({ ...e, at: new Date(e.at) })),
    }
  } catch {
    return null
  }
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    const saved = load()
    if (saved) dispatch({ type: "hydrate", state: saved })
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state, hydrated])

  const activity = React.useMemo(() => [...state.extraActivity, ...ACTIVITY], [state.extraActivity])

  const value = React.useMemo(() => ({ state, dispatch, activity }), [state, activity])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = React.useContext(DemoContext)
  if (!ctx) throw new Error("useDemo must be used within DemoProvider")
  return ctx
}

/** Reads ?rec=1 once and keeps it for the session. */
export function RecModeReader() {
  const params = useSearchParams()
  const { dispatch } = useDemo()
  React.useEffect(() => {
    const v = params.get("rec")
    if (v === "1") dispatch({ type: "rec", value: true })
    if (v === "0") dispatch({ type: "rec", value: false })
  }, [params, dispatch])
  return null
}

const SHORTCUT_ROUTES: Record<string, string> = {
  "1": "/northfield/intake",
  "2": "/northfield/map",
  "3": "/northfield/sources/salesforce-crm",
  "4": "/northfield/merge-requests/12",
  "5": "/northfield/access",
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable || !!el.closest("[cmdk-root]")
}

/** Global keyboard shortcuts: 1-5 jump, Shift+R reset. ⌘K lives in the command palette. */
export function KeyboardShortcuts({ onReset }: { onReset?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const { dispatch } = useDemo()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTyping(e.target)) return
      if (e.shiftKey && (e.key === "R" || e.key === "r")) {
        e.preventDefault()
        dispatch({ type: "reset" })
        onReset?.()
        return
      }
      if (e.shiftKey) return
      const route = SHORTCUT_ROUTES[e.key]
      if (route) {
        e.preventDefault()
        if (pathname !== route) router.push(route)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router, pathname, dispatch, onReset])

  React.useEffect(() => {
    Object.values(SHORTCUT_ROUTES).forEach((r) => router.prefetch(r))
  }, [router])

  return null
}

export { NOW }
