import { notFound } from "next/navigation"
import { SOURCES, SOURCE_BY_SLUG } from "@/lib/demo/fixtures"
import { SourceDetail } from "@/components/demo/source-detail"

export function generateStaticParams() {
  return SOURCES.map((s) => ({ slug: s.slug }))
}

export const dynamicParams = false

export default async function SourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const source = SOURCE_BY_SLUG[slug]
  if (!source) notFound()
  return <SourceDetail slug={slug} />
}
