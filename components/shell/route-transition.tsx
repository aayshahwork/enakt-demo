"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { TIMING } from "@/lib/demo/sim"

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
  if (kind === "intake") {
    return (
      <div className="grid h-full grid-cols-[1fr_380px] gap-6 p-6">
        <div className="space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="mt-4 h-[420px]" />
        </div>
        <Skeleton className="h-full" />
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

/** Shows a page-shaped skeleton for a fixed beat on every route change. */
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
    prev.current = pathname
    setLoading(true)
    const t = setTimeout(() => setLoading(false), TIMING.routeSkeletonMs)
    return () => clearTimeout(t)
  }, [pathname])

  const kind = pathname.includes("/map") ? "map" : pathname.includes("/intake") ? "intake" : "page"

  return (
    <div className="relative h-full min-h-0">
      {loading ? <PageSkeleton kind={kind} /> : <div className="h-full min-h-0 animate-in fade-in-0 duration-200">{children}</div>}
    </div>
  )
}
