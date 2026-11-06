/**
 * Enakt demo fixtures — Kestrel Ridge Capital.
 * Every person, deal, company and number on screen is fiction and comes from here. Nothing is fetched.
 * "Now" is pinned so relative timestamps are identical on every take.
 */

export const NOW = new Date("2026-11-04T10:15:00-05:00")

export const FIRM = "kestrel"
export const BASE = `/${FIRM}`
export const href = (path = "") => `${BASE}${path}`

export const WORKSPACE = { slug: FIRM, name: "Kestrel Ridge Capital", short: "Kestrel Ridge", people: 40, focus: "mid-market private equity" }

export const EMPLOYEE = { name: "Enakt", tagline: "your firm's Chief AI Officer" }

export const READINESS = { before: 38, after: 43 }

export const TRUST = {
  chips: ["Runs in Kestrel Ridge's cloud", "Model runs in your cloud", "Enakt Inc.: no access"],
  signIns: "Sign-ins by Enakt Inc. accounts since install (Oct 24): 0",
  statusLine: "Working inside Kestrel Ridge's cloud · reading metadata only · no deal data leaves",
}

export const ROLLOUT = {
  day: 12,
  total: 30,
  liveDay: 19,
  installedOn: "Oct 24",
  milestones: [
    { id: "installed", label: "Installed in Kestrel Ridge's cloud", day: 1, done: true },
    { id: "request", label: "First request", day: 3, done: true },
    { id: "map", label: "Firm map", day: 8, done: true },
    { id: "deployed", label: "First agent deployed", day: 19, done: false },
    { id: "three", label: "Three agents live", day: 30, done: false },
  ],
}

// ---------------------------------------------------------------------------
// People and agents
// ---------------------------------------------------------------------------

export type ActorKind = "person" | "agent" | "team"
export type Actor = { id: string; name: string; role: string; kind: ActorKind; initials: string; email?: string }

export const PEOPLE: Record<string, Actor> = {
  maya: { id: "maya", name: "Maya Chen", role: "Vice President · deal team", kind: "person", initials: "MC", email: "maya.chen@kestrelridge.com" },
  daniel: { id: "daniel", name: "Daniel Okoro", role: "Partner · Industrials", kind: "person", initials: "DO", email: "daniel.okoro@kestrelridge.com" },
  ruth: { id: "ruth", name: "Ruth Abrams", role: "Head of Compliance", kind: "person", initials: "RA", email: "ruth.abrams@kestrelridge.com" },
  leo: { id: "leo", name: "Leo Varga", role: "Head of Operations", kind: "person", initials: "LV", email: "leo.varga@kestrelridge.com" },
  "atlas-team": { id: "atlas-team", name: "Atlas deal team", role: "walled deal", kind: "team", initials: "AT" },
  "fund-ops": { id: "fund-ops", name: "Fund ops · investor relations", role: "", kind: "team", initials: "IR" },
  enakt: { id: "enakt", name: "Enakt", role: EMPLOYEE.tagline, kind: "agent", initials: "E" },
}

export const CURRENT_USER = PEOPLE.maya

export type Stage = "requested" | "scoping" | "building" | "review" | "deployed" | "learning"
export const STAGES: { id: Stage; label: string }[] = [
  { id: "requested", label: "Requested" },
  { id: "scoping", label: "Scoping" },
  { id: "building", label: "Building" },
  { id: "review", label: "Ready for review" },
  { id: "deployed", label: "Deployed" },
  { id: "learning", label: "Learning" },
]
export const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label])) as Record<Stage, string>

export type Agent = { id: string; name: string; purpose: string; requesterId: string; stage: Stage; requestId: string }
/** The hero agent is created by Maya's request in beat 3 and is not in the pipeline before that. */
export const HERO = { id: "cim-screener", name: "CIM screener", purpose: "Screens every inbound CIM against the Q3 investment criteria and posts a one-page screen to the deal in DealCloud.", requesterId: "maya", requestId: "r-7" }

export const OTHER_AGENTS: Agent[] = [
  { id: "ic-memo-financials", name: "IC memo financials", purpose: "Drafts the financial section of IC memos from the data room and the model.", requesterId: "daniel", stage: "building", requestId: "r-3" },
  { id: "kpi-rollup", name: "Portfolio KPI roll-up", purpose: "Rolls six KPI packs into one monthly summary.", requesterId: "leo", stage: "scoping", requestId: "r-4" },
  { id: "lp-letter", name: "LP letter drafter", purpose: "Drafts the quarterly LP letter.", requesterId: "leo", stage: "requested", requestId: "r-5" },
  { id: "property-data", name: "Real estate data tool", purpose: "Keeps all property data in one place so it informs deals with real-estate exposure.", requesterId: "daniel", stage: "requested", requestId: "r-6" },
  { id: "deal-wall-check", name: "Deal-wall check", purpose: "Checks a share list against deal walls before any data room invite goes out.", requesterId: "ruth", stage: "requested", requestId: "r-2" },
]

