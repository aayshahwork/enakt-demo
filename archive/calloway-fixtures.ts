/**
 * Enakt PE demo fixtures — Calloway Hill Partners.
 * Every name, number, and date on screen comes from here. Nothing is fetched.
 * "Now" is pinned so relative timestamps are identical on every take.
 * Synthetic firm, people and companies. Vendor names appear as plain text only.
 */

export const NOW = new Date("2026-11-04T10:15:00-05:00")

export const FIRM = "calloway"
export const BASE = `/${FIRM}`
export const href = (path = "") => `${BASE}${path}`

export const WORKSPACE = {
  slug: FIRM,
  name: "Calloway Hill Partners",
  short: "Calloway Hill",
  others: [
    { name: "Brightwater Capital", slug: "brightwater" },
    { name: "Marlow Ridge Equity", slug: "marlow-ridge" },
  ],
}

export const FUND = { name: "Fund III", size: "$850M", people: 35, focus: "mid-market" }

/** "Firm AI-ready" meter. 22% at start, 34% once CR-7 merges and the first agent is live. */
export const METER = { before: 22, after: 34, total: 12 }

export const MODEL = {
  name: "Claude via Azure",
  short: "Claude",
  tenant: "Calloway Hill tenant",
  region: "West US 2",
  note: "no training",
  localEndpoint: "Local model endpoint",
}

export const DEPLOYMENT = {
  installedOn: "Oct 24, 2026",
  installedAt: new Date("2026-10-24T09:00:00-04:00"),
  installedBy: "Calloway Hill IT",
  tenant: "Azure · Calloway Hill tenant",
  region: "West US 2",
  sso: "SSO via Entra ID",
  version: "enakt 1.9.0",
  day: 12,
  totalDays: 30,
  enaktAccounts: "none",
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------

export type DealId = "atlas" | "birch"
export type Deal = { id: DealId; code: string; name: string; company: string; sector: string; stage: string; ic?: string; nda: string; leadId: string }
export const DEALS: Record<DealId, Deal> = {
  atlas: { id: "atlas", code: "ATLAS", name: "Project Atlas", company: "Northline Mechanical", sector: "HVAC services", stage: "In diligence", ic: "Nov 20", nda: "Seller NDA · use limited to evaluating Atlas", leadId: "ellen" },
  birch: { id: "birch", code: "BIRCH", name: "Project Birch", company: "Fairhaven Dental Partners", sector: "Dental services", stage: "In diligence", nda: "Separate seller NDA · use limited to evaluating Birch", leadId: "owen" },
}

export const PORTFOLIO = ["Harrow Logistics", "Pinecrest Veterinary", "Belmont Fire & Safety", "Oakline Packaging", "Sutter Home Health", "Granite Field Services"]

// ---------------------------------------------------------------------------
// People and agents
// ---------------------------------------------------------------------------

export type ActorKind = "person" | "agent" | "group"
export type AgentStatus = "live" | "build" | "queued" | "blocked"
export type Actor = {
  id: string
  name: string
  role: string
  kind: ActorKind
  initials: string
  email?: string
  /** Agents: a one-line purpose. */
  purpose?: string
  /** Agents: where they are in the rollout. */
  status?: AgentStatus
  /** Agents: which request created them. */
  requestId?: string
  /** Agents: sources in scope (proposed or live). */
  scope?: SourceId[]
  /** Agents: who they act for. */
  actsFor?: string
}

export const PEOPLE: Record<string, Actor> = {
  dana: { id: "dana", name: "Dana Ruiz", role: "Head of Operations", kind: "person", initials: "DR", email: "dana.ruiz@callowayhill.com" },
  ellen: { id: "ellen", name: "Ellen Marsh", role: "Partner · Atlas lead", kind: "person", initials: "EM", email: "ellen.marsh@callowayhill.com" },
  tom: { id: "tom", name: "Tom Becker", role: "Vice President · Atlas", kind: "person", initials: "TB", email: "tom.becker@callowayhill.com" },
  nina: { id: "nina", name: "Nina Alvarez", role: "Associate · Atlas", kind: "person", initials: "NA", email: "nina.alvarez@callowayhill.com" },
  owen: { id: "owen", name: "Owen Pratt", role: "Partner · Birch lead", kind: "person", initials: "OP", email: "owen.pratt@callowayhill.com" },
  grace: { id: "grace", name: "Grace Liu", role: "CFO & Chief Compliance Officer", kind: "person", initials: "GL", email: "grace.liu@callowayhill.com" },
  "atlas-team": { id: "atlas-team", name: "Atlas deal team", role: "Ellen, Tom, Nina", kind: "group", initials: "AT" },
}

export const AGENTS: Record<string, Actor> = {
  "atlas-memo-agent": {
    id: "atlas-memo-agent",
    name: "atlas-memo-agent",
    role: "IC memo drafter",
    kind: "agent",
    initials: "AM",
    purpose: "Drafts the financial section of the Atlas IC memo from the data room, the model and the deal record. Returns drafts for review.",
    status: "build",
    requestId: "r-3",
    scope: ["atlas-dataroom", "atlas-model-v7", "deal-records", "ic-template"],
    actsFor: "ellen",
  },
  "connect-agent": {
    id: "connect-agent",
    name: "connect-agent",
    role: "Connection agent",
    kind: "agent",
    initials: "CN",
    purpose: "Scans metadata, drafts scope plans and opens connection requests. Never approves, never reads rows.",
    status: "live",
    scope: [],
  },
  "portfolio-kpi-agent": {
    id: "portfolio-kpi-agent",
    name: "portfolio-kpi-agent",
    role: "Portfolio KPI roll-up",
    kind: "agent",
    initials: "PK",
    purpose: "Would read the six KPI packs and the board decks to draft the monthly portfolio summary.",
    status: "queued",
    requestId: "r-4",
    scope: ["kpi-pack", "board-decks"],
    actsFor: "grace",
  },
  "lp-letter-agent": {
    id: "lp-letter-agent",
    name: "lp-letter-agent",
    role: "LP letter drafter",
    kind: "agent",
    initials: "LP",
    purpose: "Would draft quarterly LP letters. Needs the LP database, which is red until the CCO decides.",
    status: "blocked",
    requestId: "r-5",
    scope: ["lp-database", "board-decks"],
    actsFor: "owen",
  },
}

export const AGENT_ORDER = ["atlas-memo-agent", "connect-agent", "portfolio-kpi-agent", "lp-letter-agent"]

export const AGENT_STATUS_LABEL: Record<AgentStatus, string> = { live: "Live", build: "In build", queued: "Queued", blocked: "Blocked" }

export const ACTORS: Record<string, Actor> = Object.fromEntries([...Object.values(PEOPLE), ...Object.values(AGENTS)].map((a) => [a.id, a]))

export const CURRENT_USER = PEOPLE.dana

// ---------------------------------------------------------------------------
// Lanes and sources
// ---------------------------------------------------------------------------

export type LaneId = "atlas" | "birch" | "portfolio" | "fundops" | "firmwide"
export type Lane = { id: LaneId; label: string; sub: string; order: number; dealId?: DealId }
export const LANES: Lane[] = [
  { id: "atlas", label: "Project Atlas", sub: "Northline Mechanical · in diligence", order: 0, dealId: "atlas" },
  { id: "birch", label: "Project Birch", sub: "Fairhaven Dental Partners · separate NDA", order: 1, dealId: "birch" },
  { id: "portfolio", label: "Portfolio", sub: "6 companies", order: 2 },
  { id: "fundops", label: "Fund ops", sub: "LP and fund-level data", order: 3 },
  { id: "firmwide", label: "Firm-wide", sub: "Shared systems, row-filtered by deal", order: 4 },
]
export const LANE_BY_ID = Object.fromEntries(LANES.map((l) => [l.id, l])) as Record<LaneId, Lane>

export type SourceType = "datasite" | "sharepoint" | "dealcloud" | "excel" | "fundadmin" | "outlook"
export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  datasite: "Datasite",
  sharepoint: "SharePoint",
  dealcloud: "DealCloud",
  excel: "Excel",
  fundadmin: "Fund admin portal",
  outlook: "Outlook",
}

