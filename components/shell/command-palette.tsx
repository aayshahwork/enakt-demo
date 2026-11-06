"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, RotateCcw, Sun, Video } from "lucide-react"
import { toast } from "sonner"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { ColourPill } from "@/components/demo/status-pill"
import { CURRENT_USER, SOURCES, colourFor, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { BEATS } from "./app-shell"

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()
  const reset = useDemo((s) => s.reset)
  const toggleRec = useDemo((s) => s.toggleRec)
  const rec = useDemo((s) => s.rec)
  const overrides = useDemo((s) => s.overrides)
  const startSeq = useDemo((s) => s.startSeq)
  const setEndCard = useDemo((s) => s.setEndCard)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  const go = (to: string) => {
    onOpenChange(false)
    router.push(to)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to a beat or a source…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Beats">
          {BEATS.map((b) => (
            <CommandItem
              key={b.key}
              value={`beat ${b.key} ${b.label}`}
              onSelect={() => {
                if (b.key === "9") {
                  setEndCard(true)
                  go(href())
                  return
                }
                go(b.route)
                if (b.seq) setTimeout(() => startSeq(b.seq!), 450)
              }}
            >
              <span className="w-4 font-mono text-xs text-muted-foreground">{b.key}</span>
              {b.label}
              <CommandShortcut>{b.key}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Sources">
          {SOURCES.map((s) => {
            const colour = colourFor(s.id, CURRENT_USER.id, overrides)
            return (
              <CommandItem key={s.id} value={`source ${colour === "black" ? "restricted" : s.name} ${s.system}`} onSelect={() => go(href(`/map?source=${s.id}`))}>
                <span className="flex-1 truncate">{colour === "black" ? "Restricted source" : s.name}</span>
                <ColourPill colour={colour} />
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem value="toggle theme dark light" onSelect={() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); onOpenChange(false) }}>
            {resolvedTheme === "dark" ? <Sun className="text-muted-foreground" /> : <Moon className="text-muted-foreground" />}
            Toggle dark mode
            <CommandShortcut>⇧D</CommandShortcut>
          </CommandItem>
          <CommandItem value="recording mode" onSelect={() => { toggleRec(); onOpenChange(false) }}>
            <Video className="text-muted-foreground" />
            {rec ? "Exit recording mode" : "Recording mode"}
            <CommandShortcut>⇧F</CommandShortcut>
          </CommandItem>
          <CommandItem value="reset demo state" onSelect={() => { reset(); onOpenChange(false); router.push("/signin"); toast("Demo reset", { description: "Back to the start of beat 1." }) }}>
            <RotateCcw className="text-muted-foreground" />
            Reset demo state
            <CommandShortcut>⇧R</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
