"use client"

import { SankeyChart } from "@/registry/simplifying-ai/ui/charts"

// Simple two-level flow
const nodes = [
  { id: "source1", name: "Desktop", color: "#2563eb" },
  { id: "source2", name: "Mobile", color: "#3b82f6" },
  { id: "source3", name: "Tablet", color: "#60a5fa" },
  { id: "target1", name: "Conversions", color: "#1e40af" },
  { id: "target2", name: "Bounced", color: "#93c5fd" },
]

const links = [
  { source: "source1", target: "target1", value: 420 },
  { source: "source1", target: "target2", value: 180 },
  { source: "source2", target: "target1", value: 280 },
  { source: "source2", target: "target2", value: 320 },
  { source: "source3", target: "target1", value: 90 },
  { source: "source3", target: "target2", value: 110 },
]

export default function SankeyChartMinimalDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <SankeyChart
        nodes={nodes}
        links={links}
        nodeWidth={16}
        nodePadding={20}
        width={400}
        height={240}
        showValues={false}
        margin={{ top: 16, right: 80, bottom: 16, left: 70 }}
      />
    </div>
  )
}
