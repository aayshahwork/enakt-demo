"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Cloud, Loader2 } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { EMark, Wordmark } from "@/components/demo/logo"
import { Hydrator, KeyboardShortcuts } from "@/components/shell/app-shell"
import { CURRENT_USER, TRUST, WORKSPACE, href } from "@/lib/demo/fixtures"
import { useDemo } from "@/lib/demo/store"

/** Beat 1. Simulated, pre-filled. No real auth: the button waits 1.2s and lands on the overview. */
export default function SignInPage() {
  const router = useRouter()
  const rec = useDemo((s) => s.rec)
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    router.prefetch(href())
  }, [router])
  const go = () => {
    if (busy) return
    setBusy(true)
    setTimeout(() => router.push(href()), 1200)
  }
  return (
    <TooltipProvider>
      <Hydrator />
      <KeyboardShortcuts />
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex items-center gap-2">
            <EMark size={30} />
            <Wordmark />
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h1 className="font-display text-[20px] font-medium tracking-[-0.02em]">Sign in to {WORKSPACE.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your firm&apos;s Enakt workspace. Company sign-in only.</p>
            <label className="mt-5 block text-xs font-medium text-muted-foreground" htmlFor="email">
              Work email
            </label>
            <input id="email" readOnly value={CURRENT_USER.email} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button variant="signal" className="mt-4 w-full" onClick={go} id="signin" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />} {busy ? "Signing in…" : "Continue with company sign-in"}
            </Button>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Cloud className="h-3 w-3 text-verified" /> {TRUST.chips[0]} · {TRUST.chips[2]}
            </div>
          </div>
          {!rec && <p className="mt-4 text-center text-[11px] text-muted-foreground">Fictional firm · illustrative data · press 1–9 to play the beats</p>}
        </div>
      </div>
    </TooltipProvider>
  )
}
