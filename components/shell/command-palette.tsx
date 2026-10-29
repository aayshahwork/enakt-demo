"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, RotateCcw, Sun } from "lucide-react"
import { toast } from "sonner"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { SourceIcon } from "@/components/demo/source-icon"
import { VerdictPill } from "@/components/demo/verdict-pill"
import { MR_LIST, SOURCES } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { NAV } from "./sidebar"

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()
  const { dispatch } = useDemo()
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

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to a page, source, or merge request…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          {NAV.map((n, i) => (
            <CommandItem key={n.href} value={`page ${n.label}`} onSelect={() => go(n.href)}>
              <n.icon className="text-muted-foreground" />
              {n.label}
              {i >= 1 && i <= 5 && n.label !== "Sources" && n.label !== "Merge requests" && <CommandShortcut>{i === 1 ? "1" : i === 2 ? "2" : "5"}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Sources">
          {SOURCES.map((s) => (
            <CommandItem key={s.slug} value={`source ${s.name} ${s.type} ${s.verdict}`} onSelect={() => go(`/northfield/sources/${s.slug}`)}>
              <SourceIcon type={s.type} size={14} />
              <span className="flex-1 truncate">{s.name}</span>
              <VerdictPill verdict={s.verdict} icon={false} />
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Merge requests">
          {MR_LIST.map((m) => (
            <CommandItem key={m.number} value={`mr ${m.number} ${m.title}`} onSelect={() => go(m.number === 12 ? "/northfield/merge-requests/12" : "/northfield/merge-requests")}>
              <span className="font-mono text-xs text-muted-foreground">MR-{m.number}</span>
              <span className="flex-1 truncate">{m.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem value="toggle theme dark light" onSelect={() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); onOpenChange(false) }}>
            {resolvedTheme === "dark" ? <Sun className="text-muted-foreground" /> : <Moon className="text-muted-foreground" />}
            Toggle dark mode
          </CommandItem>
          <CommandItem value="reset demo state" onSelect={() => { dispatch({ type: "reset" }); onOpenChange(false); toast("Demo reset", { description: "Intake cleared, MR-12 reopened, consolidation back to 34%." }) }}>
            <RotateCcw className="text-muted-foreground" />
            Reset demo state
            <CommandShortcut>⇧R</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
