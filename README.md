# Enakt PE demo — Calloway Hill Partners

Frontend-only product demo for Enakt, retargeted to a mid-market private equity firm. No backend,
no auth, no API routes. Every name, number and date comes from `lib/demo/fixtures.ts`; the request
scene and the agent run are typed scripts in `lib/demo/script.ts`, played with timers by
`lib/demo/player.ts`, into one Zustand store (`lib/demo/store.ts`) that every page reads. Same
clicks, same result, every take.

The pitch the demo proves: a PE firm's first AI agent working on its real deal data within 30 days,
inside the firm's own cloud tenant. Each agent is scoped to exactly the deals and data it needs,
enforced at the source. Enakt Inc. never has access.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000 → redirects to /calloway
pnpm build      # passes with zero type errors
```

## The flow (under 2:45 at 1.5×)

Request → clarifications → Map with View as → Readiness conflict → CR-7 two approvals → Policies →
Agent run → Rollout. `Shift+R` resets everything.

## Routes

| Route | Page |
|---|---|
| `/calloway` | Home: AI-ready meter, agents, needs attention, this week by owner, activity |
| `/calloway/requests` | Request list (R-1 … R-5) |
| `/calloway/requests/r-3` | Request R-3: scope plan, three clarifications, canvas builds deal lanes live |
| `/calloway/map` | Map: deal-lane canvas, View as (Dana / Atlas deal team / atlas-memo-agent), detail sheet |
| `/calloway/readiness` | Readiness: 12 sources by urgency, Atlas TTM revenue conflict panel |
| `/calloway/connections` | Connection request list |
| `/calloway/connections/cr-7` | CR-7: Conversation / Changes / Checks, two approvals, merge |
| `/calloway/policies` | Per-agent policy cards (Readable / Policy as code) and the people × deals matrix |
| `/calloway/agents` | Agent list |
| `/calloway/agents/atlas-memo-agent` | Agent run: 8-step trace, memo-styled draft with citations, Scope and History tabs |
| `/calloway/rollout` | 30-day plan with milestones and gates, request queue |
| `/calloway/audit` | Audit log (20 entries plus whatever the demo adds) |
| `/calloway/settings` | Deployment, Models, Members, Connections (`?tab=`) |

## Recording

| Key | Action |
|---|---|
| `1` – `7` | Home, Request R-3, Map, Readiness, CR-7, Policies, Agent run |
| `8` | Rollout |
| `Space` | Pause or resume any running script |
| `Shift+R` | Reset: request submitted, scope plan empty, canvas empty, 22%, CR-7 at 0 of 2, agent not run, Day 12 |
| `Shift+F` | Recording mode: hides the synthetic-data note and bell pulse, larger hit areas, scripts at 1.5× |
| `Shift+D` | Toggle dark mode |
| `⌘K` | Command palette: pages, sources, people, agents |

The `2×` toggle on the request page also sets the script speed. State persists in `sessionStorage`
for the tab, so an accidental reload lands on the finished state of whatever was running.

## What changes during the flow

- **Request R-3**: the scan line animates, the scope plan fills (Needs / Ask / Never touches), three
  Q&As stream, and the canvas builds the lanes. Nina's third answer flips the Atlas data room to
  Conflict (TTM revenue $48.2M in the CIM vs $46.9M in the monthly P&L, held for her).
- **CR-7**: Approve as Ellen Marsh → 1 of 2. Approve as Grace Liu → 1.2s merge. On merge the agent
  node goes live on the canvas, the meter animates 22% → 34%, a toast fires, audit entries land, and
  the Day 15 rollout milestone checks.
- **Agent run**: step 6 is blocked by the Birch NDA (pause, red flash), step 7 keeps both revenue
  values, and the draft section streams with file + page/cell citation chips.

## Layout

- `app/(demo)/[firm]/**` — pages. Only `calloway` is a valid firm; `/ashcombe` and `/northfield`
  redirect to it.
- `app/(demo)/[firm]/(canvas)/` — the request page and the map share this layout so the React Flow
  canvas stays mounted between the two routes.
- `components/demo/deal-canvas.tsx` — the canvas: lane group nodes, source nodes with readiness
  strips, agent nodes, dashed scope edges, policy badges on lane boundaries.
- `components/shell/*` — sidebar, top bar (environment chips, access-log popover, AI-ready bar,
  rollout day chip), palette, skeletons.
- `lib/demo/*` — fixtures, script, player, store, formatting helpers.

## Copy rules

Fictional firm, people and companies. Vendor names appear as plain text only, with generic Lucide
icons. Copy is about citations, held values, scopes and approvals.
