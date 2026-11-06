"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Map as MapIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActorAvatar, ActorName } from "@/components/demo/actor"
import { EMark, Wordmark } from "@/components/demo/logo"
import { Card, CardHeader, PageHeader, Stat } from "@/components/demo/page"
import { ColourDot, StagePill } from "@/components/demo/status-pill"
import { ACTIVITY, COLOUR_LABEL, CURRENT_USER, END_CARD, EMPLOYEE, HERO, HERO_REQUEST, OTHER_AGENTS, REQUEST_FEED, ROLLOUT, STAGES, countColours, href, type Colour, type Stage } from "@/lib/demo/fixtures"
import { relativeTime } from "@/lib/demo/format"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

const COLOURS: Colour[] = ["green", "yellow", "red", "black"]

/** `?end=1` shows the end card (beat 9). */
function EndParam() {
  const params = useSearchParams()
  const setEndCard = useDemo((s) => s.setEndCard)
  const router = useRouter()
  React.useEffect(() => {
    if (params.get("end") === "1") {
      setEndCard(true)
      router.replace(href(), { scroll: false })
    }
  }, [params, setEndCard, router])
  return null
}

function EndCard() {
  const endCard = useDemo((s) => s.endCard)
  const setEndCard = useDemo((s) => s.setEndCard)
  return (
    <AnimatePresence>
      {endCard && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 backdrop-blur-sm" onClick={() => setEndCard(false)} role="dialog" aria-label="End card">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }} className="text-center">
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              <EMark size={44} />
              <Wordmark className="text-3xl" />
            </div>
            <div className="font-display text-[40px] font-medium leading-[1.15] tracking-[-0.03em]">{END_CARD}</div>
            <div className="mt-3 text-base text-muted-foreground">{EMPLOYEE.name}, {EMPLOYEE.tagline}.</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function OverviewPage() {
  const readiness = useDemo((s) => s.readiness)
  const overrides = useDemo((s) => s.overrides)
  const heroStage = useDemo((s) => s.heroStage)
  const extraActivity = useDemo((s) => s.extraActivity)
  const activity = React.useMemo(() => [...extraActivity, ...ACTIVITY], [extraActivity])
  const counts = countColours(CURRENT_USER.id, overrides)
  const agents = [...(heroStage ? [{ id: HERO.id, name: HERO.name, requesterId: HERO.requesterId, stage: heroStage, requestId: HERO.requestId }] : []), ...OTHER_AGENTS]
  const byStage = (st: Stage) => agents.filter((a) => a.stage === st)
  const feed = [...(heroStage ? [HERO_REQUEST] : []), ...REQUEST_FEED]
  const deployed = agents.filter((a) => a.stage === "deployed" || a.stage === "learning").length

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <React.Suspense fallback={null}>
        <EndParam />
      </React.Suspense>
      <EndCard />
      <PageHeader
        title="Overview"
        description={`Kestrel Ridge Capital · how AI-ready the firm is, which agents are moving, and what people have asked for.`}
        actions={
          <Button asChild size="sm" variant="signal">
            <Link href={href("/requests/new")} id="new-request">
              <Plus /> Ask {EMPLOYEE.name} for an automation
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Firm AI-readiness" value={`${readiness}%`} hint={`${counts.green} of ${counts.green + counts.yellow + counts.red + counts.black} sources merged`} accent="var(--verified)" />
        <Card className="px-4 py-3.5 lg:col-span-2">
          <div className="text-xs font-medium text-muted-foreground">Sources by readiness</div>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted">
            {COLOURS.map((c) => (
              <div key={c} className="h-full transition-[width] duration-700" style={{ width: `${(counts[c] / 12) * 100}%`, background: c === "black" ? "var(--ink)" : c === "green" ? "var(--verified)" : c === "yellow" ? "var(--flagged)" : "var(--abort)" }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {COLOURS.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5">
                <ColourDot colour={c} /> {COLOUR_LABEL[c]} <span className="font-mono font-medium tabular">{counts[c]}</span>
              </span>
            ))}
            <Link href={href("/map")} className="ml-auto inline-flex items-center gap-1 font-medium text-signal underline-offset-4 hover:underline">
              <MapIcon className="h-3 w-3" /> Open the firm map
            </Link>
          </div>
        </Card>
        <Stat label="Agents deployed" value={deployed} hint={`of ${agents.length} requested · Day ${ROLLOUT.day} of ${ROLLOUT.total}`} accent={deployed ? "var(--verified)" : undefined} />
      </div>

      <Card>
        <CardHeader title="Agent pipeline" action={<Link href={href("/agents")} className="text-xs text-muted-foreground transition-colors hover:text-foreground">All agents</Link>} />
        <div className="grid grid-cols-6 divide-x">
          {STAGES.map((st) => {
            const list = byStage(st.id)
            return (
              <div key={st.id} className="min-h-[112px] px-3 py-2.5">
                <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  {st.label} <span className="font-mono tabular">{list.length}</span>
                </div>
                <ul className="space-y-1.5">
                  {list.map((a) => (
                    <li key={a.id}>
                      <Link href={href(`/agents/${a.id}`)} className={cn("block rounded-md border bg-card px-2 py-1.5 text-[12px] font-medium leading-4 transition-colors hover:bg-accent", a.id === HERO.id && "border-signal/50 bg-signal-soft/40")}>
                        <span className="block truncate">{a.name}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] font-normal text-muted-foreground">
                          <ActorAvatar id={a.requesterId} size="xs" className="h-4 w-4 text-[8px]" /> {a.requestId.toUpperCase()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader title="Request feed" action={<span className="text-xs text-muted-foreground">what people across the firm have asked for</span>} />
          <ul className="divide-y">
            {feed.map((r) => {
              const agent = agents.find((a) => a.id === r.agentId)
              return (
                <li key={r.id}>
                  <Link href={href(`/agents/${r.agentId}`)} className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60">
                    <ActorAvatar id={r.requesterId} size="sm" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm leading-5">&ldquo;{r.text}&rdquo;</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ActorName id={r.requesterId} className="text-xs" /> · {r.label} · {relativeTime(r.at)}
                      </div>
                    </div>
                    {agent && <StagePill stage={agent.stage} />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Activity" />
          <ul className="divide-y">
            {activity.slice(0, 7).map((a) => (
              <li key={a.id} className="flex items-start gap-2.5 px-4 py-2.5 text-sm">
                <ActorAvatar id={a.actorId} size="sm" className="mt-0.5" />
                <span className="min-w-0 flex-1 leading-5">
                  <ActorName id={a.actorId} /> <span className={cn(a.kind === "blocked" ? "text-abort" : "text-muted-foreground")}>{a.text}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular">{relativeTime(a.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <span className="sr-only">
        <ArrowRight />
      </span>
    </div>
  )
}
