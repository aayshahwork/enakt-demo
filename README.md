# Enakt "Firm Brain" demo — Ashcombe Trust Company

Frontend-only product demo for Enakt. No backend, no auth, no API routes. Every name, number and
date comes from `lib/demo/fixtures.ts`; the interview and the agent run are typed scripts in
`lib/demo/script.ts`, played with timers by `lib/demo/player.ts`, into one Zustand store
(`lib/demo/store.ts`) that every page reads. Same clicks, same result, every take.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000 → redirects to /ashcombe
pnpm build      # passes with zero type errors
```

## Routes

| Route | Page |
|---|---|
| `/ashcombe` | Overview: brain coverage, needs attention, this week, recent activity |
| `/ashcombe/intake` | Intake: the interview builds the firm live on the canvas |
| `/ashcombe/map` | Map: same canvas, full width, View as switcher, detail sheet |
| `/ashcombe/build` | Build: 12 sources by urgency, Patel conflict panel |
| `/ashcombe/build/mr-14` | Merge request MR-14 with Approve and merge |
| `/ashcombe/permissions` | Policy list and the people/agents access matrix |
| `/ashcombe/agents` | Agent list |
| `/ashcombe/agents/marcus-assistant` | Agent run: 7-step trace and cited brief |
| `/ashcombe/audit` | Audit log |
| `/ashcombe/settings` | Deployment, Models, Members, Connections (`?tab=`) |

## Recording

| Key | Action |
|---|---|
| `1` – `6` | Overview, Intake, Map, Build, Permissions, Agent run |
| `Space` | Pause or resume any running script |
| `Shift+R` | Reset to the pre-intake state (canvas empty, 38%, MR-14 open, no run) |
| `Shift+F` | Recording mode: hides the demo badge and bell pulse, larger hit areas, scripts at 1.5× |
| `Shift+D` | Toggle dark mode |
| `⌘K` | Command palette: pages, sources, people, agents |

The `2×` toggle on Intake also sets the script speed. State persists in `sessionStorage` for the
tab, so an accidental reload lands on the finished state of whatever was running.

## Layout

- `app/(demo)/[firm]/**` — pages. Only `ashcombe` is a valid firm.
- `app/(demo)/[firm]/(canvas)/` — Intake and Map share this layout so the React Flow canvas stays
  mounted between the two routes.
- `components/demo/brain-canvas.tsx` — the canvas: custom nodes, drawing edges, policy badges.
- `components/shell/*` — sidebar, top bar (environment strip, brain progress), palette, skeletons.
- `lib/demo/*` — fixtures, script, player, store, formatting helpers.
