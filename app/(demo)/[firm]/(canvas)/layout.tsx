"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BrainCanvas } from "@/components/demo/brain-canvas"
import { CanvasSelectionProvider, useCanvasSelection } from "@/components/demo/canvas-context"
import { IntakeCounters } from "@/components/demo/intake-counters"

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const intake = pathname.includes("/intake")
  const { selected, setSelected, hiddenVerdicts } = useCanvasSelection()

  return (
    <div className="flex h-full min-h-0">
      {intake && (
        <motion.aside
          key="intake-pane"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex w-[42%] min-w-0 shrink-0 flex-col border-r bg-background"
        >
          {children}
        </motion.aside>
      )}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {intake && <IntakeCounters />}
        <div className="relative min-h-0 flex-1">
          <BrainCanvas mode={intake ? "intake" : "map"} selectedId={selected} onSelect={setSelected} hiddenVerdicts={hiddenVerdicts} padding={intake ? 0.12 : 0.16} />
          {!intake && <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">{children}</div>}
        </div>
      </div>
    </div>
  )
}

/** Intake and Map share this layout so the React Flow canvas stays mounted across the two routes. */
export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return (
    <CanvasSelectionProvider>
      <Frame>{children}</Frame>
    </CanvasSelectionProvider>
  )
}
