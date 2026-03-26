"use client"

import { FunnelChart } from "@/registry/simplifying-ai/ui/charts"

// User engagement funnel
const stages = ["Visit", "Register", "Active", "Premium"]

const series = [
  { name: "Segment 1", values: [45000, 18000, 8500, 2200] },
  { name: "Segment 2", values: [32000, 14500, 7200, 1900] },
  { name: "Segment 3", values: [24000, 11000, 5800, 1500] },
  { name: "Segment 4", values: [18000, 8500, 4500, 1200] },
  { name: "Segment 5", values: [12000, 6000, 3200, 850] },
]

export default function FunnelChartPyramidDemo() {
  return (
    <div className="w-full max-w-4xl">
      <FunnelChart
        stages={stages}
        series={series}
        colorScheme="green"
        showStageMarkers
        showValuePills
        pillPosition="both"
        animate
      />
    </div>
  )
}
