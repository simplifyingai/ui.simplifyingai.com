"use client"

import { FunnelChart } from "@/registry/simplifying-ai/ui/charts"

// Email campaign funnel
const stages = ["Sent", "Delivered", "Opened", "Clicked"]

const series = [
  { name: "Campaign A", values: [25000, 24200, 8500, 2100] },
  { name: "Campaign B", values: [18000, 17400, 6200, 1600] },
  { name: "Campaign C", values: [12000, 11600, 4100, 1100] },
  { name: "Campaign D", values: [8000, 7700, 2800, 750] },
]

export default function FunnelChartFlatDemo() {
  return (
    <div className="w-full max-w-4xl">
      <FunnelChart
        stages={stages}
        series={series}
        colorScheme="purple"
        showStageMarkers
        showValuePills
        pillPosition="center"
        animate
      />
    </div>
  )
}