export type Request = { id: string; label: string; text: string; requesterId: string; at: Date; agentId: string }
export const HERO_REQUEST: Request = { id: "r-7", label: "R-7", text: "Screen every inbound CIM against our investment criteria.", requesterId: "maya", at: NOW, agentId: HERO.id }
export const REQUEST_FEED: Request[] = [
  { id: "r-6", label: "R-6", text: "A real estate tool that keeps all our property data in one place so it informs deals with real-estate exposure.", requesterId: "daniel", at: new Date("2026-11-03T16:20:00-05:00"), agentId: "property-data" },
  { id: "r-5", label: "R-5", text: "Draft the quarterly LP letter from the board decks and investor records.", requesterId: "leo", at: new Date("2026-11-03T11:05:00-05:00"), agentId: "lp-letter" },
  { id: "r-4", label: "R-4", text: "Roll the six portfolio KPI packs into one monthly summary for the ops call.", requesterId: "leo", at: new Date("2026-11-02T14:30:00-05:00"), agentId: "kpi-rollup" },
  { id: "r-3", label: "R-3", text: "Draft the financial section of the IC memo when a data room lands.", requesterId: "daniel", at: new Date("2026-10-30T09:12:00-04:00"), agentId: "ic-memo-financials" },
  { id: "r-2", label: "R-2", text: "Check every data-room share list against our deal walls before the invite goes out.", requesterId: "ruth", at: new Date("2026-10-28T15:40:00-04:00"), agentId: "deal-wall-check" },
]

// ---------------------------------------------------------------------------
// Firm map: sources, readiness colours, people as sources
// ---------------------------------------------------------------------------

export type Colour = "green" | "yellow" | "red" | "black"
export const COLOUR_LABEL: Record<Colour, string> = { green: "Merged", yellow: "In progress", red: "Not ready", black: "Restricted" }
export const COLOUR_MEANING: Record<Colour, string> = {
  green: "Merged into the brain. Cleaned, de-duplicated, AI can use it.",
  yellow: "Mapped and in progress. Being merged or cleaned up to finish merging.",
  red: "Not ready. The data exists, in a system or in someone's head, but is not mapped or merged yet.",
  black: "Restricted. Maya is not allowed to see it, so she only sees the owning team.",
}

export type SourceKind = "system" | "person" | "dataroom"
export type SourceId =
  | "dealcloud"
  | "criteria"
  | "ic-memos"
  | "deals-inbox"
  | "banker-folders"
  | "dr-cobalt"
  | "dr-fern"
  | "dr-atlas"
  | "kpis"
  | "lp-records"
  | "valuation"
  | "daniel-heuristics"

export type Source = {
  id: SourceId
  name: string
  system: string
  kind: SourceKind
  colour: Colour
  ownerId: string
  /** Restricted tiles show only the owning team. */
  teamId?: string
  why: string
  records: string
  pos: { x: number; y: number }
  /** Who may see this node at all. Everything else is black for them. */
  visibleTo: "all" | string[]
}

