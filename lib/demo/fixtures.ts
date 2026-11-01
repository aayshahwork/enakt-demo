/**
 * Enakt "Firm Brain" demo fixtures — Ashcombe Trust Company.
 * Every name, number, and date on screen comes from here. Nothing is fetched.
 * "Now" is pinned so relative timestamps are identical on every take.
 */

export const NOW = new Date("2026-10-31T10:15:00-04:00")

export const FIRM = "ashcombe"
export const BASE = `/${FIRM}`
export const href = (path = "") => `${BASE}${path}`

export const WORKSPACE = {
  slug: FIRM,
  name: "Ashcombe Trust Company",
  short: "Ashcombe",
  others: [
    { name: "Harbor Point Advisors", slug: "harbor-point" },
    { name: "Lakeside Family Office", slug: "lakeside" },
  ],
}

export const BRAIN = { before: 38, after: 51, mergedBefore: 2, mergedAfter: 4, total: 12 }

export const MODEL = { name: "Llama 3.3 70B", host: "gpu-02", rack: "rack B2", embed: "bge-m3 (local)" }

export const DEPLOYMENT = {
  installedOn: "Oct 21, 2026",
  installedAt: new Date("2026-10-21T09:00:00-04:00"),
  sourceReviewed: "Oct 18, 2026",
  reviewer: "Ashcombe security",
  version: "enakt 1.8.2",
  sso: "SAML · Ashcombe identity provider",
}

// ---------------------------------------------------------------------------
// People and agents
// ---------------------------------------------------------------------------

export type ActorKind = "person" | "agent" | "group"
export type Actor = {
  id: string
  name: string
  role: string
  kind: ActorKind
  initials: string
  email?: string
  /** Agents: who they act for. */
  actsFor?: string
  /** Agents: a one-line purpose. */
  purpose?: string
}

export const PEOPLE: Record<string, Actor> = {
  dana: { id: "dana", name: "Dana Ruiz", role: "Head of Operations", kind: "person", initials: "DR", email: "dana.ruiz@ashcombetrust.com" },
  marcus: { id: "marcus", name: "Marcus Lee", role: "Senior Advisor", kind: "person", initials: "ML", email: "marcus.lee@ashcombetrust.com" },
  priya: { id: "priya", name: "Priya Nair", role: "Finance Controller", kind: "person", initials: "PN", email: "priya.nair@ashcombetrust.com" },
  sam: { id: "sam", name: "Sam Ortiz", role: "Chief Compliance Officer", kind: "person", initials: "SO", email: "sam.ortiz@ashcombetrust.com" },
  chris: { id: "chris", name: "Chris Hale", role: "COO", kind: "person", initials: "CH", email: "chris.hale@ashcombetrust.com" },
  planning: { id: "planning", name: "Planning team", role: "4 planners", kind: "group", initials: "PT" },
}

export const AGENTS: Record<string, Actor> = {
  "marcus-assistant": { id: "marcus-assistant", name: "marcus-assistant", role: "Advisor assistant", kind: "agent", initials: "MA", actsFor: "marcus", purpose: "Prepares client reviews for Marcus Lee from his own book." },
  "ops-assistant": { id: "ops-assistant", name: "ops-assistant", role: "Operations assistant", kind: "agent", initials: "OA", actsFor: "dana", purpose: "Answers operations questions and drafts onboarding checklists." },
  "merge-agent": { id: "merge-agent", name: "merge-agent", role: "Merge agent", kind: "agent", initials: "MG", purpose: "Proposes merges of ready sources into the firm brain. Never approves." },
  "compliance-reviewer": { id: "compliance-reviewer", name: "compliance-reviewer", role: "Compliance reviewer", kind: "agent", initials: "CR", actsFor: "sam", purpose: "Flags compliance log entries that need a human look." },
  "intake-agent": { id: "intake-agent", name: "intake-agent", role: "Intake agent", kind: "agent", initials: "IA", purpose: "Runs interviews and maps sources from metadata only." },
}

export const ACTORS: Record<string, Actor> = Object.fromEntries([...Object.values(PEOPLE), ...Object.values(AGENTS)].map((a) => [a.id, a]))

export const CURRENT_USER = PEOPLE.dana

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export type SourceType = "salesforce" | "sharepoint" | "fileshare" | "excel" | "custodian" | "sqlserver" | "oracle" | "postgres" | "access"
export type Verdict = "unchecked" | "inbrain" | "ready" | "cleaning" | "conflict" | "stale" | "unverified" | "restricted"

export const VERDICT_LABEL: Record<Verdict, string> = {
  unchecked: "Not checked yet",
  inbrain: "In brain",
  ready: "Ready",
  cleaning: "Cleaning",
  conflict: "Conflict",
  stale: "Stale",
  unverified: "Unverified",
  restricted: "Restricted",
}

