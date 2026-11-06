# Enakt demo — Kestrel Ridge Capital

Frontend-only recorded product demo for Enakt, the firm's Chief AI Officer. No backend, no auth, no
API routes, no calls to any model. Every person, deal, company and number is fiction and lives in
`lib/demo/fixtures.ts`. Every animated sequence is a typed, fixed-timing script in `lib/demo/script.ts`,
played by `lib/demo/player.ts` into one Zustand store (`lib/demo/store.ts`). Two takes look identical.

The pitch the demo proves: "Your first agent on real deal data in 30 days."

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000 → /signin
pnpm build      # zero type or lint errors
```

## The storyboard, one number key per beat

| Key | Beat | Route | What plays |
|---|---|---|---|
| `1` | Sign in | `/signin` | Pre-filled, simulated. Lands on the overview. |
| `2` | Firm map | `/kestrel/map` | The map fills the screen and a timed tour opens one green, yellow, red and black node. |
| `3` | The ask | `/kestrel/requests/new` | Maya's request types itself; the status line shows Enakt working in the firm's cloud on metadata only. |
| `4` | Questions and scope | `/kestrel/requests/r-7` | Six questions answered with quick-pick chips; the scope mini-map lights up; three owners confirm. |
| `5` | Building the agent | `/kestrel/agents/cim-screener/build` | Nine checklist steps tick with one-line results. |
| `6` | Security review | `/kestrel/agents/cim-screener` | Permissions per source, enforced at source. Maya flips the DealCloud write toggle. |
| `7` | Deploy | `/kestrel/agents/cim-screener/deploy` | Summary, dry run, approvals. Deploy moves the pipeline, turns deals@ yellow, 38% → 43%, Day 19 of 30. |
| `8` | In action | `/kestrel/agents/cim-screener/run` | Project Juniper arrives; the blocked Atlas read; fresh vs trained side by side; the evaluation trend. |
| `9` | Close | `/kestrel` | The overview with the end card. |

Keys 2, 3, 4, 5 and 8 start their sequence on arrival, so pressing 1–9 in order plays the whole
storyboard. Beats 6 and 7 are Maya's clicks: the write toggle and Deploy.

## Recording

| Key | Action |
|---|---|
| `Space` | Pause or resume any running sequence |
| `Shift+R` | Reset to the start of beat 1 |
| `Shift+F` or `?rec=1` | Recording mode: hides demo-only affordances, sequences at 1.5× |
| `Shift+D` | Toggle dark mode (light is the recording default) |
| `⌘K` | Palette: beats, sources, actions (hidden in recording mode) |

State persists in `sessionStorage` for the tab. A reload mid-sequence lands on the finished state.
Screenshots of every beat at 1920×1080 are under `docs/recording/`.

## Layout

- `app/signin/` — beat 1, outside the shell.
- `app/(demo)/[firm]/` — the shell pages. Only `kestrel` is a valid firm; older slugs redirect.
- `app/(demo)/[firm]/(canvas)/` — the firm map and the request page share this layout so the React
  Flow canvas stays mounted between them.
- `app/(archive)/_calloway/` and `archive/` — the previous Calloway Hill take, out of the nav and the
  build.
- `components/demo/firm-map.tsx` — the map: brain at the centre, four readiness colours, black tiles
  for what the viewer cannot see, person-nodes, scope mode for beat 4.
- `components/shell/*` — sidebar, top bar (trust strip, readiness, rollout chip), palette, skeletons.
- `lib/demo/*` — fixtures, script, player, store, formatting helpers.

## Copy rules

Fictional firm, people and companies. Vendor names as plain text only, no logos. Copy is about
citations, kept-both values, scopes enforced at source, and approvals. The firm runs Enakt in its own
cloud; the model runs there too; Enakt Inc. has no access.