export const SOURCES: Source[] = [
  { id: "criteria", name: "Investment criteria & fund thesis", system: "SharePoint", kind: "system", colour: "yellow", ownerId: "daniel", why: "Mapped. Two versions disagree (Q2 and Q3). Merge in progress.", records: "2 versions · 12 criteria", pos: { x: 150, y: 0 }, visibleTo: "all" },
  { id: "ic-memos", name: "Past IC memos", system: "SharePoint", kind: "system", colour: "yellow", ownerId: "daniel", why: "Mapped. 214 memos being de-duplicated before merge.", records: "214 memos", pos: { x: 400, y: 0 }, visibleTo: "all" },
  { id: "dealcloud", name: "DealCloud pipeline", system: "DealCloud", kind: "system", colour: "green", ownerId: "leo", why: "Merged. Every deal, contact and stage is in the brain.", records: "318 deals", pos: { x: 780, y: 0 }, visibleTo: "all" },
  { id: "kpis", name: "Portfolio company KPIs", system: "Fund ops database", kind: "system", colour: "green", ownerId: "leo", why: "Merged. Monthly KPIs for all 9 portfolio companies.", records: "9 companies · monthly", pos: { x: 1030, y: 0 }, visibleTo: "all" },
  { id: "deals-inbox", name: "deals@ inbox", system: "Inbound CIMs from bankers", kind: "system", colour: "red", ownerId: "leo", why: "Exists, not connected. CIMs arrive here and sit until someone forwards them.", records: "≈ 6 CIMs a week", pos: { x: 0, y: 180 }, visibleTo: "all" },
  { id: "banker-folders", name: "Banker teaser & CIM folders", system: "Shared drive", kind: "system", colour: "red", ownerId: "leo", why: "Exists, not connected. One folder per banker, no naming rule.", records: "1,140 files", pos: { x: 0, y: 330 }, visibleTo: "all" },
  { id: "valuation", name: "Valuation models", system: "Excel · shared drive", kind: "system", colour: "red", ownerId: "maya", why: "Exists, not mapped. One workbook per deal, versions by file name.", records: "41 workbooks", pos: { x: 0, y: 480 }, visibleTo: "all" },
  { id: "dr-cobalt", name: "Project Cobalt data room", system: "Data room", kind: "dataroom", colour: "yellow", ownerId: "maya", why: "Mapped. Folder index merged, documents being tagged.", records: "1,284 files", pos: { x: 1190, y: 180 }, visibleTo: "all" },
  { id: "dr-fern", name: "Project Fern data room", system: "Data room", kind: "dataroom", colour: "red", ownerId: "daniel", why: "Not ready. Room opened last week, not mapped yet.", records: "640 files", pos: { x: 1190, y: 330 }, visibleTo: "all" },
  { id: "dr-atlas", name: "Project Atlas data room", system: "Data room", kind: "dataroom", colour: "black", ownerId: "ruth", teamId: "atlas-team", why: "Behind a deal wall. Only the Atlas deal team sees it.", records: "", pos: { x: 1190, y: 480 }, visibleTo: ["ruth", "atlas-team"] },
  { id: "daniel-heuristics", name: "Daniel Okoro's screening heuristics", system: "In Daniel's head", kind: "person", colour: "red", ownerId: "daniel", why: "Not written down. Why he passes on a deal in the first ten minutes.", records: "person", pos: { x: 400, y: 660 }, visibleTo: "all" },
  { id: "lp-records", name: "LP & investor records", system: "Fund admin", kind: "system", colour: "black", ownerId: "ruth", teamId: "fund-ops", why: "Restricted to fund ops and compliance.", records: "", pos: { x: 780, y: 660 }, visibleTo: ["ruth", "leo", "fund-ops"] },
]
export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<SourceId, Source>

export const BRAIN_POS = { x: 582, y: 320 }
export const NODE = { w: 212, h: 70, brainW: 236, brainH: 110 }

/** Edges from a person-node to the source its owner keeps. */
export const PERSON_EDGES: { id: string; source: SourceId; target: SourceId }[] = [{ id: "daniel-heuristics>criteria", source: "daniel-heuristics", target: "criteria" }]

export function colourFor(id: SourceId, viewerId: string, overrides: Partial<Record<SourceId, Colour>>): Colour {
  const s = SOURCE_BY_ID[id]
  if (s.visibleTo !== "all" && !s.visibleTo.includes(viewerId)) return "black"
  return overrides[id] ?? s.colour
}

export function countColours(viewerId: string, overrides: Partial<Record<SourceId, Colour>>): Record<Colour, number> {
  const c: Record<Colour, number> = { green: 0, yellow: 0, red: 0, black: 0 }
  for (const s of SOURCES) c[colourFor(s.id, viewerId, overrides)]++
  return c
}

/** The map tour in beat 2: one node of each colour, with what it means. */
export const TOUR: { id: SourceId; colour: Colour }[] = [
  { id: "kpis", colour: "green" },
  { id: "criteria", colour: "yellow" },
  { id: "deals-inbox", colour: "red" },
  { id: "dr-atlas", colour: "black" },
]

// ---------------------------------------------------------------------------
// Beat 4: questions, quick-pick answers, owners to confirm
// ---------------------------------------------------------------------------

export type Question = {
  id: string
  n: number
  text: string
  chips: string[]
  pick: number
  /** Sources lit on the mini-map when the answer lands. */
  lights: SourceId[]
  /** Sources crossed off. */
  excludes: SourceId[]
  /** Owner confirmation this answer triggers. */
  confirms?: string
}