/** Urgency order for the Build table. */
export const VERDICT_URGENCY: Record<Verdict, number> = {
  conflict: 0,
  stale: 1,
  unverified: 2,
  cleaning: 3,
  ready: 4,
  restricted: 5,
  inbrain: 6,
  unchecked: 7,
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  salesforce: "Salesforce",
  sharepoint: "SharePoint list",
  fileshare: "File share",
  excel: "Excel",
  custodian: "Custodian SFTP",
  sqlserver: "SQL Server",
  oracle: "Oracle",
  postgres: "Postgres",
  access: "Access database",
}

export type SourceId =
  | "salesforce-crm"
  | "onboarding"
  | "client-docs"
  | "client-tracker"
  | "prospects"
  | "custodian-feed"
  | "aum-rollup"
  | "billing"
  | "kyc"
  | "compliance-log"
  | "advisor-comp"
  | "planning-cases"

export type Task = { text: string; assignee: string; due: string }

export type Source = {
  id: SourceId
  name: string
  type: SourceType
  /** Final verdict after the readiness pass. */
  verdict: Verdict
  ownerId: string | null
  records: number
  recordNoun: string
  cadence: string
  lastEdit: Date
  location: string
  feeds: string[]
  reason: string
  /** Next step shown on Build. Null when nothing is needed. */
  task: Task | null
  /** Canvas position. */
  pos: { x: number; y: number }
  /** Which resource column on the permissions matrix this source belongs to. */
  resource: ResourceId | null
}

