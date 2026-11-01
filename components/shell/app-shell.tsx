"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Toaster, toast } from "sonner"
import { useTheme } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BRAIN, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { CommandPalette } from "./command-palette"
import { RouteTransition } from "./route-transition"

const SHORTCUT_ROUTES: Record<string, string> = {
  "1": href(),
  "2": href("/intake"),
  "3": href("/map"),
  "4": href("/build"),
  "5": href("/permissions"),
  "6": href("/agents/marcus-assistant"),
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable || !!el.closest("[cmdk-root]")
}

/** Global keys: 1–6 jump, Space pause/resume, Shift+R reset, Shift+F recording mode, Shift+D theme. */
function KeyboardShortcuts() {
  const router = useRouter()
  const pathname = usePathname()
  const reset = useDemo((s) => s.reset)
  const togglePause = useDemo((s) => s.togglePause)
  const toggleRec = useDemo((s) => s.toggleRec)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTyping(e.target)) return
      if (e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault()
        reset()
        toast("Demo reset", { description: `Canvas cleared, MR-14 reopened, brain back to ${BRAIN.before}%.` })
        return
      }
      if (e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault()
        const next = !useDemo.getState().rec
        toggleRec()
        toast(next ? "Recording mode on" : "Recording mode off", { description: next ? "Demo badge hidden, scripts at 1.5×." : "Scripts back to 1×." })
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
      const route = SHORTCUT_ROUTES[e.key]
      if (route) {
        e.preventDefault()
        if (pathname !== route) router.push(route)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router, pathname, reset, togglePause, toggleRec, resolvedTheme, setTheme])

  React.useEffect(() => {
    Object.values(SHORTCUT_ROUTES).forEach((r) => router.prefetch(r))
    router.prefetch(href("/build/mr-14"))
    router.prefetch(href("/audit"))
    router.prefetch(href("/settings"))
  }, [router])

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
      toastOptions={{
        classNames: {
          toast: "!rounded-lg !border !bg-card !text-foreground !shadow-lg !border-border",
          description: "!text-muted-foreground",
        },
      }}
    />
  )
}

/** Rehydrates the persisted store after mount so server and client markup match. */
function Hydrator() {
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
