import { cn } from "@/lib/utils"

export function EMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("shrink-0", className)}>
      <rect width="32" height="32" rx="8" className="fill-ink" />
      <g className="fill-paper">
        <rect x="9.5" y="8" width="14" height="3.4" rx="1.7" />
        <rect x="9.5" y="8" width="3.4" height="16" rx="1.7" />
        <rect x="9.5" y="14.3" width="10" height="3.4" rx="1.7" />
        <rect x="9.5" y="20.6" width="14" height="3.4" rx="1.7" />
      </g>
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-logo text-lg font-semibold leading-none tracking-[-0.015em] text-ink", className)}>Enakt</span>
}