export const SOURCES: Source[] = [
  {
    id: "salesforce-crm",
    name: "Salesforce CRM",
    type: "salesforce",
    verdict: "conflict",
    ownerId: "dana",
    records: 1284,
    recordNoun: "households",
    cadence: "Continuous",
    lastEdit: new Date("2026-10-29T14:12:00-04:00"),
    location: "ashcombe.my.salesforce.com · Household__c",
    feeds: ["Client_Tracker_FINAL_v3", "Client review prep"],
    reason: "Patel household AUM disagrees with AUM_Rollup row 214. Held out of the brain until an owner picks a value.",
    task: { text: "Resolve Patel household AUM with Priya Nair", assignee: "dana", due: "Nov 3" },
    pos: { x: 270, y: 30 },
    resource: "client-records",
  },
  {
    id: "onboarding",
    name: "Onboarding (SharePoint)",
    type: "sharepoint",
    verdict: "ready",
    ownerId: "dana",
    records: 37,
    recordNoun: "open items",
    cadence: "Daily",
    lastEdit: new Date("2026-10-30T17:40:00-04:00"),
    location: "sharepoint/sites/ops/Lists/Onboarding",
    feeds: ["Salesforce CRM"],
    reason: "Owner confirmed. Every item maps to a Salesforce household ID. Included in MR-14.",
    task: { text: "Approve MR-14", assignee: "dana", due: "Oct 31" },
    pos: { x: 20, y: 30 },
    resource: "client-records",
  },
  {
    id: "client-docs",
    name: "Client documents (file share)",
    type: "fileshare",
    verdict: "cleaning",
    ownerId: "dana",
    records: 18406,
    recordNoun: "files",
    cadence: "Continuous",
    lastEdit: new Date("2026-10-30T11:05:00-04:00"),
    location: "\\\\ash-fs01\\Clients",
    feeds: ["Client review prep"],
    reason: "2,113 files have no household ID in their path. Operations is tagging them; merge follows.",
    task: { text: "Tag 2,113 files with household IDs", assignee: "dana", due: "Nov 12" },
    pos: { x: 20, y: 130 },
    resource: "client-documents",
  },
  {
    id: "client-tracker",
    name: "Client_Tracker_FINAL_v3",
    type: "excel",
    verdict: "stale",
    ownerId: "marcus",
    records: 212,
    recordNoun: "rows",
    cadence: "When Marcus remembers",
    lastEdit: new Date("2026-08-14T18:22:00-04:00"),
    location: "OneDrive/Marcus Lee/Client_Tracker_FINAL_v3.xlsx",
    feeds: ["Client review prep"],
    reason: "Last edited Aug 14. 41 rows disagree with Salesforce on contact or AUM.",
    task: { text: "Confirm the 41 rows that differ from Salesforce", assignee: "marcus", due: "Nov 5" },
    pos: { x: 270, y: 130 },
    resource: "client-records",
  },
  {
    id: "prospects",
    name: "Prospects_2025.xlsx",
    type: "excel",
    verdict: "stale",
    ownerId: "marcus",
    records: 96,
    recordNoun: "rows",
    cadence: "Rarely",
    lastEdit: new Date("2026-03-03T09:48:00-05:00"),
    location: "OneDrive/Marcus Lee/Prospects_2025.xlsx",
    feeds: [],
    reason: "No edits since Mar 3. Marcus to mark which prospects are still live before anything merges.",
    task: { text: "Mark which prospects are still live", assignee: "marcus", due: "Nov 7" },
    pos: { x: 20, y: 230 },
    resource: "client-records",
  },
  {
    id: "custodian-feed",
    name: "Custodian feed",
    type: "custodian",
    verdict: "inbrain",
    ownerId: "priya",
    records: 4117,
    recordNoun: "positions nightly",
    cadence: "Nightly 02:00",
    lastEdit: new Date("2026-10-31T02:04:00-04:00"),
    location: "sftp://custodian/ashcombe/positions_YYYYMMDD.csv",
    feeds: ["AUM_Rollup.xlsx"],
    reason: "Schema stable since 2024. Merged into the brain Oct 24.",
    task: null,
    pos: { x: 20, y: 380 },
    resource: null,
  },
  {
    id: "aum-rollup",
    name: "AUM_Rollup.xlsx",
    type: "excel",
    verdict: "conflict",
    ownerId: "priya",
    records: 1284,
    recordNoun: "rows",
    cadence: "Monthly",
    lastEdit: new Date("2026-09-30T19:10:00-04:00"),
    location: "SharedDrive/Finance/AUM_Rollup.xlsx",
    feeds: ["Billing (SQL Server)"],
    reason: "Row 214 (Patel) differs from Salesforce by $24,500. Both values kept with their sources.",
    task: { text: "Confirm row 214 against the custodian statement", assignee: "priya", due: "Nov 3" },
    pos: { x: 270, y: 380 },
    resource: null,
  },
  {
    id: "billing",
    name: "Billing (SQL Server)",
    type: "sqlserver",
    verdict: "ready",
    ownerId: "priya",
    records: 3902,
    recordNoun: "invoices",
    cadence: "Quarterly run",
    lastEdit: new Date("2026-10-01T07:30:00-04:00"),
    location: "ash-sql02 · billing.dbo.Invoices",
    feeds: [],
    reason: "Owner confirmed, schema documented. Reads AUM_Rollup at quarter end. Included in MR-14.",
    task: { text: "Approve MR-14", assignee: "dana", due: "Oct 31" },
    pos: { x: 520, y: 420 },
    resource: null,
  },
  {
    id: "kyc",
    name: "KYC records",
    type: "oracle",
    verdict: "cleaning",
    ownerId: "sam",
    records: 1311,
    recordNoun: "records",
    cadence: "On client event",
    lastEdit: new Date("2026-10-30T16:20:00-04:00"),
    location: "ash-ora01 · KYC.CLIENT_VERIFICATION",
    feeds: ["Compliance log"],
    reason: "Restricted to compliance. 58 records are missing a refresh date; Sam's team is filling them.",
    task: { text: "Add refresh dates to 58 records", assignee: "sam", due: "Nov 10" },
    pos: { x: 770, y: 30 },
    resource: "kyc-records",
  },
  {
    id: "compliance-log",
    name: "Compliance log",
    type: "postgres",
    verdict: "inbrain",
    ownerId: "sam",
    records: 22870,
    recordNoun: "entries",
    cadence: "Append-only",
    lastEdit: new Date("2026-10-31T09:58:00-04:00"),
    location: "ash-pg01 · compliance.events",
    feeds: [],
    reason: "Append-only, owner confirmed. Merged into the brain Oct 23.",
    task: null,
    pos: { x: 770, y: 130 },
    resource: "compliance-log",
  },
  {
    id: "advisor-comp",
    name: "Advisor_Comp.xlsx",
    type: "excel",
    verdict: "restricted",
    ownerId: "chris",
    records: 14,
    recordNoun: "rows",
    cadence: "Quarterly",
    lastEdit: new Date("2026-10-06T12:00:00-04:00"),
    location: "SharedDrive/Leadership/Advisor_Comp.xlsx",
    feeds: [],
    reason: "Leadership only by policy. No agent may read it. Never scanned, never merged.",
    task: null,
    pos: { x: 770, y: 270 },
    resource: "advisor-compensation",
  },
  {
    id: "planning-cases",
    name: "Planning cases (Access database)",
    type: "access",
    verdict: "unverified",
    ownerId: null,
    records: 340,
    recordNoun: "cases",
    cadence: "Unknown",
    lastEdit: new Date("2026-10-27T15:44:00-04:00"),
    location: "\\\\ash-fs01\\Planning\\Cases.accdb",
    feeds: [],
    reason: "No owner responded after 2 reminders. Open question for Chris Hale.",
    task: { text: "Name an owner for the planning database", assignee: "chris", due: "Nov 4" },
    pos: { x: 770, y: 420 },
    resource: null,
  },
]

export const SOURCE_BY_ID: Record<SourceId, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<SourceId, Source>

export const BRAIN_POS = { x: 520, y: 200 }

export type GraphEdge = { id: string; source: string; target: string; kind: "dep" | "brain" }

/** Dependency edges between sources. Brain edges are added as sources merge. */
export const DEP_EDGES: GraphEdge[] = [
  { id: "onboarding>salesforce-crm", source: "onboarding", target: "salesforce-crm", kind: "dep" },
  { id: "salesforce-crm>client-tracker", source: "salesforce-crm", target: "client-tracker", kind: "dep" },
  { id: "custodian-feed>aum-rollup", source: "custodian-feed", target: "aum-rollup", kind: "dep" },
  { id: "aum-rollup>billing", source: "aum-rollup", target: "billing", kind: "dep" },
]

export const brainEdge = (id: SourceId): GraphEdge => ({ id: `${id}>brain`, source: id, target: "brain", kind: "brain" })

