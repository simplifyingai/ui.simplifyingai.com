"use client"

import { FunnelChart } from "@/registry/simplifying-ai/ui/charts"

// Sales pipeline data
const stages = ["Lead", "Qualified", "Proposal", "Closed"]

const series = [
  { name: "Enterprise", values: [15000, 28000, 42000, 58000] },
  { name: "Mid-Market", values: [12000, 22000, 35000, 48000] },
  { name: "SMB", values: [8500, 16000, 26000, 38000] },
  { name: "Startup", values: [5500, 11000, 18000, 28000] },
]

export default function FunnelChartHorizontalDemo() {
  return (
    <div className="w-full max-w-4xl">
      <FunnelChart
        stages={stages}
        series={series}
        colorScheme="pink"
        showStageMarkers
        showValuePills
        pillPosition="both"
        animate
        height={300}
      />
    </div>
  )
}