export const QUESTIONS: Question[] = [
  { id: "q1", n: 1, text: "Where do CIMs arrive today?", chips: ["deals@ inbox and banker folders", "Only the deals@ inbox", "Bankers send them to me"], pick: 0, lights: ["deals-inbox", "banker-folders"], excludes: [], confirms: "leo" },
  { id: "q2", n: 2, text: "Which criteria should I screen against, the fund thesis or the latest IC deck? Who owns them?", chips: ["The Q3 thesis · Daniel Okoro owns it", "The latest IC deck", "Both"], pick: 0, lights: ["criteria"], excludes: [], confirms: "daniel" },
  { id: "q3", n: 3, text: "What should each screen produce, and where should it go?", chips: ["Pass / pass with questions / decline · one page · posted to the deal in DealCloud", "An email to me", "A note in the data room"], pick: 0, lights: ["dealcloud", "ic-memos"], excludes: [] },
  { id: "q4", n: 4, text: "How much of your time do you want to spend reviewing screens at first?", chips: ["Every screen for two weeks, then a weekly sample", "Every screen, always", "Only the ones it flags"], pick: 0, lights: [], excludes: [] },
  { id: "q5", n: 5, text: "Run on every inbound CIM, or only when asked?", chips: ["Every inbound", "Only when asked"], pick: 0, lights: [], excludes: [], confirms: "ruth" },
  { id: "q6", n: 6, text: "Who can I ask when something's missing?", chips: ["The deal lead and Daniel Okoro", "Just me", "Nobody, flag it"], pick: 0, lights: ["daniel-heuristics"], excludes: ["dr-atlas", "lp-records"] },
]

export type Confirmation = { id: string; personId: string; ask: string; reply: string }
export const CONFIRMATIONS: Confirmation[] = [
  { id: "daniel", personId: "daniel", ask: "Is the Q3 thesis the current one?", reply: "Yes, Q3 is current. Ignore the Q2 copy." },
  { id: "leo", personId: "leo", ask: "Can the agent read deals@?", reply: "Granted. Read-only, scoped to that mailbox." },
  { id: "ruth", personId: "ruth", ask: "Anything it must not touch?", reply: "LP records and the walled deal rooms stay out. Approved on that basis." },
]

export const SCOPE = {
  sources: ["deals-inbox", "banker-folders", "criteria", "ic-memos", "dealcloud", "daniel-heuristics"] as SourceId[],
  excluded: ["dr-atlas", "lp-records"] as SourceId[],
}

// ---------------------------------------------------------------------------
// Beat 5: build checklist
// ---------------------------------------------------------------------------

export type BuildStep = { n: number; label: string; result: string }
export const BUILD_STEPS: BuildStep[] = [
  { n: 1, label: "Scope data", result: "6 sources, 2 excluded" },
  { n: 2, label: "Confirm owners", result: "3 of 3 confirmed" },
  { n: 3, label: "Connect sources", result: "scoped read credentials issued" },
  { n: 4, label: "Enforce at source", result: "deal walls applied per data room" },
  { n: 5, label: "Sandbox", result: "isolated runtime, compute reserved on a GPU instance in Kestrel Ridge's cloud, wakes on each new CIM" },
  { n: 6, label: "Model", result: "runs in your cloud · no fine-tune yet, revisit after 50 reviewed screens" },
  { n: 7, label: "Evaluation", result: "test set built from 40 past CIMs with known IC outcomes" },
  { n: 8, label: "Learning loop", result: "Maya's reviews feed it" },
  { n: 9, label: "Ready for review", result: "" },
]

// ---------------------------------------------------------------------------
// Beat 6: permissions
// ---------------------------------------------------------------------------

