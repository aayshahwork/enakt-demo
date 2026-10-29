"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, Plug, Plus, Cpu } from "lucide-react"
import { Card, PageHeader } from "@/components/demo/page"
import { ActorAvatar, ActorName, ModelBadge } from "@/components/demo/actor"
import { SourceIcon } from "@/components/demo/source-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CONNECTIONS, MEMBERS, MODELS, PEOPLE } from "@/lib/demo/fixtures"

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <PageHeader title="Settings" description="Models, connections, and members for Northfield Wealth Partners." />
      <Tabs defaultValue="models">
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="models">Models</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="connections">Connections</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="members">Members</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="general">General</UnderlineTabsTrigger>
        </UnderlineTabsList>

        <TabsContent value="models" className="space-y-4">
          <p className="text-sm text-muted-foreground">Agents run on the model you assign. Every model sees metadata by default; row access is granted per resource on the Access page.</p>
          {MODELS.map((m) => (
            <Card key={m.id} className="flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Cpu className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.provider}</span>
                  {m.status === "connected" ? (
                    <Badge variant="verified">
                      <Check className="h-3 w-3" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="gap">Available</Badge>
                  )}
                </div>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">{m.model}</div>
                <div className="mt-1 text-xs text-muted-foreground">{m.note}</div>
                {m.usedBy.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.usedBy.map((a) => (
                      <Badge key={a} variant="outline" className="font-mono">
                        {a}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {m.status === "connected" ? (
                <Button variant="outline" size="sm" onClick={() => toast("Connection test passed", { description: `${m.name} responded in 212 ms.` })}>
                  Test
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => toast("Not in the demo", { description: "Connecting GPT would open the provider's key flow." })}>
                  <Plug /> Connect
                </Button>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-medium">Connected systems</div>
              <Button variant="outline" size="sm" onClick={() => toast("Not in the demo", { description: "Adding a connection opens the vendor's OAuth flow." })}>
                <Plus /> Add connection
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>System</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CONNECTIONS.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium">
                        <SourceIcon type={c.type} size={14} /> {c.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.scope}</TableCell>
                    <TableCell>
                      <Badge variant="verified">
                        <Check className="h-3 w-3" /> Connected
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.since}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-medium">{MEMBERS.length} members</div>
              <Button variant="outline" size="sm" onClick={() => toast("Invite sent (demo)", { description: "No email left the browser." })}>
                <Plus /> Invite
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MEMBERS.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <ActorAvatar id={m.id} size="sm" /> <ActorName id={m.id} withRole />
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{PEOPLE[m.id].email}</TableCell>
                    <TableCell>
                      <Badge variant={m.role === "Owner" ? "signal" : "outline"}>{m.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.joined}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <ActorAvatar id="merge-agent-01" size="sm" /> <ActorName id="merge-agent-01" />
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">agent</TableCell>
                  <TableCell>
                    <Badge variant="outline">Agent</Badge> <ModelBadge model="Claude" />
                  </TableCell>
                  <TableCell className="text-muted-foreground">Oct 17</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <ActorAvatar id="report-agent" size="sm" /> <ActorName id="report-agent" />
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">agent</TableCell>
                  <TableCell>
                    <Badge variant="outline">Agent</Badge> <ModelBadge model="Local model" />
                  </TableCell>
                  <TableCell className="text-muted-foreground">Oct 20</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card className="divide-y">
            {[
              { label: "Require a human reviewer on every merge request", desc: "Agents can open and comment; only people can approve.", on: true },
              { label: "Hold conflicting values instead of choosing", desc: "When two sources disagree beyond tolerance, keep both and route to the owner.", on: true },
              { label: "Allow agents to read rows", desc: "Off: agents see schema, owners, and timestamps only.", on: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="text-xs text-muted-foreground">{row.desc}</div>
                </div>
                <Switch defaultChecked={row.on} onCheckedChange={() => toast("Setting saved")} />
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