/** Sources already in the brain before any merge. */
export const IN_BRAIN_BEFORE: SourceId[] = ["custodian-feed", "compliance-log"]
/** Sources MR-14 brings in. */
export const MR14_SOURCES: SourceId[] = ["onboarding", "billing"]

// ---------------------------------------------------------------------------
// Workflows, policies, open questions
// ---------------------------------------------------------------------------

export type Workflow = { id: string; name: string; ownerId: string; sources: SourceId[] }
export const WORKFLOWS: Workflow[] = [
  { id: "onboarding", name: "Client onboarding", ownerId: "dana", sources: ["onboarding", "salesforce-crm", "client-docs"] },
  { id: "review-prep", name: "Client review prep", ownerId: "marcus", sources: ["salesforce-crm", "client-tracker", "client-docs"] },
  { id: "aum-rollup", name: "Monthly AUM rollup", ownerId: "priya", sources: ["custodian-feed", "aum-rollup"] },
  { id: "billing-run", name: "Billing run", ownerId: "priya", sources: ["aum-rollup", "billing"] },
]
export const WORKFLOW_BY_ID = Object.fromEntries(WORKFLOWS.map((w) => [w.id, w])) as Record<string, Workflow>

export type Policy = {
  id: string
  rule: string
  /** Who said it and when. */
  sourceId: string
  sourceLabel: string
  date: string
  fromIntake: boolean
  /** Transcript entry id this came from. */
  transcriptId?: string
  /** Nodes it governs on the canvas. */
  governs: string[]
}

export const POLICIES: Policy[] = [
  {
    id: "advisor-scope",
    rule: "Advisor assistants see only their advisor's households",
    sourceId: "marcus",
    sourceLabel: "Marcus Lee · interview",
    date: "Oct 31",
    fromIntake: true,
    transcriptId: "b3-a",
    governs: ["brain", "client-tracker"],
  },
  {
    id: "kyc-compliance",
    rule: "Only compliance reads KYC records, people or agents",
    sourceId: "sam",
    sourceLabel: "Sam Ortiz · interview",
    date: "Oct 31",
    fromIntake: true,
    transcriptId: "b5-a",
    governs: ["kyc"],
  },
  {
    id: "comp-leadership",
    rule: "Advisor compensation is leadership only, no agents",
    sourceId: "chris",
    sourceLabel: "Chris Hale · interview",
    date: "Oct 31",
    fromIntake: true,
    transcriptId: "b6-a",
    governs: ["advisor-comp"],
  },
  {
    id: "no-egress",
    rule: "No firm data leaves the Ashcombe network",
    sourceId: "deployment",
    sourceLabel: "Deployment policy · Ashcombe security",
    date: "Oct 21",
    fromIntake: false,
    governs: [],
  },
  {
    id: "agents-propose",
    rule: "Agents propose; a person approves every merge",
    sourceId: "dana",
    sourceLabel: "Dana Ruiz · kickoff",
    date: "Oct 22",
    fromIntake: false,
    governs: ["brain"],
  },
  {
    id: "traced-values",
    rule: "Every value in the brain traces to a source row",
    sourceId: "sam",
    sourceLabel: "Sam Ortiz · kickoff",
    date: "Oct 22",
    fromIntake: false,
    governs: ["brain"],
  },
]
export const POLICY_BY_ID = Object.fromEntries(POLICIES.map((p) => [p.id, p])) as Record<string, Policy>

export type OpenQuestion = { id: string; text: string; routedTo: string }
export const OPEN_QUESTIONS: Record<string, OpenQuestion> = {
  "marcus-tracker": { id: "marcus-tracker", text: "Marcus's tracker: where is it and what is in it?", routedTo: "marcus" },
  "planning-owner": { id: "planning-owner", text: "Planning cases database needs an owner", routedTo: "chris" },
}

// ---------------------------------------------------------------------------
// Permissions matrix
// ---------------------------------------------------------------------------

export type ResourceId = "client-records" | "client-documents" | "kyc-records" | "advisor-compensation" | "compliance-log"
export const RESOURCES: { id: ResourceId; label: string; sources: SourceId[] }[] = [
  { id: "client-records", label: "Client records", sources: ["salesforce-crm", "onboarding", "client-tracker", "prospects"] },
  { id: "client-documents", label: "Client documents", sources: ["client-docs"] },
  { id: "kyc-records", label: "KYC records", sources: ["kyc"] },
  { id: "advisor-compensation", label: "Advisor compensation", sources: ["advisor-comp"] },
  { id: "compliance-log", label: "Compliance log", sources: ["compliance-log"] },
]

export type AccessLevel = "none" | "read" | "own" | "propose" | "approve"
export const ACCESS_LABEL: Record<AccessLevel, string> = {
  none: "No access",
  read: "Read",
  own: "Own clients",
  propose: "Propose",
  approve: "Approve",
}
export const ACCESS_ORDER: AccessLevel[] = ["none", "read", "own", "propose", "approve"]

export const MATRIX_PEOPLE = ["dana", "marcus", "sam", "chris"]
export const MATRIX_AGENTS = ["marcus-assistant", "ops-assistant", "merge-agent", "compliance-reviewer"]