export type Access = "read" | "write" | "ask" | "none"
export const ACCESS_LABEL: Record<Access, string> = { read: "Read", write: "Read + write", ask: "Ask", none: "No access" }
export type Permission = { sourceId: SourceId; access: Access; how: string; adjustable?: "write"; inScope: boolean }
export const PERMISSIONS: Permission[] = [
  { sourceId: "deals-inbox", access: "read", how: "Mailbox read scope on deals@ only. Issued by Leo Varga. No other mailbox.", inScope: true },
  { sourceId: "banker-folders", access: "read", how: "Shared-drive read on the banker folders only. Nothing else on the drive.", inScope: true },
  { sourceId: "criteria", access: "read", how: "SharePoint read on the Q3 thesis file. The Q2 copy is excluded.", inScope: true },
  { sourceId: "ic-memos", access: "read", how: "SharePoint read on the IC memo library.", inScope: true },
  { sourceId: "dealcloud", access: "write", how: "Read all deals; write limited to posting a screen on the matching deal record.", adjustable: "write", inScope: true },
  { sourceId: "daniel-heuristics", access: "ask", how: "The agent can send Daniel a question with context and record his answer.", inScope: true },
  { sourceId: "dr-atlas", access: "none", how: "Data room access group: Cobalt and Fern deal teams only. The agent is not in it.", inScope: false },
  { sourceId: "lp-records", access: "none", how: "Fund admin role: fund ops and compliance only. The agent has no role there.", inScope: false },
  { sourceId: "dr-cobalt", access: "none", how: "Not needed for screening. Not in the access group.", inScope: false },
  { sourceId: "dr-fern", access: "none", how: "Not needed for screening. Not in the access group.", inScope: false },
  { sourceId: "kpis", access: "none", how: "Not needed for screening.", inScope: false },
  { sourceId: "valuation", access: "none", how: "Not needed for screening.", inScope: false },
]

// ---------------------------------------------------------------------------
// Beat 7: deploy summary
// ---------------------------------------------------------------------------

export const DEPLOY = {
  summary: [
    { label: "Sources connected", value: 4, hint: "deals@, banker folders, SharePoint (criteria, memos), DealCloud" },
    { label: "Scoped credentials", value: 3, hint: "mailbox read · SharePoint and drive read · DealCloud read + post" },
    { label: "Exclusion policies", value: 2, hint: "Project Atlas data room · LP records" },
    { label: "Compute reservation", value: 1, hint: "GPU instance in Kestrel Ridge's cloud, wakes on each CIM" },
  ],
  dryRun: "Replayed 40 past CIMs: 0 reads outside scope",
  approvers: [
    { id: "ruth", role: "Compliance", when: "given during scoping" },
    { id: "maya", role: "Requester", when: "this click" },
  ],
}

// ---------------------------------------------------------------------------
// Beat 8: Project Juniper, fresh vs trained
// ---------------------------------------------------------------------------

export const JUNIPER = {
  name: "Project Juniper",
  company: "Juniper Field Services",
  sector: "Industrial services",
  banker: "Hollis & Vane",
  cimFile: "Juniper_CIM.pdf",
  cimPages: 64,
  teaserFile: "Juniper_Teaser.pdf",
  teaserRevenue: "$48.2M",
  cimRevenue: "$46.9M",
  cimRevenuePage: "p.22",
  ebitda: "$8.4M",
  ebitdaPage: "p.24",
  concentration: "34%",
  concentrationPage: "p.31",
  ceiling: "30%",
  danielCall: "Pass with questions",
}

export type TraceKind = "new" | "read" | "blocked" | "done"
export type TraceStep = { n: number; kind: TraceKind; title: string; detail: string; path: string }
export const RUN_TRACE: TraceStep[] = [
  { n: 1, kind: "new", title: "New CIM arrived", detail: `${JUNIPER.name} · ${JUNIPER.company} · from ${JUNIPER.banker}`, path: `deals@ · ${JUNIPER.cimFile} (${JUNIPER.cimPages} pages) · ${JUNIPER.teaserFile}` },
  { n: 2, kind: "read", title: "Read the Q3 investment criteria", detail: "12 criteria. Sector, size, concentration ceiling, geography.", path: "SharePoint · Q3_Investment_Criteria.docx" },
  { n: 3, kind: "read", title: "Read the teaser and the CIM", detail: "Financials, customers, management, process timeline.", path: `${JUNIPER.teaserFile} · ${JUNIPER.cimFile}` },
  { n: 4, kind: "read", title: "Checked DealCloud for prior contact", detail: "No prior record of Juniper or the banker on this asset.", path: "DealCloud · deals, contacts" },
  { n: 5, kind: "blocked", title: "Blocked: Project Atlas data room", detail: "Juniper's largest customer is a portfolio company of the Atlas seller. The read was denied at the source. Flagged to Ruth Abrams instead.", path: "Data room access group: Cobalt and Fern deal teams only" },
  { n: 6, kind: "done", title: "Screen posted", detail: "One page, posted to the Juniper deal in DealCloud. Maya reviews every screen for two weeks.", path: "DealCloud · Project Juniper · Screens" },
]

