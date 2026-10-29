/**
 * Enakt demo fixtures — Northfield Wealth Partners.
 * Every name, number, and date in the demo comes from here. Nothing is fetched.
 * "Now" is pinned so relative timestamps are identical on every take.
 */

export const NOW = new Date("2026-10-29T16:40:00-04:00")

export const WORKSPACE = {
  slug: "northfield",
  name: "Northfield Wealth Partners",
  short: "Northfield",
  plan: "Team",
  others: [
    { name: "Harbor Point Advisors", slug: "harbor-point" },
    { name: "Lakeside Family Office", slug: "lakeside" },
  ],
}

export const CONSOLIDATION = { before: 34, after: 41 }

// ---------------------------------------------------------------------------
// People and agents
// ---------------------------------------------------------------------------

export type ActorKind = "person" | "agent"
export type Actor = {
  id: string
  name: string
  role: string
  kind: ActorKind
  initials: string
  /** For agents: the model badge. */
  model?: "Claude" | "Local model" | "GPT"
  email?: string
}

export const PEOPLE: Record<string, Actor> = {
  dana: { id: "dana", name: "Dana Ruiz", role: "Operations", kind: "person", initials: "DR", email: "dana@northfieldwp.com" },
  marcus: { id: "marcus", name: "Marcus Lee", role: "Portfolio Operations", kind: "person", initials: "ML", email: "marcus@northfieldwp.com" },
  priya: { id: "priya", name: "Priya Nair", role: "Finance", kind: "person", initials: "PN", email: "priya@northfieldwp.com" },
  sam: { id: "sam", name: "Sam Ortiz", role: "Client Service", kind: "person", initials: "SO", email: "sam@northfieldwp.com" },
  elena: { id: "elena", name: "Elena Whitfield", role: "Managing Partner", kind: "person", initials: "EW", email: "elena@northfieldwp.com" },
  tom: { id: "tom", name: "Tom Becker", role: "Compliance", kind: "person", initials: "TB", email: "tom@northfieldwp.com" },
}

export const AGENTS: Record<string, Actor> = {
  merge: { id: "merge-agent-01", name: "merge-agent-01", role: "Merge agent", kind: "agent", initials: "MA", model: "Claude" },
  report: { id: "report-agent", name: "report-agent", role: "Report agent", kind: "agent", initials: "RA", model: "Local model" },
  intake: { id: "intake-agent", name: "intake-agent", role: "Intake agent", kind: "agent", initials: "IA", model: "Claude" },
}

export const ACTORS: Record<string, Actor> = Object.fromEntries([...Object.values(PEOPLE), ...Object.values(AGENTS)].map((a) => [a.id, a]))

export const CURRENT_USER = PEOPLE.dana

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export type SourceType = "salesforce" | "excel" | "sheets" | "airtable" | "postgres" | "schwab" | "quickbooks"
export type Verdict = "ready" | "stale" | "conflict" | "unverified" | "restricted"

export const VERDICT_LABEL: Record<Verdict, string> = {
  ready: "Ready",
  stale: "Stale",
  conflict: "Conflict",
  unverified: "Unverified",
  restricted: "Restricted",
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  salesforce: "Salesforce",
  excel: "Excel",
  sheets: "Google Sheets",
  airtable: "Airtable",
  postgres: "Postgres",
  schwab: "Schwab",
  quickbooks: "QuickBooks",
}

export type Source = {
  slug: string
  name: string
  type: SourceType
  verdict: Verdict
  ownerId: string
  ownerConfirmed: boolean
  records: number
  recordNoun: string
  cadence: string
  lastEdit: Date
  lastEditBy: string
  feeds: string[]
  reason: string
  /** Column on the map. */
  lane: "attention" | "ready"
  /** Already governed inside the Unified Client Record (solid dependency edge). */
  governed?: boolean
  /** Included in MR-12. */
  inMerge?: boolean
  location: string
  /** 12-week freshness series, 0..1 (1 = edited that week). */
  freshness: number[]
}

