import { Database, Files, FolderLock, Landmark, Mail, Table2 } from "lucide-react"
import type { SourceType } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"

/** Generic Lucide glyphs, tinted per system. No vendor logos. */
const META: Record<SourceType, { bg: string; fg: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  datasite: { bg: "#e9eff6", fg: "#16456b", icon: FolderLock },
  sharepoint: { bg: "#e8f0eb", fg: "#2e6f4e", icon: Files },
  dealcloud: { bg: "#ede8f8", fg: "#6b4fbb", icon: Database },
  excel: { bg: "#e4f1e6", fg: "#1f7a3a", icon: Table2 },
  fundadmin: { bg: "#f5eedb", fg: "#9a6b00", icon: Landmark },
  outlook: { bg: "#e4ecf7", fg: "#2b5797", icon: Mail },
}

export function SourceIcon({ type, size = 20, className }: { type: SourceType; size?: number; className?: string }) {
  const m = META[type]
  const Icon = m.icon
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-md", className)} style={{ width: size * 1.4, height: size * 1.4, background: m.bg, color: m.fg }} aria-hidden="true">
      <Icon style={{ width: size * 0.72, height: size * 0.72 }} />
    </span>
  )
}
