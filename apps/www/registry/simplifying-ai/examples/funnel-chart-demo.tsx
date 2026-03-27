"use client"

import { FunnelChart } from "@/registry/simplifying-ai/ui/charts"

// Sample data showing user flow through stages (expanding funnel)
const stages = ["Stage 1", "Stage 2", "Stage 3", "Stage 4"]

const series = [
  { name: "Channel A", values: [12000, 24000, 45000, 68000], color: "#1e40af" },
  { name: "Channel B", values: [9500, 19000, 36000, 54000], color: "#2563eb" },
  { name: "Channel C", values: [7500, 15000, 28000, 42000], color: "#3b82f6" },
  { name: "Channel D", values: [6000, 12000, 22000, 33000], color: "#60a5fa" },
  { name: "Channel E", values: [4500, 9000, 17000, 26000], color: "#93c5fd" },
  { name: "Channel F", values: [3500, 7000, 13000, 20000], color: "#bfdbfe" },
]

export default function FunnelChartDemo() {
  return (
    <FunnelChart
      stages={stages}
      series={series}
      colorScheme="custom"
      showStageMarkers
      showValuePills
      pillPosition="both"
      animate
    />
  )
}
