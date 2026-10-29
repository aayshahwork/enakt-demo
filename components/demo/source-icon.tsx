import type { SourceType } from "@/lib/demo/fixtures"
import { cn } from "@/lib/utils"

/** Vendor marks drawn as simple monochrome-tinted glyphs. No trademarked assets. */
const META: Record<SourceType, { bg: string; fg: string; glyph: React.ReactNode }> = {
  salesforce: {
    bg: "#dbeafe",
    fg: "#1d4ed8",
    glyph: (
      <path d="M7.5 15.5a3 3 0 0 1-.6-5.94A3.5 3.5 0 0 1 12.7 7.5a3 3 0 0 1 4.8 1.2A2.75 2.75 0 1 1 17 14.5h-9.5z" fill="currentColor" />
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
  sheets: {
    bg: "#dcfce7",
    fg: "#16a34a",
    glyph: (
      <>
        <path d="M6 3h8l4 4v14H6z" fill="currentColor" opacity="0.18" />
        <path d="M8 11h8v7H8zM8 13.3h8M8 15.6h8M11 11v7" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </>
    ),
  },
  airtable: {
    bg: "#fef3c7",
    fg: "#b45309",
    glyph: (
      <>
        <path d="M12 4l8 3-8 3-8-3z" fill="currentColor" />
        <path d="M4 9l8 3v8l-8-3z" fill="currentColor" opacity="0.6" />
        <path d="M20 9l-8 3v8l8-3z" fill="currentColor" opacity="0.35" />
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
  schwab: {
    bg: "#e0f2fe",
    fg: "#0369a1",
    glyph: (
      <>
        <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.18" />
        <path d="M9 15.5l2-7h2l2 7M10 13h4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  quickbooks: {
    bg: "#dcfce7",
    fg: "#166534",
    glyph: (
      <>
        <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.18" />
        <path d="M10 8.5a3.5 3.5 0 1 0 0 7h1V8.5zM14 15.5a3.5 3.5 0 1 0 0-7h-1v7z" fill="currentColor" />
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
