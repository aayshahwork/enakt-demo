"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, FlaskConical, Inbox, LayoutDashboard, Map as MapIcon, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EMark, Wordmark } from "@/components/demo/logo"
import { ActorAvatar } from "@/components/demo/actor"
import { CURRENT_USER, WORKSPACE, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export const NAV = [
  { href: href(), label: "Overview", icon: LayoutDashboard, exact: true },
  { href: href("/map"), label: "Firm map", icon: MapIcon },
  { href: href("/requests"), label: "Requests", icon: Inbox },
  { href: href("/agents"), label: "Agents", icon: Bot },
]

export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useDemo((s) => s.sidebarCollapsed)
  const setSidebar = useDemo((s) => s.setSidebar)
  const rec = useDemo((s) => s.rec)
  const heroStage = useDemo((s) => s.heroStage)

  return (
    <aside className={cn("group/sidebar flex h-full shrink-0 flex-col border-r bg-[var(--sidebar)] transition-[width] duration-200", collapsed ? "w-[60px]" : "w-[232px]", "max-[1100px]:w-[60px]")} data-collapsed={collapsed}>
      <div className={cn("flex h-14 items-center gap-2 px-3", collapsed && "justify-center px-0")}>
        <EMark size={28} />
        {!collapsed && <Wordmark className="max-[1100px]:hidden" />}
      </div>

      <div className={cn("px-2", collapsed && "px-1.5")}>
        <div className={cn("flex w-full items-center gap-2 rounded-lg border bg-card px-2 py-1.5 text-left text-sm shadow-sm", collapsed && "justify-center px-0")}>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-signal text-[11px] font-semibold text-white dark:text-ink">K</span>
          {!collapsed && <span className="min-w-0 flex-1 truncate font-medium max-[1100px]:hidden">{WORKSPACE.name}</span>}
        </div>
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
              {!collapsed && item.label === "Agents" && heroStage === "review" && (
                <span className="rounded-full bg-merged-soft px-1.5 text-[10px] font-semibold tabular text-merged max-[1100px]:hidden" title="CIM screener is ready for review">
                  1
                </span>
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
        {!rec && (
          <div className={cn("flex items-center gap-1.5 rounded-md border border-dashed border-flagged/40 bg-flagged-soft/60 px-2 py-1 text-[11px] font-medium text-flagged", collapsed && "justify-center px-1.5", "max-[1100px]:justify-center max-[1100px]:px-1.5")} title="Fictional firm: every person, deal and number is illustrative">
            <FlaskConical className="h-3 w-3 shrink-0" />
            {!collapsed && <span className="max-[1100px]:hidden">Fictional firm · illustrative data</span>}
          </div>
        )}
        <div className={cn("flex items-center gap-2 rounded-md px-1 py-1", collapsed && "justify-center px-0")}>
          <ActorAvatar id={CURRENT_USER.id} size="sm" />
          {!collapsed && (
            <div className="min-w-0 max-[1100px]:hidden">
              <div className="truncate text-xs font-medium leading-4">{CURRENT_USER.name}</div>
              <div className="truncate text-[11px] leading-4 text-muted-foreground">{CURRENT_USER.role}</div>
            </div>
          )}
        </div>
        {!rec && (
          <button onClick={() => setSidebar(!collapsed)} className="flex h-7 w-full items-center justify-center gap-2 rounded-md text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-[1100px]:hidden" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>
    </aside>
  )
}