export type Matrix = Record<string, Record<ResourceId, AccessLevel>>

export const INITIAL_MATRIX: Matrix = {
  dana: { "client-records": "approve", "client-documents": "read", "kyc-records": "none", "advisor-compensation": "none", "compliance-log": "read" },
  marcus: { "client-records": "own", "client-documents": "own", "kyc-records": "none", "advisor-compensation": "none", "compliance-log": "none" },
  sam: { "client-records": "read", "client-documents": "read", "kyc-records": "approve", "advisor-compensation": "none", "compliance-log": "approve" },
  chris: { "client-records": "read", "client-documents": "read", "kyc-records": "none", "advisor-compensation": "approve", "compliance-log": "read" },
  "marcus-assistant": { "client-records": "own", "client-documents": "own", "kyc-records": "none", "advisor-compensation": "none", "compliance-log": "none" },
  "ops-assistant": { "client-records": "read", "client-documents": "read", "kyc-records": "none", "advisor-compensation": "none", "compliance-log": "read" },
  "merge-agent": { "client-records": "propose", "client-documents": "propose", "kyc-records": "none", "advisor-compensation": "none", "compliance-log": "none" },
  "compliance-reviewer": { "client-records": "read", "client-documents": "none", "kyc-records": "read", "advisor-compensation": "none", "compliance-log": "propose" },
}

// ---------------------------------------------------------------------------
// View-as scopes on the map
// ---------------------------------------------------------------------------

export type Viewer = "dana" | "marcus" | "marcus-assistant"
export const VIEWERS: { id: Viewer; label: string; sub: string }[] = [
  { id: "dana", label: "Dana Ruiz", sub: "Head of Operations · sees all 12" },
  { id: "marcus", label: "Marcus Lee", sub: "Senior Advisor · 6 sources" },
  { id: "marcus-assistant", label: "marcus-assistant", sub: "Agent · 3 sources, scoped to Marcus's book" },
]
export const VIEW_SCOPE: Record<Viewer, SourceId[] | "all"> = {
  dana: "all",
  marcus: ["salesforce-crm", "client-tracker", "prospects", "onboarding", "client-docs", "planning-cases"],
  "marcus-assistant": ["salesforce-crm", "client-tracker", "client-docs"],
}
export const VIEW_BANNER: Record<Viewer, string | null> = {
  dana: null,
  marcus: "Viewing as Marcus Lee · 6 of 12 sources. Marcus does not see the other 6 and does not know they exist here.",
  "marcus-assistant": "Viewing as marcus-assistant · 3 sources, scoped to Marcus Lee's households by policy. Everything else is invisible to it.",
}

// ---------------------------------------------------------------------------
// Patel conflict and MR-14
// ---------------------------------------------------------------------------

export const PATEL = {
  household: "Patel household",
  id: "HH-00318",
  conflictId: "C-0041",
  field: "AUM",
  a: { value: "$2,410,000", raw: 2410000, source: "Salesforce CRM", sourceId: "salesforce-crm" as SourceId, date: "Oct 29", by: "dana" },
  b: { value: "$2,385,500", raw: 2385500, source: "AUM_Rollup row 214", sourceId: "aum-rollup" as SourceId, date: "Sep 30", by: "priya" },
  delta: "$24,500",
  note: "Held out of the brain. Both values kept with their sources.",
}

export const MR = {
  number: 14,
  slug: "mr-14",
  title: "Bring Onboarding and Billing into the firm brain",
  openedBy: "merge-agent",
  openedAt: new Date("2026-10-30T18:12:00-04:00"),
  reviewer: "dana",
  branch: "merge/onboarding-billing",
  target: "firm-brain",
  stats: { merged: 2184, held: 37, sources: 2 },
  summary:
    "Onboarding (SharePoint) and Billing (SQL Server) both passed the readiness pass: owners confirmed, schemas documented, every row keyed to a household. This request merges 2,184 records into the firm brain. 37 records disagree with a value already in the brain and are held for Dana Ruiz, not guessed.",
  notRead: "I did not read Salesforce CRM or AUM_Rollup.xlsx for this request. The Patel household AUM is still held as conflict C-0041 until an owner picks a value.",
  checks: [
    { id: "traced", label: "Every merged value traced to a source row", detail: "2,184 of 2,184 values carry a source path and row reference.", status: "pass" as const, ms: "1.4s" },
    { id: "restricted", label: "No reads of restricted data", detail: "Advisor_Comp.xlsx and KYC records were not opened. Verified from the data-layer audit.", status: "pass" as const, ms: "0.3s" },
    { id: "held", label: "37 records held for a person, not guessed", detail: "Each held record names the two sources that disagree and is routed to Dana Ruiz.", status: "warn" as const, ms: "0.6s" },
  ],
  timeline: [
    { id: "t1", at: new Date("2026-10-30T18:12:00-04:00"), actor: "merge-agent", text: "opened this request from 2 ready sources" },
    { id: "t2", at: new Date("2026-10-30T18:13:00-04:00"), actor: "merge-agent", text: "ran 3 checks · 2 passed, 1 warning" },
    { id: "t3", at: new Date("2026-10-30T18:40:00-04:00"), actor: "sam", text: "commented: no restricted reads in the audit. Fine by compliance." },
    { id: "t4", at: new Date("2026-10-31T08:55:00-04:00"), actor: "dana", text: "requested the Okafor hold be shown in the diff" },
    { id: "t5", at: new Date("2026-10-31T09:02:00-04:00"), actor: "merge-agent", text: "updated Changes · Okafor Family Trust shown as held" },
  ],
}