export type Verdict = "unchecked" | "ready" | "attention" | "conflict" | "restricted"
export const VERDICT_LABEL: Record<Verdict, string> = {
  unchecked: "Not scanned",
  ready: "Ready",
  attention: "Needs work",
  conflict: "Conflict",
  restricted: "Restricted",
}
/** Readiness table order: red-conflict → yellow → green → red-policy. */
export const VERDICT_URGENCY: Record<Verdict, number> = { conflict: 0, attention: 1, ready: 2, restricted: 3, unchecked: 4 }
/** Green / yellow / red for the canvas edge strip. */
export const VERDICT_TONE: Record<Verdict, "green" | "yellow" | "red" | "none"> = { ready: "green", attention: "yellow", conflict: "red", restricted: "red", unchecked: "none" }

export type SourceId =
  | "atlas-dataroom"
  | "atlas-model-v7"
  | "atlas-model-v6"
  | "birch-dataroom"
  | "birch-model"
  | "deal-records"
  | "ic-template"
  | "kpi-pack"
  | "board-decks"
  | "lp-database"
  | "fee-carry"
  | "deal-email"

export type Task = { text: string; assignee: string; due: string }

export type Source = {
  id: SourceId
  n: number
  name: string
  type: SourceType
  lane: LaneId
  slot: number
  verdict: Verdict
  ownerId: string
  records: number
  recordNoun: string
  lastSync: Date
  location: string
  reason: string
  task: Task | null
  /** Where access is enforced for this source. */
  enforcement: string
  /** Which permissions column this source belongs to. */
  resource: ResourceId
}

const SYNC = (h: number, m: number) => new Date(`2026-11-04T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00-05:00`)

