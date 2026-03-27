"use client"

import { SankeyChart } from "@/registry/simplifying-ai/ui/charts"

// Energy flow from sources to sectors
const nodes = [
  { id: "coal", name: "Coal", color: "#1e40af" },
  { id: "gas", name: "Natural Gas", color: "#2563eb" },
  { id: "nuclear", name: "Nuclear", color: "#3b82f6" },
  { id: "hydro", name: "Hydro", color: "#60a5fa" },
  { id: "solar", name: "Solar", color: "#93c5fd" },
  { id: "wind", name: "Wind", color: "#bfdbfe" },
  { id: "electricity", name: "Electricity", color: "#2563eb" },
  { id: "residential", name: "Residential", color: "#1e40af" },
  { id: "commercial", name: "Commercial", color: "#3b82f6" },
  { id: "industrial", name: "Industrial", color: "#60a5fa" },
  { id: "transport", name: "Transport", color: "#93c5fd" },
]

const links = [
  { source: "coal", target: "electricity", value: 350 },
  { source: "gas", target: "electricity", value: 280 },
  { source: "nuclear", target: "electricity", value: 200 },
  { source: "hydro", target: "electricity", value: 120 },
  { source: "solar", target: "electricity", value: 80 },
  { source: "wind", target: "electricity", value: 70 },
  { source: "electricity", target: "residential", value: 320 },
  { source: "electricity", target: "commercial", value: 280 },
  { source: "electricity", target: "industrial", value: 350 },
  { source: "electricity", target: "transport", value: 150 },
]

export default function SankeyChartEnergyDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SankeyChart
        nodes={nodes}
        links={links}
        nodeWidth={16}
        nodePadding={14}
        width={600}
        height={340}
        margin={{ top: 20, right: 90, bottom: 20, left: 90 }}
      />
    </div>
  )
}
