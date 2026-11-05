"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, CalendarRange, Check, ChevronRight, Cloud, Keyboard, LogOut, Moon, Search, Settings, ShieldCheck, Sun, User, UserX, Video } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ActorAvatar } from "@/components/demo/actor"
import { ACCESS_LOG, AGENTS, CR, CURRENT_USER, DEPLOYMENT, METER, MODEL, NOTIFICATIONS, REQUESTS, SOURCE_BY_ID, WORKSPACE, href, type SourceId } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { tween } from "@/lib/demo/sim"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  const parts = pathname.split("/").filter(Boolean).slice(1)
  const crumbs: { label: string; href?: string }[] = [{ label: WORKSPACE.short, href: href() }]
  if (parts.length === 0) return [...crumbs, { label: "Home" }]
  const LABEL: Record<string, string> = { requests: "Requests", map: "Map", readiness: "Readiness", connections: "Connections", policies: "Policies", agents: "Agents", rollout: "Rollout", audit: "Audit log", settings: "Settings" }
  const [section, id] = parts
  crumbs.push({ label: LABEL[section] ?? section, href: id ? href(`/${section}`) : undefined })
  if (id) {
    if (section === "requests") {
      const r = REQUESTS.find((x) => x.id === id)
      crumbs.push({ label: r ? `${r.label} · ${r.title.split(" · ")[0]}` : id.toUpperCase() })
    } else if (section === "connections") crumbs.push({ label: id === CR.slug ? `CR-${CR.number} · ${CR.title}` : id.toUpperCase() })
    else if (section === "agents") crumbs.push({ label: AGENTS[id]?.name ?? id })
    else crumbs.push({ label: SOURCE_BY_ID[id as SourceId]?.name ?? id })
  }
  return crumbs
}

function ReadyBar() {
  const target = useDemo((s) => s.progress)
  const live = useDemo((s) => s.liveAgents.length)
  const hydrated = useDemo((s) => s.hydrated)
  const [shown, setShown] = React.useState(target)
  const prev = React.useRef(target)
  const settled = React.useRef(false)
  React.useEffect(() => {
    if (prev.current === target) return
    const from = prev.current
    prev.current = target
    // The first change after hydration is the persisted value landing, not an event: no tween.
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
  const after = target >= METER.after
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="hidden shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md border bg-card px-2.5 py-1 shadow-sm lg:flex" aria-label={`Firm AI-ready: ${pct}%`}>
          <span className="text-xs text-muted-foreground">
            <span className="hidden 2xl:inline">Firm </span>AI-ready
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted 2xl:w-24">
            <div className={cn("h-full rounded-full transition-colors duration-500", after ? "bg-verified" : "bg-signal")} style={{ width: `${shown}%` }} />
          </div>
          <span className={cn("w-8 text-right font-mono text-xs font-medium tabular", after ? "text-verified" : "text-signal")}>{pct}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {live} agent{live === 1 ? "" : "s"} live · {after ? 4 : 0} of {METER.total} sources connected to a scoped agent · weighted by readiness and owners confirmed
      </TooltipContent>
    </Tooltip>
  )
}

function DayChip() {
  const merged = useDemo((s) => s.crStatus === "merged")
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href("/rollout")} className="hidden h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-2.5 text-[11px] font-medium shadow-sm transition-colors hover:bg-accent lg:inline-flex" aria-label="Rollout day 12 of 30">
          <CalendarRange className="h-3 w-3 text-signal" />
          Day {DEPLOYMENT.day}<span className="hidden 2xl:inline"> of {DEPLOYMENT.totalDays}</span><span className="2xl:hidden">/{DEPLOYMENT.totalDays}</span>
          {merged && <Check className="h-3 w-3 text-verified" />}
        </Link>
      </TooltipTrigger>
      <TooltipContent>30-day rollout. Installed {DEPLOYMENT.installedOn}. Open the plan.</TooltipContent>
    </Tooltip>
  )
}