export const SOURCES: Source[] = [
  {
    id: "atlas-dataroom",
    n: 1,
    name: "Atlas data room",
    type: "datasite",
    lane: "atlas",
    slot: 0,
    verdict: "conflict",
    ownerId: "tom",
    records: 1284,
    recordNoun: "files",
    lastSync: SYNC(10, 11),
    location: "datasite://atlas/**",
    reason: "1,284 files indexed, folder IDs stable. TTM revenue in the CIM ($48.2M, p.14) disagrees with the monthly P&L ($46.9M, F42). Held, both values kept with sources.",
    task: { text: "Resolve TTM revenue: CIM p.14 vs Monthly P&L F42", assignee: "nina", due: "Nov 12" },
    enforcement: "Datasite group membership · atlas-deal-team",
    resource: "atlas",
  },
  {
    id: "atlas-model-v7",
    n: 2,
    name: "Atlas_Model_v7.xlsx",
    type: "sharepoint",
    lane: "atlas",
    slot: 1,
    verdict: "ready",
    ownerId: "nina",
    records: 14,
    recordNoun: "tabs",
    lastSync: SYNC(10, 9),
    location: "sharepoint://deals/atlas/Atlas_Model_v7.xlsx",
    reason: "Current model, confirmed by Nina Alvarez in clarification 1.",
    task: null,
    enforcement: "SharePoint site permission · deals/atlas",
    resource: "atlas",
  },
  {
    id: "atlas-model-v6",
    n: 3,
    name: "Atlas_Model_v6.xlsx",
    type: "sharepoint",
    lane: "atlas",
    slot: 2,
    verdict: "attention",
    ownerId: "nina",
    records: 13,
    recordNoun: "tabs",
    lastSync: SYNC(10, 9),
    location: "sharepoint://deals/atlas/archive/Atlas_Model_v6.xlsx",
    reason: "Superseded by v7 but still linked from the memo draft. Out of scope until the link is retired.",
    task: { text: "Retire the v6 link in the memo draft", assignee: "nina", due: "Nov 8" },
    enforcement: "SharePoint site permission · deals/atlas",
    resource: "atlas",
  },
  {
    id: "birch-dataroom",
    n: 4,
    name: "Birch data room",
    type: "datasite",
    lane: "birch",
    slot: 0,
    verdict: "restricted",
    ownerId: "owen",
    records: 912,
    recordNoun: "files",
    lastSync: SYNC(10, 11),
    location: "datasite://birch/**",
    reason: "Birch NDA: use limited to evaluating Birch. No agent outside the Birch team may read it.",
    task: null,
    enforcement: "Datasite group membership · birch-deal-team",
    resource: "birch",
  },
  {
    id: "birch-model",
    n: 5,
    name: "Birch_Model.xlsx",
    type: "sharepoint",
    lane: "birch",
    slot: 1,
    verdict: "restricted",
    ownerId: "owen",
    records: 11,
    recordNoun: "tabs",
    lastSync: SYNC(10, 9),
    location: "sharepoint://deals/birch/Birch_Model.xlsx",
    reason: "Birch team only. Covered by the same NDA as the data room.",
    task: null,
    enforcement: "SharePoint site permission · deals/birch",
    resource: "birch",
  },
  {
    id: "deal-records",
    n: 6,
    name: "Deal records",
    type: "dealcloud",
    lane: "firmwide",
    slot: 0,
    verdict: "ready",
    ownerId: "dana",
    records: 214,
    recordNoun: "deals",
    lastSync: SYNC(10, 4),
    location: "dealcloud.deals",
    reason: "Row filter by deal available. atlas-memo-agent sees WHERE deal_id = 'ATLAS' and nothing else.",
    task: null,
    enforcement: "DealCloud row filter · deal_id = 'ATLAS'",
    resource: "atlas",
  },
  {
    id: "ic-template",
    n: 7,
    name: "IC memo template",
    type: "sharepoint",
    lane: "firmwide",
    slot: 1,
    verdict: "ready",
    ownerId: "dana",
    records: 1,
    recordNoun: "template · v4",
    lastSync: SYNC(10, 9),
    location: "sharepoint://templates/ic-memo-v4.docx",
    reason: "Template v4, used since 2024. Read-only for every agent.",
    task: null,
    enforcement: "SharePoint site permission · templates (read)",
    resource: "atlas",
  },
  {
    id: "kpi-pack",
    n: 8,
    name: "Portfolio KPI pack",
    type: "excel",
    lane: "portfolio",
    slot: 0,
    verdict: "attention",
    ownerId: "grace",
    records: 6,
    recordNoun: "workbooks",
    lastSync: SYNC(9, 10),
    location: "sharepoint://portfolio/kpi/*.xlsx",
    reason: "6 formats, 2 missing September. portfolio-kpi-agent waits until the packs line up.",
    task: { text: "Collect September packs from 2 companies", assignee: "grace", due: "Nov 14" },
    enforcement: "SharePoint site permission · portfolio",
    resource: "portfolio",
  },
  {
    id: "board-decks",
    n: 9,
    name: "Board decks",
    type: "sharepoint",
    lane: "portfolio",
    slot: 1,
    verdict: "ready",
    ownerId: "grace",
    records: 48,
    recordNoun: "decks",
    lastSync: SYNC(10, 9),
    location: "sharepoint://portfolio/board/**",
    reason: "Quarterly, consistent naming. Ready for a scoped read once an agent is approved.",
    task: null,
    enforcement: "SharePoint site permission · portfolio",
    resource: "portfolio",
  },
  {
    id: "lp-database",
    n: 10,
    name: "LP database",
    type: "fundadmin",
    lane: "fundops",
    slot: 0,
    verdict: "restricted",
    ownerId: "grace",
    records: 212,
    recordNoun: "LPs",
    lastSync: new Date("2026-11-03T18:00:00-05:00"),
    location: "fundadmin://calloway/fund-iii/lps",
    reason: "LP confidential. CCO approval required before any agent reads it. lp-letter-agent is waiting on that decision.",
    task: { text: "Decide the lp-letter-agent request", assignee: "grace", due: "Nov 7" },
    enforcement: "Fund admin portal role · CCO only",
    resource: "lp",
  },
  {
    id: "fee-carry",
    n: 11,
    name: "Fee & carry calc",
    type: "excel",
    lane: "fundops",
    slot: 1,
    verdict: "restricted",
    ownerId: "grace",
    records: 3,
    recordNoun: "workbooks",
    lastSync: new Date("2026-10-31T17:30:00-04:00"),
    location: "sharepoint://leadership/fund-iii/Fee_Carry.xlsx",
    reason: "Leadership only, no agents. Never scanned past the file name.",
    task: null,
    enforcement: "SharePoint site permission · leadership (no agents)",
    resource: "fee",
  },
  {
    id: "deal-email",
    n: 12,
    name: "Deal-team email",
    type: "outlook",
    lane: "firmwide",
    slot: 2,
    verdict: "attention",
    ownerId: "dana",
    records: 18240,
    recordNoun: "messages (metadata)",
    lastSync: new Date("2026-11-03T22:00:00-05:00"),
    location: "outlook://groups/deal-teams",
    reason: "Metadata only, not connected. No agent has requested it.",
    task: { text: "Decide whether to connect Outlook metadata", assignee: "dana", due: "Nov 18" },
    enforcement: "Not connected",
    resource: "atlas",
  },
]

export const SOURCE_BY_ID: Record<SourceId, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<SourceId, Source>
export const sourcesInLane = (lane: LaneId) => SOURCES.filter((s) => s.lane === lane).sort((a, b) => a.slot - b.slot)

// ---------------------------------------------------------------------------
// Canvas geometry
// ---------------------------------------------------------------------------

export const LAYOUT = {
  nodeW: 212,
  nodeH: 70,
  laneW: 692,
  laneH: 124,
  laneGap: 18,
  padX: 16,
  nodeY: 40,
  slotGap: 12,
  agentX: 760,
}

export const lanePos = (lane: LaneId) => ({ x: 0, y: LANE_BY_ID[lane].order * (LAYOUT.laneH + LAYOUT.laneGap) })
export const slotPos = (slot: number) => ({ x: LAYOUT.padX + slot * (LAYOUT.nodeW + LAYOUT.slotGap), y: LAYOUT.nodeY })
export const sourceAbsPos = (id: SourceId) => {
  const s = SOURCE_BY_ID[id]
  const l = lanePos(s.lane)
  const p = slotPos(s.slot)
  return { x: l.x + p.x, y: l.y + p.y }
}
export const AGENT_LANE: Record<string, LaneId> = { "atlas-memo-agent": "atlas", "portfolio-kpi-agent": "portfolio", "lp-letter-agent": "fundops", "connect-agent": "firmwide" }
export const agentPos = (id: string) => ({ x: LAYOUT.agentX, y: lanePos(AGENT_LANE[id]).y + (LAYOUT.laneH - LAYOUT.nodeH) / 2 })

export type EdgeKind = "scope" | "requested" | "blocked" | "dep"
export type GraphEdge = { id: string; source: string; target: string; kind: EdgeKind; label?: string }

export const EDGES: GraphEdge[] = [
  { id: "atlas-memo-agent>atlas-dataroom", source: "atlas-memo-agent", target: "atlas-dataroom", kind: "scope" },
  { id: "atlas-memo-agent>atlas-model-v7", source: "atlas-memo-agent", target: "atlas-model-v7", kind: "scope" },
  { id: "atlas-memo-agent>deal-records", source: "atlas-memo-agent", target: "deal-records", kind: "scope" },
  { id: "atlas-memo-agent>ic-template", source: "atlas-memo-agent", target: "ic-template", kind: "scope" },
  { id: "portfolio-kpi-agent>kpi-pack", source: "portfolio-kpi-agent", target: "kpi-pack", kind: "requested" },
  { id: "portfolio-kpi-agent>board-decks", source: "portfolio-kpi-agent", target: "board-decks", kind: "requested" },
  { id: "lp-letter-agent>lp-database", source: "lp-letter-agent", target: "lp-database", kind: "blocked" },
  { id: "atlas-model-v6>atlas-model-v7", source: "atlas-model-v6", target: "atlas-model-v7", kind: "dep", label: "superseded by" },
]
export const EDGE_BY_ID = Object.fromEntries(EDGES.map((e) => [e.id, e])) as Record<string, GraphEdge>

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

