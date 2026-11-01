import { NOW } from "./fixtures"

export function relativeTime(date: Date, now: Date = NOW): string {
  const diff = now.getTime() - date.getTime()
  if (diff < 0) return "just now"
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

export function absoluteTime(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })
}

export function shortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })
}

export function timeOnly(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })
}

export function fmtInt(n: number): string {
  return n.toLocaleString("en-US")
}

export function fmtUSD(n: number): string {
  return "$" + n.toLocaleString("en-US")
}
