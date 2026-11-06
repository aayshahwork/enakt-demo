"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { TIMING } from "@/lib/demo/sim"

const isCanvasRoute = (p: string) => /\/(requests\/r-7|map)(\/|$)/.test(p)

function PageSkeleton({ kind }: { kind: string }) {
  if (kind === "map") {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="flex-1" />
      </div>
    )
  }
  if (kind === "request") {
    return (
      <div className="grid h-full grid-cols-[42%_1fr] gap-0">
        <div className="space-y-3 border-r p-5">
          <Skeleton className="h-24" />
          <Skeleton className="h-28" />
          <Skeleton className="mt-2 h-[360px]" />
        </div>
        <Skeleton className="m-5 h-auto" />
      </div>
    )
  }
  if (kind === "split") {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-4">
          <Skeleton className="h-[440px]" />
          <Skeleton className="h-[440px]" />
        </div>
      </div>
    )
  }
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-40" />
    </div>
  )
}

/**
 * Shows a page-shaped skeleton for a fixed beat on route change. Moving between the request
 * and the map skips it so the shared canvas stays mounted and never re-renders.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(false)
  const first = React.useRef(true)
  const prev = React.useRef(pathname)

  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prev.current === pathname) return
    const from = prev.current
    prev.current = pathname
    if (isCanvasRoute(from) && isCanvasRoute(pathname)) return
    setLoading(true)
    const t = setTimeout(() => setLoading(false), TIMING.routeSkeletonMs)
    return () => clearTimeout(t)
  }, [pathname])

  const kind = pathname.includes("/map") ? "map" : pathname.includes("/requests/r-7") ? "request" : pathname.includes("/agents/") ? "split" : "page"

  return (
    <div className="relative h-full min-h-0">
      {loading ? <PageSkeleton kind={kind} /> : <div className="h-full min-h-0 animate-in fade-in-0 duration-200">{children}</div>}
    </div>
  )
}