export type Policy = {
  id: string
  rule: string
  sourceId: string
  sourceLabel: string
  date: string
  fromClarification: boolean
  /** Transcript entry id this came from. */
  transcriptId?: string
  governsLanes: LaneId[]
  governsSources: SourceId[]
}

export const POLICIES: Policy[] = [
  {
    id: "deal-data-within-deal",
    rule: "Deal data is used only within its deal",
    sourceId: "tom",
    sourceLabel: "Tom Becker · clarification 2",
    date: "Oct 31",
    fromClarification: true,
    transcriptId: "b2-a",
    governsLanes: ["atlas", "birch"],
    governsSources: ["atlas-dataroom", "atlas-model-v7", "atlas-model-v6", "birch-dataroom", "birch-model"],
  },
  {
    id: "birch-nda",
    rule: "Birch materials: use limited to evaluating Birch",
    sourceId: "tom",
    sourceLabel: "Tom Becker · clarification 2",
    date: "Oct 31",
    fromClarification: true,
    transcriptId: "b2-a",
    governsLanes: ["birch"],
    governsSources: ["birch-dataroom", "birch-model"],
  },
  {
    id: "lp-cco",
    rule: "LP data needs CCO approval before any agent reads it",
    sourceId: "grace",
    sourceLabel: "Grace Liu · kickoff",
    date: "Oct 28",
    fromClarification: false,
    governsLanes: ["fundops"],
    governsSources: ["lp-database"],
  },
  {
    id: "fee-carry-leadership",
    rule: "Fee & carry is leadership only, no agents",
    sourceId: "grace",
    sourceLabel: "Grace Liu · kickoff",
    date: "Oct 28",
    fromClarification: false,
    governsLanes: ["fundops"],
    governsSources: ["fee-carry"],
  },
  {
    id: "two-approvals",
    rule: "Agents propose connections; the deal partner and the CCO approve",
    sourceId: "dana",
    sourceLabel: "Dana Ruiz · kickoff",
    date: "Oct 27",
    fromClarification: false,
    governsLanes: [],
    governsSources: [],
  },
  {
    id: "traced-facts",
    rule: "Every fact an agent uses traces to a file and a location",
    sourceId: "ellen",
    sourceLabel: "Ellen Marsh · request R-3",
    date: "Oct 26",
    fromClarification: false,
    governsLanes: [],
    governsSources: [],
  },
]
export const POLICY_BY_ID = Object.fromEntries(POLICIES.map((p) => [p.id, p])) as Record<string, Policy>

export type AgentPolicy = { readable: string; code: string[]; enforcement: string[]; ruleIds: string[] }
export const AGENT_POLICY: Record<string, AgentPolicy> = {
  "atlas-memo-agent": {
    readable: "Reads Project Atlas only. Never writes. Drafts go to the deal team.",
    code: [
      "agent: atlas-memo-agent",
      "read: datasite://atlas/**        (group: atlas-deal-team)",
      "read: sharepoint://deals/atlas/Atlas_Model_v7.xlsx",
      "read: dealcloud.deals WHERE deal_id = 'ATLAS'",
      "read: sharepoint://templates/ic-memo-v4.docx",
      "write: none (drafts returned for review)",
      "deny: datasite://birch/**          (policy: birch-nda)",
      "deny: fundadmin://**               (policy: lp-cco)",
    ],
    enforcement: ["Datasite group membership", "SharePoint site permission", "DealCloud row filter", "Model gateway denies tools outside scope"],
    ruleIds: ["deal-data-within-deal", "traced-facts"],
  },
  "connect-agent": {
    readable: "Reads schemas and metadata only. Opens connection requests. Cannot approve, cannot read rows.",
    code: ["agent: connect-agent", "read: metadata://**", "write: connection-requests (draft)", "approve: none", "deny: rows://**"],
    enforcement: ["Metadata-only API tokens", "Model gateway denies row-level tools", "Two approvals required on every request"],
    ruleIds: ["two-approvals"],
  },
  "portfolio-kpi-agent": {
    readable: "Requested. Would read the Portfolio lane only. Waiting on KPI cleanup before a connection request opens.",
    code: ["agent: portfolio-kpi-agent", "status: queued (R-4)", "proposed read: sharepoint://portfolio/kpi/*.xlsx", "proposed read: sharepoint://portfolio/board/**", "write: none"],
    enforcement: ["SharePoint site permission (proposed)", "Model gateway denies tools until a request merges"],
    ruleIds: ["two-approvals", "traced-facts"],
  },
  "lp-letter-agent": {
    readable: "Requested. Needs the LP database, which is red. Blocked until Grace Liu decides.",
    code: ["agent: lp-letter-agent", "status: blocked (R-5)", "requested read: fundadmin://calloway/fund-iii/lps   # red: lp-cco", "requested read: sharepoint://portfolio/board/**", "write: none"],
    enforcement: ["Fund admin portal role · CCO only", "Model gateway denies tools until a request merges"],
    ruleIds: ["lp-cco", "two-approvals"],
  },
}

export type OpenQuestion = { id: string; text: string; routedTo: string }
export const OPEN_QUESTIONS: Record<string, OpenQuestion> = {
  "ttm-revenue": { id: "ttm-revenue", text: "TTM revenue: CIM says $48.2M, monthly P&L says $46.9M", routedTo: "nina" },
}

// ---------------------------------------------------------------------------
// Permissions matrix
// ---------------------------------------------------------------------------

export type ResourceId = "atlas" | "birch" | "portfolio" | "lp" | "fee"
export const RESOURCES: { id: ResourceId; label: string }[] = [
  { id: "atlas", label: "Atlas" },
  { id: "birch", label: "Birch" },
  { id: "portfolio", label: "Portfolio" },
  { id: "lp", label: "LP data" },
  { id: "fee", label: "Fee & carry" },
]

export type AccessLevel = "none" | "read" | "own" | "propose" | "approve"
export const ACCESS_LABEL: Record<AccessLevel, string> = { none: "No access", read: "Read", own: "Own deal", propose: "Propose", approve: "Approve" }
export const ACCESS_ORDER: AccessLevel[] = ["none", "read", "own", "propose", "approve"]