export const SOURCES: Source[] = [
  {
    slug: "salesforce-crm",
    name: "Salesforce CRM",
    type: "salesforce",
    verdict: "conflict",
    ownerId: "dana",
    ownerConfirmed: true,
    records: 412,
    recordNoun: "households",
    cadence: "Continuous",
    lastEdit: new Date("2026-10-29T14:12:00-04:00"),
    lastEditBy: "dana",
    feeds: ["Client portal", "Quarterly letters"],
    reason: "AUM for 40 households disagrees with AUM_Rollup.xlsx. Both values kept with their sources.",
    lane: "attention",
    location: "northfieldwp.my.salesforce.com",
    freshness: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    slug: "aum-rollup",
    name: "AUM_Rollup.xlsx",
    type: "excel",
    verdict: "conflict",
    ownerId: "priya",
    ownerConfirmed: true,
    records: 1118,
    recordNoun: "rows",
    cadence: "Monthly",
    lastEdit: new Date("2026-09-30T18:05:00-04:00"),
    lastEditBy: "priya",
    feeds: ["Quarterly reports", "Billing reconciliation"],
    reason: "Row 214 and 39 others disagree with Salesforce CRM. Next rollup due Oct 31.",
    lane: "attention",
    location: "SharePoint › Finance › Rollups",
    freshness: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  },
  {
    slug: "schwab-custodian-feed",
    name: "Schwab custodian feed",
    type: "schwab",
    verdict: "ready",
    ownerId: "marcus",
    ownerConfirmed: true,
    records: 640,
    recordNoun: "accounts",
    cadence: "Nightly",
    lastEdit: new Date("2026-10-29T02:10:00-04:00"),
    lastEditBy: "schwab-sftp",
    feeds: ["Unified Client Record"],
    reason: "Nightly file landed on schedule. Schema unchanged for 94 days. Owner confirmed.",
    lane: "ready",
    inMerge: true,
    location: "sftp://schwab-advisor-center › NWP_POS.csv",
    freshness: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    slug: "quickbooks-billing",
    name: "QuickBooks billing",
    type: "quickbooks",
    verdict: "ready",
    ownerId: "sam",
    ownerConfirmed: true,
    records: 406,
    recordNoun: "client accounts",
    cadence: "Monthly close",
    lastEdit: new Date("2026-10-27T11:30:00-04:00"),
    lastEditBy: "sam",
    feeds: ["Unified Client Record"],
    reason: "September close complete. Fee schedule matches advisory agreements for 405 of 406 accounts.",
    lane: "ready",
    inMerge: true,
    location: "QuickBooks Online › Northfield Wealth Partners LLC",
    freshness: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  },
  {
    slug: "onboarding-tracker",
    name: "Onboarding tracker",
    type: "airtable",
    verdict: "ready",
    ownerId: "dana",
    ownerConfirmed: true,
    records: 238,
    recordNoun: "records",
    cadence: "Daily",
    lastEdit: new Date("2026-10-29T09:48:00-04:00"),
    lastEditBy: "dana",
    feeds: ["Unified Client Record"],
    reason: "Owner confirmed. Every record carries a household ID that resolves in Salesforce.",
    lane: "ready",
    inMerge: true,
    location: "Airtable › Client Ops › Onboarding",
    freshness: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    slug: "portfolio-db",
    name: "portfolio-db",
    type: "postgres",
    verdict: "ready",
    ownerId: "marcus",
    ownerConfirmed: true,
    records: 9412,
    recordNoun: "positions",
    cadence: "Nightly",
    lastEdit: new Date("2026-10-29T02:40:00-04:00"),
    lastEditBy: "etl-nightly",
    feeds: ["Unified Client Record", "Client portal"],
    reason: "Governed. Already the system of record for positions; writes go through merge requests.",
    lane: "ready",
    governed: true,
    location: "postgres://prod-db-01/portfolio",
    freshness: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    slug: "client-contacts-2023",
    name: "Client Contacts 2023",
    type: "sheets",
    verdict: "stale",
    ownerId: "elena",
    ownerConfirmed: true,
    records: 388,
    recordNoun: "rows",
    cadence: "Ad hoc",
    lastEdit: new Date("2026-03-14T10:22:00-04:00"),
    lastEditBy: "elena",
    feeds: ["Holiday mailing list"],
    reason: "No edits in 7 months. 61 rows have addresses that differ from Salesforce.",
    lane: "attention",
    location: "Google Drive › Shared › Contacts",
    freshness: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    slug: "prospect-pipeline",
    name: "Prospect pipeline",
    type: "sheets",
    verdict: "stale",
    ownerId: "sam",
    ownerConfirmed: true,
    records: 142,
    recordNoun: "rows",
    cadence: "Weekly (lapsed)",
    lastEdit: new Date("2026-02-06T16:51:00-05:00"),
    lastEditBy: "sam",
    feeds: [],
    reason: "Last edit in February. Owner says the pipeline moved into Salesforce opportunities.",
    lane: "attention",
    location: "Google Drive › Sam Ortiz › Pipeline",
    freshness: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    slug: "compliance-log",
    name: "Compliance log",
    type: "airtable",
    verdict: "unverified",
    ownerId: "tom",
    ownerConfirmed: false,
    records: 1203,
    recordNoun: "entries",
    cadence: "Unknown",
    lastEdit: new Date("2026-10-22T13:05:00-04:00"),
    lastEditBy: "unknown",
    feeds: ["Annual ADV review"],
    reason: "Owner has not confirmed. Last writer is a shared login. Enakt has not read any rows.",
    lane: "attention",
    location: "Airtable › Compliance › Log",
    freshness: [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  },
  {
    slug: "advisor-compensation",
    name: "Advisor compensation",
    type: "excel",
    verdict: "restricted",
    ownerId: "elena",
    ownerConfirmed: true,
    records: 14,
    recordNoun: "rows",
    cadence: "Quarterly",
    lastEdit: new Date("2026-10-03T08:15:00-04:00"),
    lastEditBy: "elena",
    feeds: ["Partner distributions"],
    reason: "Partner-only. Mapped by metadata; Enakt does not have, and has not asked for, read access.",
    lane: "ready",
    location: "OneDrive › Elena Whitfield › Partners",
    freshness: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  },
]

export const SOURCE_BY_SLUG: Record<string, Source> = Object.fromEntries(SOURCES.map((s) => [s.slug, s]))

export const SOURCE_COUNTS = {
  total: SOURCES.length, // 10
  owners: new Set(SOURCES.map((s) => s.ownerId)).size, // 6
  ready: SOURCES.filter((s) => s.verdict === "ready").length, // 4
  conflicts: SOURCES.filter((s) => s.verdict === "conflict").length, // 2
  stale: SOURCES.filter((s) => s.verdict === "stale").length, // 2
  unverified: SOURCES.filter((s) => s.verdict === "unverified").length, // 1
  awaitingReview: 41,
}

// ---------------------------------------------------------------------------
// Intake session
// ---------------------------------------------------------------------------

export type IntakeTurn = {
  id: string
  question: string
  answeredBy: "claude" | "dana"
  answer: string
  /** Source slugs revealed on the mini-map when this answer completes. */
  reveals: string[]
}

export const INTAKE_CONNECTION = "Connected: Dana Ruiz's Claude via MCP · metadata only"

export const INTAKE_TURNS: IntakeTurn[] = [
  {
    id: "q1",
    question: "Where do client and household records live today?",
    answeredBy: "claude",
    answer:
      "Household records live in Salesforce CRM (412 households, owner Dana Ruiz) and an Airtable onboarding tracker (238 records, also Dana). A Google Sheet named \"Client Contacts 2023\" still exists in the shared drive. It was last edited March 14 by Elena Whitfield.",
    reveals: ["salesforce-crm", "onboarding-tracker", "client-contacts-2023"],
  },
  {
    id: "q2",
    question: "Where do assets-under-management figures come from?",
    answeredBy: "claude",
    answer:
      "The Schwab custodian feed lands nightly with 640 accounts; Marcus Lee owns the SFTP job. Priya Nair maintains AUM_Rollup.xlsx on SharePoint, a monthly rollup of 1,118 rows, last saved September 30. Quarterly reports read from the rollup, not the feed.",
    reveals: ["schwab-custodian-feed", "aum-rollup"],
  },
  {
    id: "q3",
    question: "What holds positions and performance?",
    answeredBy: "claude",
    answer:
      "A Postgres database called portfolio-db holds 9,412 positions and refreshes nightly from the custodian feed. Marcus Lee owns it. It already feeds the client portal, so it is the closest thing the firm has to a system of record.",
    reveals: ["portfolio-db"],
  },
  {
    id: "q4",
    question: "How are billing and advisor compensation tracked?",
    answeredBy: "dana",
    answer:
      "Billing is QuickBooks. Sam Ortiz closes it monthly against the advisory agreements. Advisor compensation is a partner-only Excel file that Elena Whitfield owns. It does not leave her drive, and it should stay that way.",
    reveals: ["quickbooks-billing", "advisor-compensation"],
  },
  {
    id: "q5",
    question: "Anything else that tracks clients, prospects, or compliance?",
    answeredBy: "dana",
    answer:
      "There is a prospect pipeline sheet Sam started last year that is mostly abandoned now. And a compliance log in Airtable that Tom Becker's team uses. I honestly do not know who last edited that one.",
    reveals: ["prospect-pipeline", "compliance-log"],
  },
]

export const INTAKE_END_STATE = "10 sources mapped. 0 rows read."

// ---------------------------------------------------------------------------
// Patel conflict (Salesforce CRM detail page)
// ---------------------------------------------------------------------------

export const PATEL_CONFLICT = {
  household: "Patel household",
  householdId: "CL-00318",
  field: "Total AUM",
  a: {
    value: 2410000,
    display: "$2,410,000",
    source: "Salesforce CRM",
    sourceSlug: "salesforce-crm",
    where: "Household › Financials › Total AUM",
    date: "Oct 29, 2026",
    by: "dana",
  },
  b: {
    value: 2385500,
    display: "$2,385,500",
    source: "AUM_Rollup.xlsx",
    sourceSlug: "aum-rollup",
    where: "Sheet \"Q3\" · row 214",
    date: "Sep 30, 2026",
    by: "priya",
  },
  delta: "$24,500",
  verdict: "Not ready to merge. Both values kept with their sources. Enakt will not choose one.",
  affectedCount: 40,
}

/** 40 households where Salesforce and AUM_Rollup disagree. Deterministic filler. */
const HOUSEHOLD_NAMES = [
  "Patel", "Okafor Family Trust", "Lindqvist", "Marchetti", "Haddad", "Brennan", "Yamamoto", "Delgado",
  "Castellanos", "Oyelaran", "Fitzgerald", "Nakamura", "Abernathy", "Rosenberg", "Kowalczyk", "Mbeki",
  "Sørensen", "Villanueva", "Thackeray", "Ramaswamy", "Duchamp", "Greenbaum", "Iyer", "Macallister",
  "Novak", "Pemberton", "Quintero", "Rahimi", "Stavros", "Tanaka", "Underwood", "Vasquez",
  "Whitcombe", "Xu", "Yilmaz", "Zielinski", "Ahlberg", "Bouchard", "Caruso", "D'Amico",
]
export type AffectedHousehold = { id: string; name: string; salesforce: number; rollup: number; row: number }
export const AFFECTED_HOUSEHOLDS: AffectedHousehold[] = HOUSEHOLD_NAMES.map((name, i) => {
  if (i === 0) return { id: "CL-00318", name, salesforce: 2410000, rollup: 2385500, row: 214 }
  const seed = (i * 7919) % 1000
  const base = 600000 + ((i * 131071) % 3200000)
  const diff = 1500 + (seed * 37) % 48000
  const sign = i % 3 === 0 ? -1 : 1
  const round = (n: number) => Math.round(n / 100) * 100
  return {
    id: `CL-${String(318 + i * 11).padStart(5, "0")}`,
    name,
    salesforce: round(base),
    rollup: round(base - sign * diff),
    row: 214 + i * 9,
  }
})

// ---------------------------------------------------------------------------
// Merge request MR-12
// ---------------------------------------------------------------------------

export const MR = {
  number: 12,
  title: "Merge 3 ready sources into Unified Client Record",
  openedBy: "merge-agent-01",
  openedAt: new Date("2026-10-29T11:02:00-04:00"),
  reviewer: "dana",
  branch: "merge/schwab-quickbooks-onboarding",
  target: "unified-client-record",
  sources: ["schwab-custodian-feed", "quickbooks-billing", "onboarding-tracker"],
  stats: { in: 1284, merged: 1197, duplicates: 46, held: 41 },
  summary:
    "I read 1,284 records from three sources whose owners confirmed they are current. 1,197 matched a household in the Unified Client Record on custodian account number or tax ID and merged cleanly. 46 were duplicates of the same person across sources and collapsed into one record each, with every source kept as provenance. 41 records carry a value that disagrees with another source by more than the firm's tolerance. I held them for Dana Ruiz instead of guessing.",
  checks: [
    { id: "owners", label: "Source owners confirmed current", status: "pass" as const, detail: "3 of 3 owners confirmed within the last 24h" },
    { id: "schema", label: "Schema matches last accepted merge", status: "pass" as const, detail: "0 renamed or dropped columns since MR-9" },
    { id: "provenance", label: "Every merged field carries its source", status: "pass" as const, detail: "1,197 of 1,197 records have a provenance link" },
    { id: "held", label: "Records held for review, not guessed", status: "warn" as const, detail: "41 records held for review, not guessed" },
  ],
}

export const MR_LIST = [
  { number: 12, title: MR.title, status: "open" as const, author: "merge-agent-01", reviewer: "dana", opened: MR.openedAt, changes: "+1,197 · 41 held" },
  { number: 11, title: "Backfill household IDs on 238 onboarding records", status: "merged" as const, author: "merge-agent-01", reviewer: "dana", opened: new Date("2026-10-27T15:20:00-04:00"), changes: "+238" },
  { number: 10, title: "Retire Client Contacts 2022 after address reconciliation", status: "merged" as const, author: "merge-agent-01", reviewer: "marcus", opened: new Date("2026-10-21T10:05:00-04:00"), changes: "−371 · 12 held" },
  { number: 9, title: "Adopt portfolio-db as system of record for positions", status: "merged" as const, author: "marcus", reviewer: "elena", opened: new Date("2026-10-14T09:12:00-04:00"), changes: "+9,412" },
  { number: 8, title: "Fee schedule alignment: QuickBooks ↔ advisory agreements", status: "closed" as const, author: "merge-agent-01", reviewer: "sam", opened: new Date("2026-10-09T13:44:00-04:00"), changes: "0 · 1 held" },
]

export const PATEL_COLLAPSE = {
  household: "Patel household",
  id: "CL-00318",
  records: [
    { source: "Schwab custodian feed", type: "schwab" as const, label: "Account ••••4471 · Rohan Patel", fields: { name: "Rohan Patel", custodianAcct: "••••4471", aum: "$1,612,300" } },
    { source: "Schwab custodian feed", type: "schwab" as const, label: "Account ••••4472 · Anjali Patel", fields: { name: "Anjali Patel", custodianAcct: "••••4472", aum: "$797,700" } },
    { source: "QuickBooks billing", type: "quickbooks" as const, label: "Client 0318 · Patel, Rohan & Anjali", fields: { name: "Patel, Rohan & Anjali", feeSchedule: "0.85% tiered", billed: "Quarterly" } },
    { source: "Onboarding tracker", type: "airtable" as const, label: "rec8Kz · Patel household", fields: { name: "Patel household", advisor: "Marcus Lee", onboarded: "2019-04-02" } },
  ],
  result: {
    id: "CL-00318",
    name: "Patel household",
    members: "Rohan Patel, Anjali Patel",
    accounts: "••••4471, ••••4472",
    aumCustodian: "$2,410,000",
    feeSchedule: "0.85% tiered · quarterly",
    advisor: "Marcus Lee",
    onboarded: "2019-04-02",
    provenance: "4 sources",
  },
}

export const OKAFOR_HOLD = {
  household: "Okafor Family Trust",
  id: "CL-00329",
  field: "Billable AUM",
  a: { value: "$1,940,200", source: "Schwab custodian feed", type: "schwab" as const, date: "Oct 29, 2026" },
  b: { value: "$1,716,000", source: "QuickBooks billing", type: "quickbooks" as const, date: "Oct 27, 2026" },
  delta: "$224,200",
  routedTo: "dana",
  note: "Difference exceeds the 2% tolerance. Likely an excluded account on the billing side. Held for Dana Ruiz.",
}

/** The other 39 held records, as a compact list. */
export const OTHER_HELD = AFFECTED_HOUSEHOLDS.slice(2, 41).map((h, i) => ({
  id: h.id,
  name: h.name,
  field: i % 4 === 0 ? "Billable AUM" : i % 4 === 1 ? "Primary advisor" : i % 4 === 2 ? "Mailing address" : "Fee schedule",
  sources: i % 2 === 0 ? "Schwab ↔ QuickBooks" : "Onboarding ↔ QuickBooks",
}))

export const MR_TIMELINE = [
  { id: "t1", at: new Date("2026-10-29T11:02:00-04:00"), actor: "merge-agent-01", text: "opened this merge request" },
  { id: "t2", at: new Date("2026-10-29T11:02:30-04:00"), actor: "merge-agent-01", text: "requested review from Dana Ruiz" },
  { id: "t3", at: new Date("2026-10-29T11:04:00-04:00"), actor: "merge-agent-01", text: "ran 4 checks · 3 passed, 1 warning" },
  { id: "t4", at: new Date("2026-10-29T13:27:00-04:00"), actor: "marcus", text: "commented: Schwab file is the Oct 28 close. Good to go on my side." },
  { id: "t5", at: new Date("2026-10-29T14:51:00-04:00"), actor: "sam", text: "confirmed QuickBooks September close is final" },
]

// ---------------------------------------------------------------------------
// Access matrix
// ---------------------------------------------------------------------------

export type AccessLevel = "none" | "read" | "write" | "approve"
export const ACCESS_LABEL: Record<AccessLevel, string> = { none: "No access", read: "Read", write: "Write", approve: "Approve" }

export const ACCESS_RESOURCES = [
  { id: "ucr", name: "Unified client record" },
  { id: "aum", name: "AUM data" },
  { id: "comp", name: "Advisor compensation" },
  { id: "compliance", name: "Compliance log" },
] as const
export type ResourceId = (typeof ACCESS_RESOURCES)[number]["id"]

export const ACCESS_ROWS: string[] = ["dana", "marcus", "priya", "merge-agent-01", "report-agent", "sam"]

export const INITIAL_ACCESS: Record<string, Record<ResourceId, AccessLevel>> = {
  dana: { ucr: "approve", aum: "write", comp: "none", compliance: "read" },
  marcus: { ucr: "write", aum: "approve", comp: "none", compliance: "none" },
  priya: { ucr: "read", aum: "write", comp: "none", compliance: "none" },
  "merge-agent-01": { ucr: "write", aum: "read", comp: "none", compliance: "none" },
  "report-agent": { ucr: "read", aum: "read", comp: "none", compliance: "read" },
  sam: { ucr: "read", aum: "none", comp: "none", compliance: "none" },
}

export const ACCESS_NOTE = "Every agent write goes through a merge request."

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export type ActivityEntry = {
  id: string
  at: Date
  actorId: string
  text: string
  href?: string
  kind: "merge" | "intake" | "access" | "source" | "comment" | "system"
}

export const ACTIVITY: ActivityEntry[] = [
  { id: "a1", at: new Date("2026-10-29T14:51:00-04:00"), actorId: "sam", text: "confirmed QuickBooks billing is current for September close", href: "/northfield/sources/quickbooks-billing", kind: "source" },
  { id: "a2", at: new Date("2026-10-29T14:12:00-04:00"), actorId: "dana", text: "updated Total AUM on Patel household in Salesforce CRM", href: "/northfield/sources/salesforce-crm", kind: "source" },
  { id: "a3", at: new Date("2026-10-29T13:27:00-04:00"), actorId: "marcus", text: "commented on MR-12", href: "/northfield/merge-requests/12", kind: "comment" },
  { id: "a4", at: new Date("2026-10-29T11:04:00-04:00"), actorId: "merge-agent-01", text: "ran checks on MR-12 · 3 passed, 1 warning", href: "/northfield/merge-requests/12", kind: "merge" },
  { id: "a5", at: new Date("2026-10-29T11:02:00-04:00"), actorId: "merge-agent-01", text: "opened MR-12 · Merge 3 ready sources into Unified Client Record", href: "/northfield/merge-requests/12", kind: "merge" },
  { id: "a6", at: new Date("2026-10-29T10:40:00-04:00"), actorId: "intake-agent", text: "flagged Salesforce CRM ↔ AUM_Rollup.xlsx conflict on 40 households", href: "/northfield/sources/salesforce-crm", kind: "source" },
  { id: "a7", at: new Date("2026-10-29T09:48:00-04:00"), actorId: "dana", text: "confirmed Onboarding tracker as current", href: "/northfield/sources/onboarding-tracker", kind: "source" },
  { id: "a8", at: new Date("2026-10-29T02:40:00-04:00"), actorId: "report-agent", text: "generated nightly reconciliation report · 0 writes", kind: "system" },
  { id: "a9", at: new Date("2026-10-28T17:15:00-04:00"), actorId: "tom", text: "was asked to confirm ownership of Compliance log", href: "/northfield/sources/compliance-log", kind: "source" },
  { id: "a10", at: new Date("2026-10-28T16:02:00-04:00"), actorId: "elena", text: "marked Advisor compensation as partner-only", href: "/northfield/sources/advisor-compensation", kind: "access" },
  { id: "a11", at: new Date("2026-10-28T11:30:00-04:00"), actorId: "dana", text: "granted report-agent read on Compliance log", href: "/northfield/access", kind: "access" },
  { id: "a12", at: new Date("2026-10-27T15:40:00-04:00"), actorId: "dana", text: "approved and merged MR-11 · Backfill household IDs", href: "/northfield/merge-requests", kind: "merge" },
  { id: "a13", at: new Date("2026-10-27T15:20:00-04:00"), actorId: "merge-agent-01", text: "opened MR-11 · Backfill household IDs on 238 onboarding records", href: "/northfield/merge-requests", kind: "merge" },
  { id: "a14", at: new Date("2026-10-24T09:05:00-04:00"), actorId: "intake-agent", text: "marked Prospect pipeline stale · no edits since Feb 6", href: "/northfield/sources/prospect-pipeline", kind: "source" },
  { id: "a15", at: new Date("2026-10-23T14:18:00-04:00"), actorId: "marcus", text: "approved and merged MR-10 · Retire Client Contacts 2022", href: "/northfield/merge-requests", kind: "merge" },
  { id: "a16", at: new Date("2026-10-21T10:05:00-04:00"), actorId: "merge-agent-01", text: "opened MR-10 · Retire Client Contacts 2022", href: "/northfield/merge-requests", kind: "merge" },
  { id: "a17", at: new Date("2026-10-17T16:33:00-04:00"), actorId: "dana", text: "connected Claude via MCP · metadata only", href: "/northfield/settings", kind: "system" },
  { id: "a18", at: new Date("2026-10-14T09:12:00-04:00"), actorId: "elena", text: "approved MR-9 · portfolio-db adopted as system of record", href: "/northfield/merge-requests", kind: "merge" },
]

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const MODELS = [
  { id: "claude", name: "Claude", provider: "Anthropic", model: "claude-fable-5-1", status: "connected" as const, usedBy: ["merge-agent-01", "intake-agent"], note: "Connected through Dana Ruiz's MCP session. Metadata only; no row reads." },
  { id: "gpt", name: "GPT", provider: "OpenAI", model: "gpt-5", status: "available" as const, usedBy: [], note: "Available. Not attached to any agent." },
  { id: "local", name: "Local model", provider: "Self-hosted", model: "llama-3.3-70b · http://10.0.4.12:8080", status: "connected" as const, usedBy: ["report-agent"], note: "Runs inside the firm's network. Used for reports that touch compliance data." },
]

export const CONNECTIONS = [
  { id: "salesforce", name: "Salesforce", type: "salesforce" as const, status: "connected" as const, scope: "Metadata + field names", since: "Oct 17" },
  { id: "schwab", name: "Schwab Advisor Center", type: "schwab" as const, status: "connected" as const, scope: "SFTP file listing", since: "Oct 17" },
  { id: "airtable", name: "Airtable", type: "airtable" as const, status: "connected" as const, scope: "Base and table schema", since: "Oct 18" },
  { id: "google", name: "Google Workspace", type: "sheets" as const, status: "connected" as const, scope: "Drive file metadata", since: "Oct 18" },
  { id: "m365", name: "Microsoft 365", type: "excel" as const, status: "connected" as const, scope: "SharePoint + OneDrive metadata", since: "Oct 20" },
  { id: "quickbooks", name: "QuickBooks Online", type: "quickbooks" as const, status: "connected" as const, scope: "Customer list schema", since: "Oct 21" },
  { id: "postgres", name: "Postgres (prod-db-01)", type: "postgres" as const, status: "connected" as const, scope: "Schema + row counts", since: "Oct 14" },
]

export const MEMBERS = [
  { id: "dana", role: "Admin", joined: "Oct 14" },
  { id: "elena", role: "Owner", joined: "Oct 14" },
  { id: "marcus", role: "Member", joined: "Oct 14" },
  { id: "priya", role: "Member", joined: "Oct 15" },
  { id: "sam", role: "Member", joined: "Oct 15" },
  { id: "tom", role: "Member", joined: "Oct 20" },
]

export const NOTIFICATIONS = [
  { id: "n1", at: new Date("2026-10-29T14:51:00-04:00"), text: "Sam Ortiz confirmed QuickBooks billing is current", href: "/northfield/merge-requests/12" },
  { id: "n2", at: new Date("2026-10-29T13:27:00-04:00"), text: "Marcus Lee commented on MR-12", href: "/northfield/merge-requests/12" },
  { id: "n3", at: new Date("2026-10-29T11:02:30-04:00"), text: "merge-agent-01 requested your review on MR-12", href: "/northfield/merge-requests/12" },
]
