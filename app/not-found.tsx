import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
      <div className="font-display text-2xl font-medium">Nothing here</div>
      <p className="text-sm text-muted-foreground">That page is not part of the Ashcombe workspace.</p>
      <Link href="/ashcombe" className="text-sm text-signal underline-offset-4 hover:underline">
        Back to Overview
      </Link>
    </div>
  )
}