export const MATRIX_PEOPLE = ["ellen", "tom", "nina", "owen", "grace", "dana"]
export const MATRIX_AGENTS = AGENT_ORDER

export type Matrix = Record<string, Record<ResourceId, AccessLevel>>

export const INITIAL_MATRIX: Matrix = {
  ellen: { atlas: "approve", birch: "none", portfolio: "read", lp: "read", fee: "read" },
  tom: { atlas: "own", birch: "none", portfolio: "read", lp: "none", fee: "none" },
  nina: { atlas: "own", birch: "none", portfolio: "read", lp: "none", fee: "none" },
  owen: { atlas: "none", birch: "approve", portfolio: "read", lp: "read", fee: "read" },
  grace: { atlas: "read", birch: "read", portfolio: "approve", lp: "approve", fee: "approve" },
  dana: { atlas: "read", birch: "read", portfolio: "read", lp: "none", fee: "none" },
  "atlas-memo-agent": { atlas: "read", birch: "none", portfolio: "none", lp: "none", fee: "none" },
  "connect-agent": { atlas: "propose", birch: "propose", portfolio: "propose", lp: "none", fee: "none" },
  "portfolio-kpi-agent": { atlas: "none", birch: "none", portfolio: "none", lp: "none", fee: "none" },
  "lp-letter-agent": { atlas: "none", birch: "none", portfolio: "none", lp: "none", fee: "none" },
}

// ---------------------------------------------------------------------------
// View-as scopes on the map
// ---------------------------------------------------------------------------

export type Viewer = "dana" | "atlas-team" | "atlas-memo-agent"
export const VIEWERS: { id: Viewer; label: string; sub: string }[] = [
  { id: "dana", label: "Dana Ruiz", sub: "admin · all 12 sources" },
  { id: "atlas-team", label: "Atlas deal team", sub: "Atlas lane + firm-wide · 6 sources" },
  { id: "atlas-memo-agent", label: "atlas-memo-agent", sub: "agent · 4 sources, Atlas only" },
]
export const VIEW_SCOPE: Record<Viewer, SourceId[] | "all"> = {
  dana: "all",
  "atlas-team": ["atlas-dataroom", "atlas-model-v7", "atlas-model-v6", "deal-records", "ic-template", "deal-email"],
  "atlas-memo-agent": ["atlas-dataroom", "atlas-model-v7", "deal-records", "ic-template"],
}
export const VIEW_AGENTS: Record<Viewer, string[] | "all"> = {
  dana: "all",
  "atlas-team": ["atlas-memo-agent", "connect-agent"],
  "atlas-memo-agent": ["atlas-memo-agent"],
}
export const VIEW_BANNER: Record<Viewer, string | null> = {
  dana: null,
  "atlas-team": "Viewing as the Atlas deal team · 6 of 12 sources. Birch, Portfolio and Fund ops are not visible to them here.",
  "atlas-memo-agent": "Scoped to Project Atlas · read-only.",
}

// ---------------------------------------------------------------------------
// The request, the scope plan, the conflict
// ---------------------------------------------------------------------------

export type RequestStatus = "done" | "scoping" | "scoped" | "queued" | "blocked"
export type Request = { id: string; label: string; title: string; text: string; requesterId: string; submittedAt: Date; status: RequestStatus; agentId?: string; dealId?: DealId }
export const REQUESTS: Request[] = [
  { id: "r-3", label: "R-3", title: "Atlas IC memo · financial section", text: "When a data room lands, draft the financial section of the IC memo in our template. Start with Atlas.", requesterId: "ellen", submittedAt: new Date("2026-10-26T09:12:00-04:00"), status: "scoping", agentId: "atlas-memo-agent", dealId: "atlas" },
  { id: "r-4", label: "R-4", title: "Monthly portfolio KPI summary", text: "Roll up the six KPI packs into one monthly summary for the ops call.", requesterId: "grace", submittedAt: new Date("2026-11-02T14:30:00-05:00"), status: "queued", agentId: "portfolio-kpi-agent" },
  { id: "r-5", label: "R-5", title: "Quarterly LP letter draft", text: "Draft the Fund III quarterly letter from the board decks and the LP database.", requesterId: "owen", submittedAt: new Date("2026-11-02T16:45:00-05:00"), status: "blocked", agentId: "lp-letter-agent" },
  { id: "r-2", label: "R-2", title: "Confirm IC memo template version", text: "Which IC memo template is current, and who owns it?", requesterId: "dana", submittedAt: new Date("2026-10-25T15:00:00-04:00"), status: "done" },
  { id: "r-1", label: "R-1", title: "Index Atlas data room metadata", text: "Index folder names and file counts in the Atlas data room. No file contents.", requesterId: "tom", submittedAt: new Date("2026-10-25T10:30:00-04:00"), status: "done" },
]
export const REQUEST = REQUESTS[0]
export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = { done: "Done", scoping: "Scoping", scoped: "Scoped · CR-7 open", queued: "Queued", blocked: "Blocked" }

export type PlanColumn = "needs" | "ask" | "never"
export type PlanItem = { id: string; column: PlanColumn; label: string; sourceId?: SourceId; personId?: string; laneId?: LaneId; sub?: string }
export const PLAN_ITEMS: PlanItem[] = [
  { id: "needs-dataroom", column: "needs", label: "Atlas data room", sourceId: "atlas-dataroom", sub: "Datasite · 1,284 files" },
  { id: "needs-model", column: "needs", label: "Atlas model", sourceId: "atlas-model-v7", sub: "SharePoint · which version?" },
  { id: "needs-record", column: "needs", label: "Atlas deal record", sourceId: "deal-records", sub: "DealCloud · row-filtered" },
  { id: "needs-template", column: "needs", label: "IC memo template", sourceId: "ic-template", sub: "SharePoint · v4" },
  { id: "ask-tom", column: "ask", label: "Tom Becker", personId: "tom", sub: "owns the data room" },
  { id: "ask-nina", column: "ask", label: "Nina Alvarez", personId: "nina", sub: "owns the model" },
  { id: "never-deals", column: "never", label: "Other deals", laneId: "birch", sub: "Birch · separate NDA" },
  { id: "never-lp", column: "never", label: "LP data", sourceId: "lp-database", sub: "CCO approval required" },
  { id: "never-fee", column: "never", label: "Fee & carry", sourceId: "fee-carry", sub: "leadership only" },
]
export const PLAN_COLUMN_LABEL: Record<PlanColumn, string> = { needs: "Needs", ask: "Ask", never: "Never touches" }