export type OutputBlock = { id: string; heading: string; text: string; cites: string[]; tone?: "flag" | "unresolved" | "match" }
export const FRESH_OUTPUT: OutputBlock[] = [
  { id: "decision", heading: "Decision", text: "Pass with questions. Fits the industrial services thesis on sector, size and geography.", cites: ["Q3 criteria"] },
  { id: "revenue", heading: "Revenue", text: `${JUNIPER.teaserRevenue} trailing twelve months, growing 11% a year.`, cites: [`${JUNIPER.teaserFile} · p.2`] },
  { id: "ebitda", heading: "Adjusted EBITDA", text: `${JUNIPER.ebitda}, a 17% margin after owner add-backs.`, cites: [`${JUNIPER.cimFile} · ${JUNIPER.ebitdaPage}`] },
  { id: "customers", heading: "Customers", text: "Diversified across regional utilities and industrial accounts. The top customer is significant and worth a question in the first call.", cites: [`${JUNIPER.cimFile} · ${JUNIPER.concentrationPage}`] },
  { id: "next", heading: "Suggested questions", text: "Contract terms with the top customer. Capex plan. Management retention after close.", cites: [] },
]
export const TRAINED_OUTPUT: OutputBlock[] = [
  { id: "decision", heading: "Decision", text: `${JUNIPER.danielCall}. Matches Daniel Okoro's call on the same CIM.`, cites: ["Q3 criteria", "Daniel Okoro · reviewed screens"], tone: "match" },
  { id: "concentration", heading: "Customer concentration", text: `Top customer is ${JUNIPER.concentration} of revenue, above the fund's ${JUNIPER.ceiling} ceiling. This is the question that decides the deal.`, cites: [`${JUNIPER.cimFile} · ${JUNIPER.concentrationPage}`, "Q3 criteria · concentration"], tone: "flag" },
  { id: "revenue", heading: "Revenue · unresolved", text: `${JUNIPER.teaserRevenue} in the banker teaser vs ${JUNIPER.cimRevenue} in the audited financials. Both kept. Ask the banker which one the model should use.`, cites: [`${JUNIPER.teaserFile} · p.2`, `${JUNIPER.cimFile} · ${JUNIPER.cimRevenuePage}`], tone: "unresolved" },
  { id: "ebitda", heading: "Adjusted EBITDA", text: `${JUNIPER.ebitda}. Add-backs look standard.`, cites: [`${JUNIPER.cimFile} · ${JUNIPER.ebitdaPage}`] },
]

export const TRAINED = { label: "Trained CIM screener", stage: "learning" as Stage, reviewed: 120, note: "Illustrative: what the same agent looks like after 120 reviewed screens." }
export const EVAL_TREND: { screens: number; agreement: number }[] = [
  { screens: 10, agreement: 62 },
  { screens: 25, agreement: 70 },
  { screens: 50, agreement: 78 },
  { screens: 80, agreement: 84 },
  { screens: 120, agreement: 88 },
]

export const END_CARD = "Your first agent on real deal data in 30 days."

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export type ActivityKind = "read" | "blocked" | "deploy" | "policy" | "request" | "system" | "confirm"
export type Activity = { id: string; at: Date; actorId: string; kind: ActivityKind; text: string }
export const ACTIVITY: Activity[] = [
  { id: "a-0107", at: new Date("2026-11-04T09:40:00-05:00"), actorId: "daniel", kind: "confirm", text: "confirmed the Q3 thesis as current for request R-3" },
  { id: "a-0106", at: new Date("2026-11-03T16:20:00-05:00"), actorId: "daniel", kind: "request", text: "submitted R-6 · real estate data tool" },
  { id: "a-0105", at: new Date("2026-11-03T11:05:00-05:00"), actorId: "leo", kind: "request", text: "submitted R-5 · quarterly LP letter draft" },
  { id: "a-0104", at: new Date("2026-11-02T14:30:00-05:00"), actorId: "leo", kind: "request", text: "submitted R-4 · portfolio KPI roll-up" },
  { id: "a-0103", at: new Date("2026-10-31T10:00:00-04:00"), actorId: "enakt", kind: "system", text: "merged Portfolio company KPIs into the brain · 9 companies" },
  { id: "a-0102", at: new Date("2026-10-28T15:40:00-04:00"), actorId: "ruth", kind: "request", text: "submitted R-2 · deal-wall check" },
  { id: "a-0101", at: new Date("2026-10-24T09:00:00-04:00"), actorId: "leo", kind: "system", text: "installed Enakt in Kestrel Ridge's cloud · Enakt Inc. accounts: none" },
]
