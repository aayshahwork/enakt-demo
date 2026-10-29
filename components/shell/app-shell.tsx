"use client"

import * as React from "react"
import { Toaster } from "sonner"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DemoProvider, KeyboardShortcuts, RecModeReader } from "@/lib/demo/store"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { CommandPalette } from "./command-palette"
import { RouteTransition } from "./route-transition"

function ThemeShortcut() {
  const { resolvedTheme, setTheme } = useTheme()
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && e.key === "D") {
        e.preventDefault()
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [resolvedTheme, setTheme])
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const onReset = React.useCallback(() => {
    toast("Demo reset", { description: "Intake cleared, MR-12 reopened, consolidation back to 34%." })
  }, [])

  return (
    <DemoProvider>
      <TooltipProvider delayDuration={300}>
        <React.Suspense fallback={null}>
          <RecModeReader />
        </React.Suspense>
        <KeyboardShortcuts onReset={onReset} />
        <ThemeShortcut />
        <div className="flex h-screen w-full overflow-hidden bg-background">
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
    </DemoProvider>
  )
}