export const SCAN = { systems: 6, files: 1284, rows: 0, running: "Scanning metadata", done: "Scan complete · schemas and metadata only." }

export const REVENUE = {
  id: "H-0007",
  metric: "TTM revenue",
  period: "Sep 2026",
  dealId: "atlas" as DealId,
  a: { value: "$48.2M", source: "CIM, p.14", file: "01_CIM/Northline_CIM.pdf", loc: "p.14", sourceId: "atlas-dataroom" as SourceId, by: "tom", date: "Oct 29" },
  b: { value: "$46.9M", source: "Monthly P&L, tab TTM, cell F42", file: "04_Financials/Monthly_PL_FY26.xlsx", loc: "TTM!F42", sourceId: "atlas-dataroom" as SourceId, by: "nina", date: "Nov 3" },
  delta: "$1.3M",
  note: "Held out of the agent's facts. Both values kept with their sources.",
  task: { text: "Resolve TTM revenue: CIM p.14 vs Monthly P&L F42", assignee: "nina", due: "Nov 12" },
}

// ---------------------------------------------------------------------------
// Connection request CR-7
// ---------------------------------------------------------------------------

export type CheckStatus = "pass" | "warn"
export type Check = { id: string; label: string; detail: string; status: CheckStatus; ms: string }

export const CR = {
  number: 7,
  slug: "cr-7",
  title: "Connect Atlas sources to atlas-memo-agent",
  openedBy: "connect-agent",
  openedAt: new Date("2026-11-03T16:40:00-05:00"),
  requestId: "r-3",
  agentId: "atlas-memo-agent",
  sources: ["atlas-dataroom", "atlas-model-v7", "deal-records", "ic-template"] as SourceId[],
  approvers: [
    { id: "ellen", role: "Deal partner" },
    { id: "grace", role: "CCO" },
  ],
  stats: { sources: 4, replayed: 412, outside: 0, held: 1 },
  summary:
    "Request R-3 needs four Atlas sources: the data room, the current model, the Atlas deal record and the IC memo template. All four passed readiness with a confirmed owner. This request grants atlas-memo-agent read access to exactly those four, enforced at each system, and nothing else.",
  notRead: "No rows were read to prepare this request. The TTM revenue value is held as H-0007 and stays out of the agent's facts until Nina Alvarez resolves it.",
  diff: [
    "+ agent: atlas-memo-agent",
    "+ read: datasite://atlas/**        (group: atlas-deal-team)",
    "+ read: sharepoint://deals/atlas/Atlas_Model_v7.xlsx",
    "+ read: dealcloud.deals WHERE deal_id = 'ATLAS'",
    "+ read: sharepoint://templates/ic-memo-v4.docx",
    "+ write: none (drafts returned for review)",
  ],
  checks: [
    { id: "dryrun", label: "Dry run: 0 reads outside Project Atlas", detail: "412 attempted queries replayed against the proposed scope. Every read landed inside Atlas or the template.", status: "pass", ms: "2.3s" },
    { id: "nored", label: "No red sources in scope", detail: "Birch, LP database and fee & carry are outside the request. Verified against the policy set.", status: "pass", ms: "0.2s" },
    { id: "traced", label: "Every fact traced to a file and location", detail: "Dry-run output cites a path and a page or cell for each of 23 facts.", status: "pass", ms: "1.1s" },
    { id: "held", label: "1 value held for a person: TTM revenue", detail: "CIM p.14 ($48.2M) and Monthly P&L F42 ($46.9M) disagree. Held as H-0007 for Nina Alvarez, not guessed.", status: "warn", ms: "0.4s" },
  ] as Check[],
  timeline: [
    { id: "t1", at: new Date("2026-11-03T16:40:00-05:00"), actor: "connect-agent", text: "opened this request from scope plan R-3" },
    { id: "t2", at: new Date("2026-11-03T16:41:00-05:00"), actor: "connect-agent", text: "ran 4 checks · 3 passed, 1 warning" },
    { id: "t3", at: new Date("2026-11-03T17:12:00-05:00"), actor: "atlas-memo-agent", text: "dry run blocked a read of datasite://birch/** · logged A-0117" },
    { id: "t4", at: new Date("2026-11-04T09:05:00-05:00"), actor: "dana", text: "set the DealCloud row filter to deal_id = 'ATLAS'" },
    { id: "t5", at: new Date("2026-11-04T09:58:00-05:00"), actor: "connect-agent", text: "re-ran the dry run · 412 queries, 0 outside Atlas" },
  ],
}

export const CONNECTIONS_LIST = [
  { id: "cr-7", label: "CR-7", title: CR.title, openedBy: "connect-agent", openedAt: CR.openedAt, status: "open" as const, approvals: "0 of 2", href: href("/connections/cr-7") },
  { id: "cr-6", label: "CR-6", title: "Connect DealCloud metadata to connect-agent", openedBy: "connect-agent", openedAt: new Date("2026-10-25T11:00:00-04:00"), status: "merged" as const, approvals: "2 of 2", href: href("/connections") },
  { id: "cr-5", label: "CR-5", title: "Connect Datasite and SharePoint metadata", openedBy: "dana", openedAt: new Date("2026-10-25T10:30:00-04:00"), status: "merged" as const, approvals: "2 of 2", href: href("/connections") },
]

// ---------------------------------------------------------------------------
// Agent run: trace and brief
// ---------------------------------------------------------------------------

export type TraceKind = "scope" | "read" | "blocked" | "conflict" | "done"
export type TraceStep = { n: number; kind: TraceKind; title: string; detail: string; path: string; policyId?: string }

export const RUN_PROMPT = "Draft the financial section of the Atlas IC memo."

export const TRACE: TraceStep[] = [
  { n: 1, kind: "scope", title: "Checked scope: Project Atlas, read-only", detail: "4 sources in scope. Writes disabled. Drafts return to the deal team.", path: "policy: atlas-memo-agent" },
  { n: 2, kind: "read", title: "Read memo template", detail: "Section 4, Financial summary. Headings and required fields.", path: "ic-memo-v4.docx" },
  { n: 3, kind: "read", title: "Read deal record", detail: "Northline Mechanical, HVAC services. IC date Nov 20. NWC peg field present.", path: "dealcloud.deals / ATLAS" },
  { n: 4, kind: "read", title: "Read model", detail: "Summary, NWC and Adjustments tabs. Adj. EBITDA $9.1M on FY26 TTM.", path: "Atlas_Model_v7.xlsx / Summary" },
  { n: 5, kind: "read", title: "Read 23 data-room files", detail: "CIM, monthly P&L, QoE draft, customer detail. Each fact kept with its page or cell.", path: "datasite://atlas/04_Financials/*" },
  { n: 6, kind: "blocked", title: "Blocked: pull comparable deal metrics from Project Birch", detail: "The Birch NDA restricts use to Birch, so the agent continued without them.", path: "policy: deal-data-within-deal", policyId: "birch-nda" },
  { n: 7, kind: "conflict", title: "Revenue doesn't tie: kept both values", detail: "$48.2M (CIM p.14) vs $46.9M (Monthly P&L F42). Held as H-0007.", path: "task: Nina Alvarez" },
  { n: 8, kind: "done", title: "Drafted section in template, returned for review", detail: "23 files cited, 1 value unresolved, 1 request blocked.", path: "drafts/atlas/ic-memo-s4-v0.1.docx" },
]

