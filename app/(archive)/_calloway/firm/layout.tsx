import { notFound } from "next/navigation"
import { AppShell } from "@/components/shell/app-shell"
import { FIRM } from "@/lib/demo/fixtures"

export function generateStaticParams() {
  return [{ firm: FIRM }]
}

export const dynamicParams = false

export default async function FirmLayout({ children, params }: { children: React.ReactNode; params: Promise<{ firm: string }> }) {
  const { firm } = await params
  if (firm !== FIRM) notFound()
  return <AppShell>{children}</AppShell>
}
