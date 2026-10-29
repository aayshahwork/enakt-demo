# Enakt demo — Northfield Wealth Partners

Frontend-only product demo for Enakt. No backend, no auth, no API routes. Every number on screen
comes from `lib/demo/fixtures.ts`; every "agent" action is simulated in `lib/demo/sim.ts` with
fixed timings so takes are repeatable.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000 → redirects to /northfield
pnpm build      # must pass with zero type or lint errors
```

## Routes

| Route | Page |
|---|---|
| `/northfield` | Overview |
| `/northfield/intake` | Intake session (Run intake streams 5 Q&As) |
| `/northfield/map` | React Flow source map |
| `/northfield/sources` | Sortable source table |
| `/northfield/sources/salesforce-crm` | Patel conflict detail (also 9 other slugs) |
| `/northfield/merge-requests` | MR list |
| `/northfield/merge-requests/12` | MR-12 with Approve and merge |
| `/northfield/access` | Permission matrix |
| `/northfield/activity` | Activity log |
| `/northfield/settings` | Models, Connections, Members, General |

## Recording

- `?rec=1` on any URL hides the Demo workspace badge, truncation tooltips, and the bell pulse for the session.
- `1` – `5` jump to Intake, Map, Salesforce CRM, MR-12, Access.
- `Shift+R` resets all state (intake not run, MR-12 open, 34%).
- `⌘K` opens the command palette. `Shift+D` toggles dark mode.
- State persists in `sessionStorage` for the tab, so an accidental reload does not lose a take.

## Layout

- `app/(demo)/northfield/**` — pages. `app/(demo)/layout.tsx` mounts the shell.
- `components/shell/` — sidebar, top bar, consolidation bar, command palette, route skeleton.
- `components/demo/` — source map, MR detail, source detail, icons, pills, avatars.
- `components/ui/` — shadcn-style primitives on Radix.
- Design tokens (`app/globals.css`) and fonts (`app/fonts/`) are shared with enakt.live.