export const PATEL_COLLAPSE = {
  id: "HH-00318",
  household: "Patel household",
  before: [
    { sourceId: "onboarding" as SourceId, label: "Onboarding · item ONB-2024-118", fields: { name: "Patel, Anita & Rohan", advisor: "Marcus Lee", opened: "2019-03-11", status: "Complete" } },
    { sourceId: "billing" as SourceId, label: "Billing · account BIL-77812", fields: { name: "A & R Patel", fee_schedule: "Tier 2 · 0.85%", last_invoice: "2026-10-01", aum_billed: "$2,385,500" } },
  ],
  after: { id: "HH-00318", name: "Patel household", advisor: "Marcus Lee", since: "2019-03-11", fee_schedule: "Tier 2 · 0.85%", aum: "held · C-0041 (Salesforce vs AUM_Rollup)" },
}

export const OKAFOR_HOLD = {
  id: "HH-00402",
  household: "Okafor Family Trust",
  field: "AUM",
  a: { source: "Billing (SQL Server)", sourceId: "billing" as SourceId, value: "$8,120,000", date: "Oct 1" },
  b: { source: "Custodian feed (in brain)", sourceId: "custodian-feed" as SourceId, value: "$7,250,000", date: "Oct 31" },
  delta: "12%",
  note: "Billing AUM differs from custodian positions by 12%. Held for Dana Ruiz. Nothing guessed.",
}

export const OTHER_HELD: { id: string; name: string; field: string; sources: string }[] = [
  { id: "HH-00017", name: "Abernathy", field: "Primary email", sources: "Onboarding vs Salesforce" },
  { id: "HH-00044", name: "Brandt Living Trust", field: "Fee schedule", sources: "Billing vs Salesforce" },
  { id: "HH-00071", name: "Castellanos", field: "Advisor", sources: "Onboarding vs Salesforce" },
  { id: "HH-00093", name: "Delacroix", field: "AUM", sources: "Billing vs Custodian feed" },
  { id: "HH-00120", name: "Eriksen", field: "Mailing address", sources: "Onboarding vs Salesforce" },
  { id: "HH-00138", name: "Fairweather", field: "Fee schedule", sources: "Billing vs Salesforce" },
  { id: "HH-00155", name: "Gallo Family", field: "AUM", sources: "Billing vs Custodian feed" },
  { id: "HH-00191", name: "Haddad", field: "Advisor", sources: "Onboarding vs Salesforce" },
  { id: "HH-00206", name: "Iverson", field: "Primary email", sources: "Onboarding vs Salesforce" },
  { id: "HH-00233", name: "Jablonski Trust", field: "AUM", sources: "Billing vs Custodian feed" },
  { id: "HH-00259", name: "Kowalczyk", field: "Mailing address", sources: "Onboarding vs Salesforce" },
  { id: "HH-00287", name: "Lindqvist", field: "Fee schedule", sources: "Billing vs Salesforce" },
]

// ---------------------------------------------------------------------------
// Agent run: trace and brief
// ---------------------------------------------------------------------------

export type TraceKind = "scope" | "read" | "blocked" | "conflict" | "done"
export type TraceStep = { n: number; kind: TraceKind; title: string; detail: string; path: string; policyId?: string }

export const RUN_PROMPT = "Prep my Thursday review with the Patel household."

export const TRACE: TraceStep[] = [
  { n: 1, kind: "scope", title: "Scope resolved", detail: "Acting for Marcus Lee. 3 sources in scope, brain scoped to his 118 households.", path: "policy://advisor-scope → marcus-lee/book" },
  { n: 2, kind: "read", title: "Read household record", detail: "Patel household HH-00318, 2 adults, 2 custodial accounts.", path: "salesforce-crm/households/HH-00318" },
  { n: 3, kind: "read", title: "Read tracker rows", detail: "4 rows for Patel, last edited Aug 14.", path: "client-tracker/Client_Tracker_FINAL_v3.xlsx!Households:A118:K121" },
  { n: 4, kind: "read", title: "Read client documents", detail: "6 files, newest Oct 14 (IPS draft).", path: "file-share/Clients/Patel/* (6 files)" },
  { n: 5, kind: "conflict", title: "Conflict found, both values kept", detail: "AUM $2,410,000 (Salesforce, Oct 29) vs $2,385,500 (AUM_Rollup row 214, Sep 30). Held as C-0041.", path: "brain/conflicts/C-0041" },
  { n: 6, kind: "blocked", title: "Blocked: compare with similar households", detail: "Would read other advisors' households. Denied at the data layer and logged.", path: "policy://advisor-scope → audit/A-2031", policyId: "advisor-scope" },
  { n: 7, kind: "done", title: "Brief assembled", detail: "5 sources cited, 1 gap typed, 1 request blocked.", path: "brief/2026-10-31/patel-review" },
]

