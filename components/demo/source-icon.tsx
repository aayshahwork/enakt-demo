import type { SourceType } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"

/** Vendor marks drawn as simple tinted glyphs. No trademarked assets. */
const META: Record<SourceType, { bg: string; fg: string; glyph: React.ReactNode }> = {
  salesforce: {
    bg: "#dbeafe",
    fg: "#1d4ed8",
    glyph: <path d="M7.5 15.5a3 3 0 0 1-.6-5.94A3.5 3.5 0 0 1 12.7 7.5a3 3 0 0 1 4.8 1.2A2.75 2.75 0 1 1 17 14.5h-9.5z" fill="currentColor" />,
  },
  sharepoint: {
    bg: "#d1fae5",
    fg: "#047857",
    glyph: (
      <>
        <circle cx="10" cy="10" r="5" fill="currentColor" opacity="0.8" />
        <circle cx="15" cy="14" r="4" fill="currentColor" opacity="0.5" />
        <circle cx="9" cy="17" r="2.5" fill="currentColor" opacity="0.35" />
      </>
    ),
  },
  fileshare: {
    bg: "#fef3c7",
    fg: "#b45309",
    glyph: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" opacity="0.25" />
        <path d="M3 10h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" />
      </>
    ),
  },
  excel: {
    bg: "#dcfce7",
    fg: "#15803d",
    glyph: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.18" />
        <path d="M8.5 8l3.5 4-3.5 4h2l2.5-3 2.5 3h2l-3.5-4 3.5-4h-2l-2.5 3-2.5-3z" fill="currentColor" />
      </>
    ),
  },
  custodian: {
    bg: "#e0f2fe",
    fg: "#0369a1",
    glyph: (
      <>
        <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.18" />
        <path d="M8 15V9l4 4 4-4v6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  sqlserver: {
    bg: "#fee2e2",
    fg: "#b91c1c",
    glyph: (
      <>
        <ellipse cx="12" cy="7" rx="7" ry="3" fill="currentColor" />
        <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" fill="currentColor" opacity="0.35" />
        <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </>
    ),
  },
  oracle: {
    bg: "#ffe4e6",
    fg: "#be123c",
    glyph: (
      <>
        <rect x="3" y="7" width="18" height="10" rx="5" fill="currentColor" opacity="0.25" />
        <rect x="5.5" y="9.5" width="13" height="5" rx="2.5" fill="currentColor" />
      </>
    ),
  },
  postgres: {
    bg: "#e0e7ff",
    fg: "#3730a3",
    glyph: (
      <>
        <ellipse cx="12" cy="7" rx="7" ry="3" fill="currentColor" />
        <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" fill="currentColor" opacity="0.35" />
        <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </>
    ),
  },
  access: {
    bg: "#fce7f3",
    fg: "#9d174d",
    glyph: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.18" />
        <path d="M8 17l4-10 4 10M9.5 13.5h5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
  },
}

export function SourceIcon({ type, size = 20, className }: { type: SourceType; size?: number; className?: string }) {
  const m = META[type]
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-md", className)}
      style={{ width: size * 1.4, height: size * 1.4, background: m.bg, color: m.fg }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 24 24">
        {m.glyph}
      </svg>
    </span>
  )
}
