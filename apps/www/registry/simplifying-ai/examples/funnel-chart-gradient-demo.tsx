"use client"

import { FunnelChart } from "@/registry/simplifying-ai/ui/charts"

// Conversion funnel data
const stages = ["Awareness", "Interest", "Desire", "Action"]

const series = [
  { name: "Organic", values: [12000, 8500, 4200, 1800] },
  { name: "Paid", values: [9500, 6800, 3500, 1500] },
  { name: "Social", values: [7200, 5200, 2800, 1200] },
  { name: "Direct", values: [5400, 4000, 2100, 900] },
  { name: "Referral", values: [3800, 2800, 1500, 650] },
]

export default function FunnelChartGradientDemo() {
  return (
    <div className="w-full max-w-4xl">
      <FunnelChart
        stages={stages}
        series={series}
        colorScheme="blue"
        showStageMarkers
        showValuePills
        pillPosition="center"
        animate
      />
    </div>
  )
}
