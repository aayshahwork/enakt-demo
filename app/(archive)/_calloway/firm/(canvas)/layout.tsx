"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { DealCanvas } from "@/components/demo/deal-canvas"
import { CanvasSelectionProvider, useCanvasSelection } from "@/components/demo/canvas-context"
import { RequestCounters } from "@/components/demo/request-counters"

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const request = pathname.includes("/requests/")
  const { selected, setSelected, hiddenVerdicts } = useCanvasSelection()

  return (
    <div className="flex h-full min-h-0">
      {request && (
        <motion.aside
          key="request-pane"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex w-[42%] min-w-0 shrink-0 flex-col border-r bg-background"
        >
          {children}
        </motion.aside>
      )}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {request && <RequestCounters />}
        <div className="relative min-h-0 flex-1">
          <DealCanvas mode={request ? "request" : "map"} selectedId={selected} onSelect={setSelected} hiddenVerdicts={hiddenVerdicts} padding={request ? 0.1 : { top: "118px", bottom: "40px", left: "32px", right: "32px" }} />
          {!request && <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">{children}</div>}
        </div>
      </div>
    </div>
  )
}

/** The request and the map share this layout so the React Flow canvas stays mounted across the two routes. */
export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return (
    <CanvasSelectionProvider>
      <Frame>{children}</Frame>
    </CanvasSelectionProvider>
  )
}
