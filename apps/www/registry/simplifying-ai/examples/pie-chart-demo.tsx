"use client"

import { PieChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Chrome", value: 62.5 },
  { label: "Safari", value: 18.8 },
  { label: "Firefox", value: 6.3 },
  { label: "Edge", value: 5.2 },
  { label: "Other", value: 7.2 },
]

const config = {
  Chrome: { label: "Chrome", color: "var(--chart-1)" },
  Safari: { label: "Safari", color: "var(--chart-2)" },
  Firefox: { label: "Firefox", color: "var(--chart-3)" },
  Edge: { label: "Edge", color: "var(--chart-4)" },
  Other: { label: "Other", color: "var(--chart-5)" },
}

export default function PieChartDemo() {
  return (
    <div className="w-full max-w-md">
      <PieChart data={data} config={config} showLegend showLabels />
    </div>
  )
}
