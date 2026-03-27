"use client"

import { FunnelChart } from "@/registry/simplifying-ai/ui/charts"

// Conversion funnel data
const stages = ["Awareness", "Interest", "Desire", "Action"]

const series = [
  { name: "Organic", values: [12000, 8500, 4200, 1800], color: "#1e40af" },
  { name: "Paid", values: [9500, 6800, 3500, 1500], color: "#2563eb" },
  { name: "Social", values: [7200, 5200, 2800, 1200], color: "#3b82f6" },
  { name: "Direct", values: [5400, 4000, 2100, 900], color: "#60a5fa" },
  { name: "Referral", values: [3800, 2800, 1500, 650], color: "#93c5fd" },
]

export default function FunnelChartGradientDemo() {
  return (
    <div className="w-full max-w-4xl">
      <FunnelChart
        stages={stages}
        series={series}
        colorScheme="custom"
        showStageMarkers
        showValuePills
        pillPosition="center"
        animate
      />
    </div>
  )
}