function AccessChart() {
  const w = 220
  const h = 56
  const n = ACCESS_LOG.length
  const step = w / n
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block" aria-label="Access attempts by Enakt Inc. accounts per day, flat at zero">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} x2={w} y1={h - 14 - f * (h - 18)} y2={h - 14 - f * (h - 18)} stroke="var(--border)" strokeDasharray="2 3" />
      ))}
      <line x1={0} x2={w} y1={h - 14} y2={h - 14} stroke="var(--verified)" strokeWidth={2} />
      {ACCESS_LOG.map((d, i) => (
        <g key={i}>
          <rect x={i * step + 3} y={h - 16} width={step - 6} height={2} fill="var(--verified)" opacity={0.5} />
          {(i === 0 || i === n - 1) && (
            <text x={i * step + step / 2} y={h - 2} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {d.day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function EnvStrip() {
  const chip = "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-verified/30 bg-verified-soft/70 px-2 text-[11px] font-medium text-verified 2xl:px-2.5"
  return (
    <div className="hidden items-center gap-1 xl:flex 2xl:gap-1.5" aria-label="Environment">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={chip}>
            <Cloud className="h-3 w-3" /> Runs in Calloway Hill&apos;s Azure tenant
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {DEPLOYMENT.tenant}, {DEPLOYMENT.region}. Installed {DEPLOYMENT.installedOn} by {DEPLOYMENT.installedBy}.
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={chip}>
            <ShieldCheck className="h-3 w-3" /> {MODEL.name} · {MODEL.note}
          </span>
        </TooltipTrigger>
        <TooltipContent>Model calls stay inside the tenant. Prompts and outputs are not used for training.</TooltipContent>
      </Tooltip>
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chip, "transition-colors hover:bg-verified-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")} aria-label="Enakt Inc. access log">
            <UserX className="h-3 w-3" /> Enakt Inc.: no access
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[276px] p-0">
          <div className="border-b px-4 py-2.5">
            <div className="text-sm font-medium">Access log · Enakt Inc. accounts</div>
            <div className="text-xs text-muted-foreground">Sign-ins and data reads per day since install</div>
          </div>
          <div className="px-4 pt-3">
            <AccessChart />
          </div>
          <div className="flex items-baseline gap-2 px-4 pb-3 pt-1">
            <span className="font-display text-2xl font-medium tracking-[-0.03em] tabular">0</span>
            <span className="text-xs text-muted-foreground">accounts, sign-ins or reads. Flat since install {DEPLOYMENT.installedOn.replace(", 2026", "")}. Egress to Enakt blocked at the tenant.</span>
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
  const notificationsRead = useDemo((s) => s.notificationsRead)
  const readNotifications = useDemo((s) => s.readNotifications)
  const toggleRec = useDemo((s) => s.toggleRec)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const crumbs = crumbsFor(pathname)
  const unread = notificationsRead ? 0 : NOTIFICATIONS.length

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

      <EnvStrip />
      <ReadyBar />
      <DayChip />

      <button
        onClick={onOpenPalette}
        className="flex h-8 shrink-0 items-center gap-2 rounded-md border bg-card px-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 2xl:w-44 2xl:px-2.5"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden flex-1 text-left text-xs 2xl:block">Jump to…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground 2xl:block">⌘K</kbd>
      </button>

      <DropdownMenu onOpenChange={(o) => o && readNotifications()}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-abort px-1 text-[10px] font-semibold leading-none text-white">
                {!rec && <span className="absolute inset-0 animate-ping rounded-full bg-abort/60" />}
                <span className="relative">{unread}</span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {NOTIFICATIONS.map((n) => (
            <DropdownMenuItem key={n.id} onSelect={() => router.push(n.href)} className="items-start gap-2 py-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
              <span className="flex-1">
                <span className="block text-sm leading-5">{n.text}</span>
                <span className="block text-xs text-muted-foreground">{relativeTime(n.at)}</span>
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push(href("/audit"))} className="justify-center text-xs text-muted-foreground">
            View audit log
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
              <div className="truncate text-xs text-muted-foreground">
                {CURRENT_USER.role} · {CURRENT_USER.email}
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push(href("/settings?tab=members"))}>
            <User /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push(href("/settings"))}>
            <Settings /> Workspace settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
            {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            <DropdownMenuShortcut>⇧D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleRec}>
            <Video /> {rec ? "Exit recording mode" : "Recording mode"}
            <DropdownMenuShortcut>⇧F</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast("Shortcuts", { description: "1–7 Home, Request, Map, Readiness, CR-7, Policies, Agent run · 8 Rollout · Space pause · ⇧R reset · ⇧F recording · ⇧D theme · ⌘K search." })}>
            <Keyboard /> Keyboard shortcuts
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => toast("Signed out (demo)", { description: "You are still Dana Ruiz. Nothing left the tenant." })} className="text-muted-foreground">
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
