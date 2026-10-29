import { cn } from "@/lib/utils"

/** 12-week freshness: one bar per week, filled when the source was edited. */
export function FreshnessSparkline({ data, className, color = "var(--signal)" }: { data: number[]; className?: string; color?: string }) {
  const w = 12 * 9
  return (
    <svg width={w} height={22} viewBox={`0 0 ${w} 22`} className={cn("shrink-0", className)} aria-hidden="true">
      {data.map((v, i) => (
        <rect key={i} x={i * 9} y={v ? 2 : 16} width={6} height={v ? 18 : 4} rx={1.5} fill={v ? color : "var(--border)"} />
      ))}
    </svg>
  )
}