export type BriefBlock = { id: string; heading?: string; text: string; cites: number[] }
export const BRIEF: BriefBlock[] = [
  { id: "hh", heading: "Household", text: "Anita and Rohan Patel, HH-00318. Two adults, two custodial accounts for Maya and Dev. Clients since March 2019, Marcus Lee is advisor of record.", cites: [2] },
  { id: "aum", heading: "Assets", text: "Salesforce shows $2,410,000 as of Oct 29. AUM_Rollup shows $2,385,500 as of Sep 30. The two disagree by $24,500 and are held as conflict C-0041. Lead with the Salesforce figure and say the September rollup is older.", cites: [2, 5] },
  { id: "open", heading: "Open items from your tracker", text: "529 funding for Maya, noted Aug 14 and not closed. Beneficiary update on the joint account still pending.", cites: [3] },
  { id: "docs", heading: "Documents", text: "Q3 statement, IPS draft updated Oct 14, 2025 tax organizer. Nothing newer than Oct 14 is on file.", cites: [4] },
  { id: "gap", heading: "Not included", text: "A comparison with similar households. That would read other advisors' clients and is blocked by policy. If you need it, Dana Ruiz can grant a scoped exception.", cites: [6] },
  { id: "agenda", heading: "Suggested agenda", text: "1. Confirm the AUM figure. 2. Close the 529 funding. 3. Sign the IPS. 4. Beneficiary update.", cites: [2, 3, 4] },
]

export const RUN_FOOTER = `${MODEL.name} on ${MODEL.host}, ${MODEL.rack} · 0 bytes left the network · 5 sources cited · 1 request blocked`

export const RUN_HISTORY = [
  { id: "r-118", at: new Date("2026-10-30T16:02:00-04:00"), prompt: "Summarize what changed for the Okafor Family Trust this month.", cites: 3, blocked: 0, ms: "6.1s" },
  { id: "r-117", at: new Date("2026-10-29T09:40:00-04:00"), prompt: "Draft talking points for the Lindqvist annual review.", cites: 4, blocked: 0, ms: "7.4s" },
  { id: "r-116", at: new Date("2026-10-28T14:15:00-04:00"), prompt: "Which of my households have an IPS older than 3 years?", cites: 2, blocked: 0, ms: "3.9s" },
  { id: "r-115", at: new Date("2026-10-27T11:22:00-04:00"), prompt: "List my households with a 529 account.", cites: 2, blocked: 1, ms: "4.2s" },
]

// ---------------------------------------------------------------------------
// Audit log, notifications
// ---------------------------------------------------------------------------

export type AuditKind = "read" | "blocked" | "merge" | "policy" | "intake" | "system" | "task"
export type AuditEntry = { id: string; at: Date; actorId: string; kind: AuditKind; text: string; href?: string; path?: string }

