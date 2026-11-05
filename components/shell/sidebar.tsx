"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, CalendarRange, Check, ChevronsUpDown, FlaskConical, GitPullRequest, Home, Inbox, KeyRound, ListChecks, Map as MapIcon, PanelLeftClose, PanelLeftOpen, ScrollText, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EMark, Wordmark } from "@/components/demo/logo"
import { ActorAvatar } from "@/components/demo/actor"
import { CURRENT_USER, WORKSPACE, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export const NAV = [
  { href: href(), label: "Home", icon: Home, exact: true, key: "1" },
  { href: href("/requests"), label: "Requests", icon: Inbox, key: "2" },
  { href: href("/map"), label: "Map", icon: MapIcon, key: "3" },
  { href: href("/readiness"), label: "Readiness", icon: ListChecks, key: "4" },
  { href: href("/connections"), label: "Connections", icon: GitPullRequest, key: "5", badge: "cr" as const },
  { href: href("/agents"), label: "Agents", icon: Bot, key: "7" },
  { href: href("/policies"), label: "Policies", icon: KeyRound, key: "6" },
  { href: href("/rollout"), label: "Rollout", icon: CalendarRange, key: "8" },
  { href: href("/audit"), label: "Audit log", icon: ScrollText },
  { href: href("/settings"), label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useDemo((s) => s.sidebarCollapsed)
  const setSidebar = useDemo((s) => s.setSidebar)
  const rec = useDemo((s) => s.rec)
  const crStatus = useDemo((s) => s.crStatus)

  return (
    <aside
      className={cn("group/sidebar flex h-full shrink-0 flex-col border-r bg-[var(--sidebar)] transition-[width] duration-200", collapsed ? "w-[60px]" : "w-[232px]", "max-[1100px]:w-[60px]")}
      data-collapsed={collapsed}
    >
      <div className={cn("flex h-14 items-center gap-2 px-3", collapsed && "justify-center px-0")}>
        <EMark size={28} />
        {!collapsed && <Wordmark className="max-[1100px]:hidden" />}
      </div>

      <div className={cn("px-2", collapsed && "px-1.5")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border bg-card px-2 py-1.5 text-left text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed && "justify-center px-0",
              )}
              aria-label="Switch workspace"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-signal text-[11px] font-semibold text-white dark:text-ink">C</span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate font-medium max-[1100px]:hidden">{WORKSPACE.name}</span>
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground max-[1100px]:hidden" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-signal text-[10px] font-semibold text-white dark:text-ink">C</span>
              <span className="flex-1 truncate">{WORKSPACE.name}</span>
              <Check className="h-4 w-4" />
            </DropdownMenuItem>
            {WORKSPACE.others.map((w) => (
              <DropdownMenuItem key={w.slug} disabled className="gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">{w.name[0]}</span>
                <span className="flex-1 truncate">{w.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Create workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className={cn("mt-3 flex flex-1 flex-col gap-0.5 px-2", collapsed && "px-1.5")} aria-label="Primary">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          const link = (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                collapsed && "justify-center px-0",
                "max-[1100px]:justify-center max-[1100px]:px-0",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-signal" : "")} />
              {!collapsed && <span className="flex-1 truncate max-[1100px]:hidden">{item.label}</span>}
              {!collapsed && item.badge === "cr" && crStatus !== "merged" && (
                <span className="rounded-full bg-signal-soft px-1.5 text-[10px] font-semibold tabular text-signal max-[1100px]:hidden" title="CR-7 is waiting for two approvals">
                  1
                </span>
              )}
              {!collapsed && item.key && !rec && <kbd className="font-mono text-[10px] text-muted-foreground/60 max-[1100px]:hidden">{item.key}</kbd>}
              {active && <span className="absolute -left-2 top-1.5 h-5 w-0.5 rounded-r bg-signal" />}
            </Link>
          )
          if (!collapsed) return link
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className={cn("flex flex-col gap-2 border-t p-2", collapsed && "items-center")}>
        {!rec && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-dashed border-flagged/40 bg-flagged-soft/60 px-2 py-1 text-[11px] font-medium text-flagged",
              collapsed && "justify-center px-1.5",
              "max-[1100px]:justify-center max-[1100px]:px-1.5",
            )}
            title="Synthetic firm: all people, deals and numbers are illustrative"
          >
            <FlaskConical className="h-3 w-3 shrink-0" />
            {!collapsed && <span className="max-[1100px]:hidden">Synthetic firm · illustrative data</span>}
          </div>
        )}
        <div className={cn("flex items-center gap-2 rounded-md px-1 py-1", collapsed && "justify-center px-0")}>
          <ActorAvatar id={CURRENT_USER.id} size="sm" />
          {!collapsed && (
            <div className="min-w-0 max-[1100px]:hidden">
              <div className="truncate text-xs font-medium leading-4">{CURRENT_USER.name}</div>
              <div className="truncate text-[11px] leading-4 text-muted-foreground">{CURRENT_USER.role} · admin</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebar(!collapsed)}
          className="flex h-7 w-full items-center justify-center gap-2 rounded-md text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-[1100px]:hidden"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
