import { notFound } from "next/navigation"
import { MergeRequestDetail } from "@/components/demo/merge-request"

export function generateStaticParams() {
  return [{ id: "12" }]
}
export const dynamicParams = false

export default async function MergeRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id !== "12") notFound()
  return <MergeRequestDetail />
}