export const AUDIT: AuditEntry[] = [
  { id: "A-2034", at: new Date("2026-10-31T09:58:00-04:00"), actorId: "compliance-reviewer", kind: "read", text: "read 42 new compliance log entries", path: "compliance-log/events?since=2026-10-30" },
  { id: "A-2033", at: new Date("2026-10-31T09:02:00-04:00"), actorId: "merge-agent", kind: "merge", text: "updated MR-14 changes · Okafor Family Trust shown as held", href: href("/build/mr-14") },
  { id: "A-2032", at: new Date("2026-10-31T08:55:00-04:00"), actorId: "dana", kind: "merge", text: "commented on MR-14", href: href("/build/mr-14") },
  { id: "A-2031", at: new Date("2026-10-30T17:48:00-04:00"), actorId: "marcus-assistant", kind: "blocked", text: "blocked: attempted to read households outside Marcus Lee's book · policy advisor-scope", path: "salesforce-crm/households?advisor!=marcus-lee", href: href("/agents/marcus-assistant") },
  { id: "A-2030", at: new Date("2026-10-30T17:40:00-04:00"), actorId: "dana", kind: "task", text: "closed 3 onboarding items", path: "onboarding/items" },
  { id: "A-2029", at: new Date("2026-10-30T16:20:00-04:00"), actorId: "sam", kind: "task", text: "added refresh dates to 11 KYC records", path: "kyc/CLIENT_VERIFICATION" },
  { id: "A-2028", at: new Date("2026-10-30T16:02:00-04:00"), actorId: "marcus-assistant", kind: "read", text: "read Okafor Family Trust across 3 sources for a monthly summary", path: "brain/households/HH-00402" },
  { id: "A-2027", at: new Date("2026-10-30T18:12:00-04:00"), actorId: "merge-agent", kind: "merge", text: "opened MR-14 · 2,184 records from Onboarding and Billing", href: href("/build/mr-14") },
  { id: "A-2026", at: new Date("2026-10-30T11:05:00-04:00"), actorId: "dana", kind: "task", text: "tagged 212 client documents with household IDs", path: "client-docs/Clients/*" },
  { id: "A-2025", at: new Date("2026-10-30T09:30:00-04:00"), actorId: "intake-agent", kind: "intake", text: "sent reminder 2 to Planning team · no response", href: href("/intake") },
  { id: "A-2024", at: new Date("2026-10-29T14:12:00-04:00"), actorId: "dana", kind: "task", text: "updated Patel household AUM in Salesforce to $2,410,000", path: "salesforce-crm/households/HH-00318" },
  { id: "A-2023", at: new Date("2026-10-29T09:40:00-04:00"), actorId: "marcus-assistant", kind: "read", text: "read Lindqvist household across 4 sources for a review", path: "brain/households/HH-00287" },
  { id: "A-2022", at: new Date("2026-10-28T15:10:00-04:00"), actorId: "ops-assistant", kind: "read", text: "read 37 open onboarding items for a status draft", path: "onboarding/items?status=open" },
  { id: "A-2021", at: new Date("2026-10-28T09:30:00-04:00"), actorId: "intake-agent", kind: "intake", text: "sent reminder 1 to Planning team", href: href("/intake") },
  { id: "A-2020", at: new Date("2026-10-27T11:22:00-04:00"), actorId: "marcus-assistant", kind: "blocked", text: "blocked: requested Prospects_2025.xlsx, source is stale and not in scope", path: "prospects/Prospects_2025.xlsx" },
  { id: "A-2019", at: new Date("2026-10-24T20:05:00-04:00"), actorId: "dana", kind: "merge", text: "approved and merged MR-11 · Custodian feed into the firm brain", href: href("/build") },
  { id: "A-2018", at: new Date("2026-10-23T17:30:00-04:00"), actorId: "sam", kind: "merge", text: "approved and merged MR-9 · Compliance log into the firm brain", href: href("/build") },
  { id: "A-2017", at: new Date("2026-10-22T14:00:00-04:00"), actorId: "dana", kind: "policy", text: "set policy: agents propose, a person approves every merge", href: href("/permissions") },
  { id: "A-2016", at: new Date("2026-10-22T14:00:00-04:00"), actorId: "sam", kind: "policy", text: "set policy: every value in the brain traces to a source row", href: href("/permissions") },
  { id: "A-2015", at: new Date("2026-10-21T09:00:00-04:00"), actorId: "chris", kind: "system", text: "installed Enakt 1.8.2 inside the Ashcombe network · cloud model vendors disabled by policy", href: href("/settings?tab=deployment") },
]

export const NOTIFICATIONS = [
  { id: "n1", text: "merge-agent opened MR-14 · 2,184 records ready, 37 held for you", at: new Date("2026-10-30T18:12:00-04:00"), href: href("/build/mr-14") },
  { id: "n2", text: "marcus-assistant was blocked by policy advisor-scope · logged A-2031", at: new Date("2026-10-30T17:48:00-04:00"), href: href("/audit") },
  { id: "n3", text: "Planning team has not answered intake after 2 reminders", at: new Date("2026-10-30T09:30:00-04:00"), href: href("/intake") },
]

/** Daily egress since install, in bytes. Flat at zero. */
export const EGRESS = Array.from({ length: 11 }, (_, i) => ({ day: new Date(2026, 9, 21 + i), bytes: 0 }))

export const SETTINGS_MEMBERS = [
  { id: "dana", seat: "Admin", lastActive: NOW },
  { id: "chris", seat: "Admin", lastActive: new Date("2026-10-30T15:00:00-04:00") },
  { id: "sam", seat: "Compliance", lastActive: new Date("2026-10-31T09:40:00-04:00") },
  { id: "marcus", seat: "Member", lastActive: new Date("2026-10-30T16:10:00-04:00") },
  { id: "priya", seat: "Member", lastActive: new Date("2026-10-30T12:30:00-04:00") },
]

export const CONNECTIONS: { sourceId: SourceId; mode: string; status: "connected" | "metadata" | "off" }[] = [
  { sourceId: "salesforce-crm", mode: "Metadata + read (scoped)", status: "connected" },
  { sourceId: "onboarding", mode: "Metadata + read", status: "connected" },
  { sourceId: "client-docs", mode: "Metadata + read (scoped)", status: "connected" },
  { sourceId: "client-tracker", mode: "Metadata + read (scoped)", status: "connected" },
  { sourceId: "prospects", mode: "Metadata only", status: "metadata" },
  { sourceId: "custodian-feed", mode: "Metadata + read", status: "connected" },
  { sourceId: "aum-rollup", mode: "Metadata + read", status: "connected" },
  { sourceId: "billing", mode: "Metadata + read", status: "connected" },
  { sourceId: "kyc", mode: "Metadata only · compliance reads", status: "metadata" },
  { sourceId: "compliance-log", mode: "Metadata + read", status: "connected" },
  { sourceId: "advisor-comp", mode: "Not connected by policy", status: "off" },
  { sourceId: "planning-cases", mode: "Metadata only · no owner", status: "metadata" },
]
