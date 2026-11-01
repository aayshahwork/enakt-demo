"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, RotateCcw, Sun, Video } from "lucide-react"
import { toast } from "sonner"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { ActorAvatar } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill } from "@/components/demo/verdict-pill"
import { AGENTS, PEOPLE, SOURCES, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { NAV } from "./sidebar"

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()
  const reset = useDemo((s) => s.reset)
  const toggleRec = useDemo((s) => s.toggleRec)
  const rec = useDemo((s) => s.rec)
  const nodes = useDemo((s) => s.nodes)
  const intakeDone = useDemo((s) => s.intakePhase === "done")
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
      <CommandInput placeholder="Jump to a page, source, or person…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          {NAV.map((n) => (
            <CommandItem key={n.href} value={`page ${n.label}`} onSelect={() => go(n.href)}>
              <n.icon className="text-muted-foreground" />
              {n.label}
              {n.key && <CommandShortcut>{n.key}</CommandShortcut>}
            </CommandItem>
          ))}
          <CommandItem value="page merge request mr-14" onSelect={() => go(href("/build/mr-14"))}>
            <span className="font-mono text-xs text-muted-foreground">MR-14</span>
            Bring Onboarding and Billing into the firm brain
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Sources">
          {SOURCES.map((s) => {
            const verdict = intakeDone ? s.verdict : (nodes[s.id]?.verdict ?? "unchecked")
            return (
              <CommandItem key={s.id} value={`source ${s.name} ${s.type} ${s.verdict}`} onSelect={() => go(href(`/map?source=${s.id}`))}>
                <SourceIcon type={s.type} size={14} />
                <span className="flex-1 truncate">{s.name}</span>
                <VerdictPill verdict={verdict} icon={false} />
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandGroup heading="People">
          {Object.values(PEOPLE)
            .filter((p) => p.kind === "person")
            .map((p) => (
              <CommandItem key={p.id} value={`person ${p.name} ${p.role}`} onSelect={() => go(href(`/build?owner=${p.id}`))}>
                <ActorAvatar id={p.id} size="xs" />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.role}</span>
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandGroup heading="Agents">
          {Object.values(AGENTS).map((a) => (
            <CommandItem key={a.id} value={`agent ${a.name} ${a.role}`} onSelect={() => go(href(`/agents/${a.id}`))}>
              <ActorAvatar id={a.id} size="xs" />
              <span className="flex-1 truncate font-mono text-[13px]">{a.name}</span>
              <span className="text-xs text-muted-foreground">{a.role}</span>
            </CommandItem>
          ))}
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
          <CommandItem value="reset demo state" onSelect={() => { reset(); onOpenChange(false); toast("Demo reset", { description: "Canvas cleared, MR-14 reopened, brain back to 38%." }) }}>
            <RotateCcw className="text-muted-foreground" />
            Reset demo state
            <CommandShortcut>⇧R</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
