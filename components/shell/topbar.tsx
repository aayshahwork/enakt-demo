"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CalendarRange, Check, ChevronRight, Circle, Cloud, Cpu, Keyboard, LogOut, Moon, Search, Sun, UserX, Video } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar } from "@/components/demo/actor"
import { CURRENT_USER, HERO, ROLLOUT, TRUST, WORKSPACE, href } from "@/lib/demo/fixtures"
import { tween } from "@/lib/demo/sim"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  const parts = pathname.split("/").filter(Boolean).slice(1)
  const crumbs: { label: string; href?: string }[] = [{ label: WORKSPACE.short, href: href() }]
  if (parts.length === 0) return [...crumbs, { label: "Overview" }]
  const LABEL: Record<string, string> = { map: "Firm map", requests: "Requests", agents: "Agents" }
  const [section, id, sub] = parts
  crumbs.push({ label: LABEL[section] ?? section, href: id ? href(`/${section}`) : undefined })
  if (id) {
    const idLabel = section === "requests" ? (id === "new" ? "New request" : `${id.toUpperCase()} · Screen every inbound CIM`) : id === HERO.id ? HERO.name : id
    crumbs.push({ label: idLabel, href: sub ? href(`/${section}/${id}`) : undefined })
    if (sub) crumbs.push({ label: sub === "build" ? "Build" : sub === "deploy" ? "Deploy" : sub === "run" ? "Project Juniper" : sub })
  }
  return crumbs
}

function ReadinessBar() {
  const target = useDemo((s) => s.readiness)
  const hydrated = useDemo((s) => s.hydrated)
  const [shown, setShown] = React.useState(target)
  const prev = React.useRef(target)
  const settled = React.useRef(false)
  React.useEffect(() => {
    if (prev.current === target) return
    const from = prev.current
    prev.current = target
    if (!settled.current) {
      setShown(target)
      return
    }
    return tween(from, target, 1100, setShown)
  }, [target])
  React.useEffect(() => {
    if (hydrated) settled.current = true
  }, [hydrated])
  const pct = Math.round(shown)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href()} className="hidden shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md border bg-card px-2.5 py-1 shadow-sm lg:flex" aria-label={`Firm AI-readiness: ${pct}%`}>
          <span className="text-xs text-muted-foreground">AI-readiness</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted 2xl:w-24">
            <div className="h-full rounded-full bg-verified" style={{ width: `${shown}%` }} />
          </div>
          <span className="w-8 text-right font-mono text-xs font-medium tabular text-verified">{pct}%</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>How much of the firm&apos;s data is merged into the brain, weighted by how often it is used. Illustrative.</TooltipContent>
    </Tooltip>
  )
}

function RolloutChip() {
  const day = useDemo((s) => s.rolloutDay)
  const deployed = useDemo((s) => s.deployStatus === "deployed")
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn("hidden h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[11px] font-medium shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex", deployed ? "border-verified/40 bg-verified-soft text-verified" : "bg-card")} aria-label="Rollout progress">
          <CalendarRange className="h-3 w-3" />
          {deployed ? `First agent live · Day ${day} of ${ROLLOUT.total}` : `Day ${day} of ${ROLLOUT.total}`}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] p-0">
        <div className="border-b px-4 py-2.5">
          <div className="text-sm font-medium">30-day rollout</div>
          <div className="text-xs text-muted-foreground">Installed {ROLLOUT.installedOn} · today is Day {ROLLOUT.day}</div>
        </div>
        <ul className="px-3 py-2">
          {ROLLOUT.milestones.map((m) => {
            const done = m.done || (deployed && m.id === "deployed")
            return (
              <li key={m.id} className="flex items-center gap-2.5 px-1 py-1.5 text-sm">
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", done ? "border-verified bg-verified-soft text-verified" : "text-muted-foreground")}>{done ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2 fill-current" />}</span>
                <span className={cn("flex-1", !done && "text-muted-foreground")}>{m.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground tabular">Day {m.id === "deployed" && deployed ? day : m.day}</span>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function SignInChart() {
  const w = 220
  const h = 48
  const n = 12
  const step = w / n
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block" aria-label="Sign-ins by Enakt Inc. accounts per day, flat at zero">
      {[0.33, 0.66].map((f) => (
        <line key={f} x1={0} x2={w} y1={h - 14 - f * (h - 18)} y2={h - 14 - f * (h - 18)} stroke="var(--border)" strokeDasharray="2 3" />
      ))}
      <line x1={0} x2={w} y1={h - 14} y2={h - 14} stroke="var(--verified)" strokeWidth={2} />
      <text x={0} y={h - 2} fontSize={9} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
        Oct 24
      </text>
      <text x={w} y={h - 2} textAnchor="end" fontSize={9} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
        Nov 4
      </text>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={i * step + 3} y={h - 16} width={step - 6} height={2} fill="var(--verified)" opacity={0.5} />
      ))}
    </svg>
  )
}

