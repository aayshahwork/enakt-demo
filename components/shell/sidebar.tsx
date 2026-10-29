"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Check, ChevronsUpDown, GitPullRequest, KeyRound, LayoutDashboard, Map as MapIcon, Database, Settings, Sparkles, PanelLeftClose, PanelLeftOpen, FlaskConical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EMark, Wordmark } from "@/components/demo/logo"
import { WORKSPACE } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export const NAV = [
  { href: "/northfield", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/northfield/intake", label: "Intake", icon: Sparkles },
  { href: "/northfield/map", label: "Map", icon: MapIcon },
  { href: "/northfield/sources", label: "Sources", icon: Database },
  { href: "/northfield/merge-requests", label: "Merge requests", icon: GitPullRequest, badge: 1 },
  { href: "/northfield/access", label: "Access", icon: KeyRound },
  { href: "/northfield/activity", label: "Activity", icon: Activity },
  { href: "/northfield/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { state, dispatch } = useDemo()
  const collapsed = state.sidebarCollapsed

  return (
    <aside
      className={cn(
        "group/sidebar flex h-full shrink-0 flex-col border-r bg-[var(--sidebar)] transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[232px]",
        "max-[1100px]:w-[60px]",
      )}
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-signal text-[11px] font-semibold text-white dark:text-ink">N</span>
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
              <span className="flex h-5 w-5 items-center justify-center rounded bg-signal text-[10px] font-semibold text-white dark:text-ink">N</span>
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
              {!collapsed && item.badge && state.mergeStatus !== "merged" && (
                <span className="rounded-full bg-signal-soft px-1.5 text-[10px] font-semibold tabular text-signal max-[1100px]:hidden">{item.badge}</span>
              )}
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
        {!state.rec && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-dashed border-flagged/40 bg-flagged-soft/60 px-2 py-1 text-[11px] font-medium text-flagged",
              collapsed && "justify-center px-1.5",
              "max-[1100px]:justify-center max-[1100px]:px-1.5",
            )}
            title="Demo workspace: all data is synthetic"
          >
            <FlaskConical className="h-3 w-3 shrink-0" />
            {!collapsed && <span className="max-[1100px]:hidden">Demo workspace</span>}
          </div>
        )}
        <button
          onClick={() => dispatch({ type: "sidebar", value: !collapsed })}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-md text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-[1100px]:hidden"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
