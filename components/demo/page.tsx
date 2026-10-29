import { cn } from "@/lib/utils"

export function PageHeader({ title, description, actions, className, eyebrow }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string; eyebrow?: React.ReactNode }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-medium text-muted-foreground">{eyebrow}</div>}
        <h1 className="font-display text-[22px] font-medium leading-7 tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action, className }: { title: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between border-b px-4 py-3", className)}>
      <h2 className="text-sm font-medium">{title}</h2>
      {action}
    </div>
  )
}

export function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: string }) {
  return (
    <Card className="px-4 py-3.5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-display text-[26px] font-medium leading-8 tracking-[-0.03em] tabular" style={accent ? { color: accent } : undefined}>
          {value}
        </div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
    </Card>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<{ className?: string }>; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