export type Cite = { n: number; label: string }
export type BriefBlock = { id: string; heading: string; text: string; cites: Cite[]; unresolved?: { a: string; b: string } }
export const BRIEF: BriefBlock[] = [
  {
    id: "revenue",
    heading: "Revenue",
    text: "TTM revenue to September 2026 is $46.9M per the monthly P&L, up 11.8% on the prior period. The CIM states $48.2M; the two do not tie and the difference is held for Nina Alvarez.",
    cites: [
      { n: 5, label: "Monthly_PL_FY26.xlsx · TTM!F42" },
      { n: 5, label: "Northline_CIM.pdf · p.14" },
    ],
    unresolved: { a: "$48.2M CIM", b: "$46.9M P&L" },
  },
  {
    id: "ebitda",
    heading: "Adj. EBITDA",
    text: "$9.1M Adj. EBITDA on FY26 TTM, a 19.4% margin. Adjustments total $0.6M, mostly owner compensation and a one-time ERP migration.",
    cites: [
      { n: 4, label: "Atlas_Model_v7.xlsx · Summary!C18" },
      { n: 5, label: "QoE_Draft.pdf · p.6" },
    ],
  },
  {
    id: "concentration",
    heading: "Customer concentration",
    text: "Top 10 customers are 31% of revenue; the largest is 7%. No customer above 10% in any of the last three years.",
    cites: [{ n: 5, label: "Customer_Detail.xlsx · Top10!B4:B13" }],
  },
  {
    id: "nwc",
    heading: "Working capital",
    text: "Net working capital averaged $4.2M over the TTM with a seasonal peak in July. The model assumes a $4.0M peg, consistent with the deal record.",
    cites: [
      { n: 4, label: "Atlas_Model_v7.xlsx · NWC!F9" },
      { n: 3, label: "dealcloud.deals / ATLAS · nwc_peg" },
    ],
  },
  {
    id: "gap",
    heading: "Not included",
    text: "Comparable metrics from Project Birch. The Birch NDA limits that material to Birch, so the request was blocked and this section continues without it.",
    cites: [{ n: 6, label: "policy: deal-data-within-deal" }],
  },
]

export const RUN_FOOTER = `${MODEL.name} (${MODEL.tenant}) · Enakt Inc. accessed nothing · 23 files cited · 1 request blocked`

export type HistoryRow = { id: string; at: Date; prompt: string; cites: number; blocked: number; ms: string }
export const RUN_HISTORY: Record<string, HistoryRow[]> = {
  "atlas-memo-agent": [],
  "connect-agent": [
    { id: "c-41", at: new Date("2026-11-04T09:58:00-05:00"), prompt: "Re-run the CR-7 dry run against the proposed scope.", cites: 0, blocked: 0, ms: "2.3s" },
    { id: "c-40", at: new Date("2026-11-03T16:40:00-05:00"), prompt: "Open a connection request for scope plan R-3.", cites: 0, blocked: 0, ms: "4.1s" },
    { id: "c-39", at: new Date("2026-11-02T10:10:00-05:00"), prompt: "Scan Portfolio KPI pack metadata.", cites: 0, blocked: 0, ms: "1.8s" },
  ],
  "portfolio-kpi-agent": [],
  "lp-letter-agent": [],
}

// ---------------------------------------------------------------------------
// Rollout
// ---------------------------------------------------------------------------

export type Milestone = { id: string; day: number; date: string; label: string; done: boolean; gate?: string; side?: "top" | "bottom" }
export const MILESTONES: Milestone[] = [
  { id: "d1", day: 1, date: "Oct 24", label: "Installed in tenant", done: true },
  { id: "d3", day: 3, date: "Oct 26", label: "First request", done: true, side: "top" },
  { id: "d8", day: 8, date: "Oct 31", label: "Clarifications", done: true },
  { id: "d12", day: 12, date: "Nov 4", label: "Map + readiness", done: true },
  { id: "d15", day: 15, date: "Nov 7", label: "CR-7 approved", done: false, gate: "Ellen Marsh and Grace Liu" },
  { id: "d19", day: 19, date: "Nov 11", label: "First agent live", done: false, gate: "atlas-memo-agent", side: "top" },
  { id: "d30", day: 30, date: "Nov 22", label: "Three agents live", done: false, gate: "portfolio-kpi, lp-letter" },
]

// ---------------------------------------------------------------------------
// Audit log, notifications, access log
// ---------------------------------------------------------------------------

export type AuditKind = "read" | "blocked" | "connect" | "approve" | "policy" | "request" | "system" | "task"
export type AuditEntry = { id: string; at: Date; actorId: string; kind: AuditKind; text: string; href?: string; path?: string }

