"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, ChevronRight, LogOut, Moon, Search, Sun, User, Settings, Keyboard } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ActorAvatar } from "@/components/demo/actor"
import { CURRENT_USER, NOTIFICATIONS, SOURCE_BY_SLUG, WORKSPACE } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"
import { ConsolidationBar } from "./consolidation-bar"

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  const parts = pathname.split("/").filter(Boolean).slice(1) // drop "northfield"
  const crumbs: { label: string; href?: string }[] = [{ label: WORKSPACE.short, href: "/northfield" }]
  if (parts.length === 0) return [...crumbs, { label: "Overview" }]
  const LABEL: Record<string, string> = {
    intake: "Intake",
    map: "Map",
    sources: "Sources",
    "merge-requests": "Merge requests",
    access: "Access",
    activity: "Activity",
    settings: "Settings",
  }
  const [section, id] = parts
  crumbs.push({ label: LABEL[section] ?? section, href: id ? `/northfield/${section}` : undefined })
  if (id) {
    if (section === "sources") crumbs.push({ label: SOURCE_BY_SLUG[id]?.name ?? id })
    else if (section === "merge-requests") crumbs.push({ label: `MR-${id}` })
    else crumbs.push({ label: id })
  }
  return crumbs
}

export function Topbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { state, dispatch } = useDemo()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const crumbs = crumbsFor(pathname)
  const unread = state.notificationsRead ? 0 : NOTIFICATIONS.length

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
            {c.href ? (
              <Link href={c.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-medium">{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex-1" />

      <ConsolidationBar />

      <button
        onClick={onOpenPalette}
        className="hidden h-8 w-56 items-center gap-2 rounded-md border bg-card px-2.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left text-xs">Search or jump to…</span>
        <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
      </button>

      <DropdownMenu onOpenChange={(o) => o && dispatch({ type: "notifications:read" })}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-abort px-1 text-[10px] font-semibold leading-none text-white">
                {!state.rec && <span className="absolute inset-0 animate-ping rounded-full bg-abort/60" />}
                <span className="relative">{unread}</span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
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
          <DropdownMenuItem onSelect={() => router.push("/northfield/activity")} className="justify-center text-xs text-muted-foreground">
            View all activity
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Account menu">
            <ActorAvatar id={CURRENT_USER.id} size="md" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <div className="flex items-center gap-2 px-2 py-2">
            <ActorAvatar id={CURRENT_USER.id} size="md" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{CURRENT_USER.name}</div>
              <div className="truncate text-xs text-muted-foreground">{CURRENT_USER.role} · {CURRENT_USER.email}</div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/northfield/settings")}>
            <User /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/northfield/settings")}>
            <Settings /> Workspace settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
            {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            <DropdownMenuShortcut>⇧D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast("Shortcuts", { description: "1–5 jump to Intake, Map, Salesforce, MR-12, Access. ⌘K search. Shift+R reset." })}>
            <Keyboard /> Keyboard shortcuts
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => toast("Signed out (demo)", { description: "You are still Dana Ruiz. Nothing left the browser." })} className={cn("text-muted-foreground")}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