function TrustStrip() {
  const chip = "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-verified/30 bg-verified-soft/70 px-2 text-[11px] font-medium text-verified 2xl:px-2.5"
  return (
    <div className="hidden items-center gap-1 xl:flex 2xl:gap-1.5" aria-label="Trust">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={chip}>
            <Cloud className="h-3 w-3" /> {TRUST.chips[0]}
          </span>
        </TooltipTrigger>
        <TooltipContent>Enakt is installed in Kestrel Ridge&apos;s own cloud account. No deal data leaves it.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={chip}>
            <Cpu className="h-3 w-3" /> {TRUST.chips[1]}
          </span>
        </TooltipTrigger>
        <TooltipContent>An open model on a GPU instance in the same account. The firm owns the intelligence.</TooltipContent>
      </Tooltip>
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chip, "transition-colors hover:bg-verified-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")} aria-label="Enakt Inc. access">
            <UserX className="h-3 w-3" /> {TRUST.chips[2]}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[268px] p-0">
          <div className="border-b px-4 py-2.5 text-sm font-medium">{TRUST.signIns}</div>
          <div className="px-4 pb-3 pt-3">
            <SignInChart />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function Topbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const rec = useDemo((s) => s.rec)
  const toggleRec = useDemo((s) => s.toggleRec)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const crumbs = crumbsFor(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2.5 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav aria-label="Breadcrumb" className="flex min-w-[96px] items-center gap-1 overflow-hidden whitespace-nowrap text-sm">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground/60", i === 1 && "hidden 2xl:block")} />}
            {c.href ? (
              <Link href={c.href} className={cn("shrink-0 text-muted-foreground transition-colors hover:text-foreground", i === 0 && "hidden 2xl:block")}>
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-medium">{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex-1" />

      <TrustStrip />
      <ReadinessBar />
      <RolloutChip />

      {!rec && (
        <button onClick={onOpenPalette} className="flex h-8 shrink-0 items-center gap-2 rounded-md border bg-card px-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 2xl:px-2.5" aria-label="Open command palette">
          <Search className="h-3.5 w-3.5" />
          <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground 2xl:block">⌘K</kbd>
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Account menu">
            <ActorAvatar id={CURRENT_USER.id} size="md" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="flex items-center gap-2 px-2 py-2">
            <ActorAvatar id={CURRENT_USER.id} size="md" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{CURRENT_USER.name}</div>
              <div className="truncate text-xs text-muted-foreground">{CURRENT_USER.email}</div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
            {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            <DropdownMenuShortcut>⇧D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleRec}>
            <Video /> {rec ? "Exit recording mode" : "Recording mode"}
            <DropdownMenuShortcut>⇧F</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast("Shortcuts", { description: "1–9 play the beats in order · Space pause · ⇧R reset · ⇧F recording · ⇧D theme · ⌘K search." })}>
            <Keyboard /> Keyboard shortcuts
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/signin")} className="text-muted-foreground">
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
