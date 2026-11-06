"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Toaster, toast } from "sonner"
import { useTheme } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import type { SeqName } from "@/lib/demo/script"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { CommandPalette } from "./command-palette"
import { RouteTransition } from "./route-transition"

/** One number key per beat, in storyboard order. The sequence starts on arrival so a key press plays the beat. */
export const BEATS: { key: string; label: string; route: string; seq?: SeqName }[] = [
  { key: "1", label: "Sign in", route: "/signin" },
  { key: "2", label: "Firm map", route: href("/map"), seq: "tour" },
  { key: "3", label: "The ask", route: href("/requests/new"), seq: "ask" },
  { key: "4", label: "Questions and scope", route: href("/requests/r-7"), seq: "scope" },
  { key: "5", label: "Building the agent", route: href("/agents/cim-screener/build"), seq: "build" },
  { key: "6", label: "Security review", route: href("/agents/cim-screener") },
  { key: "7", label: "Deploy", route: href("/agents/cim-screener/deploy") },
  { key: "8", label: "In action", route: href("/agents/cim-screener/run"), seq: "run" },
  { key: "9", label: "Close", route: href("?end=1") },
]

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable || !!el.closest("[cmdk-root]")
}

/** Global keys: 1–9 beats, Space pause/resume, Shift+R reset, Shift+F recording mode, Shift+D theme. */
export function KeyboardShortcuts() {
  const router = useRouter()
  const pathname = usePathname()
  const reset = useDemo((s) => s.reset)
  const togglePause = useDemo((s) => s.togglePause)
  const toggleRec = useDemo((s) => s.toggleRec)
  const startSeq = useDemo((s) => s.startSeq)
  const setEndCard = useDemo((s) => s.setEndCard)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTyping(e.target)) return
      if (e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault()
        const wasRec = useDemo.getState().rec
        reset()
        router.push("/signin")
        if (!wasRec) toast("Demo reset", { description: "Back to the start of beat 1. Readiness 38%, no agent requested, Day 12 of 30." })
        return
      }
      if (e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault()
        const next = !useDemo.getState().rec
        toggleRec()
        if (!next) toast("Recording mode off", { description: "Sequences back to 1×." })
        return
      }
      if (e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault()
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        return
      }
      if (e.shiftKey) return
      if (e.key === " ") {
        if (togglePause()) e.preventDefault()
        return
      }
      const beat = BEATS.find((b) => b.key === e.key)
      if (!beat) return
      e.preventDefault()
      if (beat.key === "9") {
        setEndCard(true)
        if (pathname !== href()) router.push(href())
        return
      }
      if (pathname !== beat.route) router.push(beat.route)
      if (beat.seq) {
        const st = useDemo.getState().seq[beat.seq]
        if (st === "idle" || st === "done") setTimeout(() => startSeq(beat.seq!), 450)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router, pathname, reset, togglePause, toggleRec, startSeq, setEndCard, resolvedTheme, setTheme])

  React.useEffect(() => {
    BEATS.forEach((b) => router.prefetch(b.route))
    router.prefetch(href("/requests"))
    router.prefetch(href("/agents"))
  }, [router])

  return null
}

/** `?rec=1` turns recording mode on, for the tooling that cannot press Shift+F. */
function RecParam() {
  const params = useSearchParams()
  const setRec = useDemo((s) => s.setRec)
  React.useEffect(() => {
    if (params.get("rec") === "1") setRec(true)
  }, [params, setRec])
  return null
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      closeButton
      duration={3200}
      toastOptions={{ classNames: { toast: "!rounded-lg !border !bg-card !text-foreground !shadow-lg !border-border", description: "!text-muted-foreground" } }}
    />
  )
}

/** Rehydrates the persisted store after mount so server and client markup match. */
export function Hydrator() {
  React.useEffect(() => {
    useDemo.persist.rehydrate()
    if (!useDemo.getState().hydrated) useDemo.setState({ hydrated: true })
  }, [])
  return null
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const rec = useDemo((s) => s.rec)

  return (
    <TooltipProvider delayDuration={300}>
      <Hydrator />
      <KeyboardShortcuts />
      <React.Suspense fallback={null}>
        <RecParam />
      </React.Suspense>
      <div className={cn("flex h-screen w-full overflow-hidden bg-background", rec && "rec-mode")}>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenPalette={() => setPaletteOpen(true)} />
          <main className="min-h-0 flex-1 overflow-auto scrollbar-thin">
            <RouteTransition>{children}</RouteTransition>
          </main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ThemedToaster />
    </TooltipProvider>
  )
}