export const AUDIT: AuditEntry[] = [
  { id: "A-0120", at: new Date("2026-11-04T09:58:00-05:00"), actorId: "connect-agent", kind: "connect", text: "re-ran the CR-7 dry run · 412 queries replayed, 0 reads outside Project Atlas", href: href("/connections/cr-7") },
  { id: "A-0119", at: new Date("2026-11-04T09:40:00-05:00"), actorId: "nina", kind: "task", text: "confirmed Atlas_Model_v7 as the current model", path: "sharepoint://deals/atlas/Atlas_Model_v7.xlsx" },
  { id: "A-0118", at: new Date("2026-11-04T09:05:00-05:00"), actorId: "dana", kind: "policy", text: "set the DealCloud row filter for atlas-memo-agent · deal_id = 'ATLAS'", path: "dealcloud.deals · row filter" },
  { id: "A-0117", at: new Date("2026-11-03T17:12:00-05:00"), actorId: "atlas-memo-agent", kind: "blocked", text: "blocked: attempted to read datasite://birch/** during a dry run · policy deal-data-within-deal", path: "datasite://birch/** → denied at Datasite group", href: href("/agents/atlas-memo-agent") },
  { id: "A-0116", at: new Date("2026-11-03T16:40:00-05:00"), actorId: "connect-agent", kind: "connect", text: "opened CR-7 · connect 4 Atlas sources to atlas-memo-agent", href: href("/connections/cr-7") },
  { id: "A-0115", at: new Date("2026-11-03T15:20:00-05:00"), actorId: "grace", kind: "policy", text: "held the lp-letter-agent request · LP database stays red pending review", href: href("/rollout") },
  { id: "A-0114", at: new Date("2026-11-03T11:02:00-05:00"), actorId: "tom", kind: "task", text: "confirmed Datasite folder IDs for Atlas · 1,284 files", path: "datasite://atlas/** · folder index" },
  { id: "A-0113", at: new Date("2026-11-02T16:45:00-05:00"), actorId: "owen", kind: "request", text: "submitted R-5 · quarterly LP letter draft (needs LP database)", href: href("/requests") },
  { id: "A-0112", at: new Date("2026-11-02T14:30:00-05:00"), actorId: "grace", kind: "request", text: "submitted R-4 · monthly portfolio KPI summary", href: href("/requests") },
  { id: "A-0111", at: new Date("2026-11-02T10:10:00-05:00"), actorId: "connect-agent", kind: "read", text: "scanned Portfolio KPI pack metadata · 6 workbooks, 2 missing September", path: "sharepoint://portfolio/kpi/*.xlsx · metadata" },
  { id: "A-0110", at: new Date("2026-10-31T15:05:00-04:00"), actorId: "nina", kind: "task", text: "answered clarification 3 · TTM revenue conflict logged as H-0007", href: href("/requests/r-3") },
  { id: "A-0109", at: new Date("2026-10-31T14:50:00-04:00"), actorId: "tom", kind: "task", text: "answered clarification 2 · policy deal-data-within-deal recorded", href: href("/requests/r-3") },
  { id: "A-0108", at: new Date("2026-10-31T14:35:00-04:00"), actorId: "nina", kind: "task", text: "answered clarification 1 · Atlas_Model_v7 is current, v6 retired", href: href("/requests/r-3") },
  { id: "A-0107", at: new Date("2026-10-30T09:20:00-04:00"), actorId: "connect-agent", kind: "read", text: "scanned 6 systems for R-3 · 1,284 files · 0 rows read", path: "metadata://** · schemas and file lists" },
  { id: "A-0106", at: new Date("2026-10-28T11:00:00-04:00"), actorId: "grace", kind: "policy", text: "set policy: LP data needs CCO approval before any agent reads it", href: href("/policies") },
  { id: "A-0105", at: new Date("2026-10-28T11:00:00-04:00"), actorId: "grace", kind: "policy", text: "set policy: fee & carry is leadership only, no agents", href: href("/policies") },
  { id: "A-0104", at: new Date("2026-10-27T14:00:00-04:00"), actorId: "dana", kind: "policy", text: "set policy: agents propose connections; the deal partner and the CCO approve", href: href("/policies") },
  { id: "A-0103", at: new Date("2026-10-26T09:12:00-04:00"), actorId: "ellen", kind: "request", text: "submitted R-3 · draft the financial section of the IC memo, start with Atlas", href: href("/requests/r-3") },
  { id: "A-0102", at: new Date("2026-10-25T10:30:00-04:00"), actorId: "dana", kind: "system", text: "connected Datasite, SharePoint and DealCloud · metadata only", href: href("/settings?tab=connections") },
  { id: "A-0101", at: new Date("2026-10-24T09:00:00-04:00"), actorId: "dana", kind: "system", text: "Calloway Hill IT installed Enakt 1.9.0 in the Azure tenant · Enakt Inc. accounts: none", href: href("/settings?tab=deployment") },
]

export const NOTIFICATIONS = [
  { id: "n1", text: "Nina Alvarez has a task: resolve TTM revenue, CIM p.14 vs Monthly P&L F42 · due Nov 12", at: new Date("2026-11-03T16:41:00-05:00"), href: href("/readiness?source=atlas-dataroom") },
  { id: "n2", text: "CR-7 is waiting for approval from Ellen Marsh and Grace Liu · connect Atlas sources to atlas-memo-agent", at: new Date("2026-11-03T16:40:00-05:00"), href: href("/connections/cr-7") },
  { id: "n3", text: "R-5 lp-letter-agent is blocked · needs the LP database, awaiting a CCO decision", at: new Date("2026-11-03T15:20:00-05:00"), href: href("/rollout") },
]

/** Access attempts by Enakt Inc. accounts per day since install. Flat at zero. */
export const ACCESS_LOG = Array.from({ length: 12 }, (_, i) => ({ day: new Date(2026, 9, 24 + i), count: 0 }))

export const SETTINGS_MEMBERS = [
  { id: "dana", seat: "Admin", lastActive: NOW },
  { id: "grace", seat: "Compliance", lastActive: new Date("2026-11-04T09:30:00-05:00") },
  { id: "ellen", seat: "Partner", lastActive: new Date("2026-11-03T18:10:00-05:00") },
  { id: "owen", seat: "Partner", lastActive: new Date("2026-11-02T16:45:00-05:00") },
  { id: "tom", seat: "Member", lastActive: new Date("2026-11-04T08:50:00-05:00") },
  { id: "nina", seat: "Member", lastActive: new Date("2026-11-04T09:40:00-05:00") },
]

export const SYSTEMS: { id: string; type: SourceType; name: string; lastSync: Date | null; mode: "scoped" | "metadata" | "off"; detail: string }[] = [
  { id: "datasite", type: "datasite", name: "Datasite", lastSync: SYNC(10, 11), mode: "scoped", detail: "Atlas and Birch rooms · group membership enforced" },
  { id: "sharepoint", type: "sharepoint", name: "SharePoint", lastSync: SYNC(10, 9), mode: "scoped", detail: "deals, templates, portfolio sites · site permissions" },
  { id: "dealcloud", type: "dealcloud", name: "DealCloud", lastSync: SYNC(10, 4), mode: "scoped", detail: "deals table · row filter by deal_id" },
  { id: "excel", type: "excel", name: "Excel file shares", lastSync: SYNC(9, 10), mode: "metadata", detail: "KPI packs and fee & carry · names and sizes only" },
  { id: "fundadmin", type: "fundadmin", name: "Fund admin portal", lastSync: new Date("2026-11-03T18:00:00-05:00"), mode: "metadata", detail: "LP database · schema only, CCO role required" },
  { id: "outlook", type: "outlook", name: "Outlook", lastSync: null, mode: "off", detail: "Deal-team groups · not connected" },
]
