"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

// Colors are derived from CSS variables (--chart-1 through --chart-5)
const data = [
  { label: "Chrome", value: 62.5 },
  { label: "Safari", value: 19.3 },
  { label: "Firefox", value: 4.2 },
  { label: "Edge", value: 4.1 },
  { label: "Other", value: 9.9 },
]

export default function DonutChartDemo() {
  return (
    <div className="w-full max-w-md">
      <DonutChart data={data} innerRadius={0.65} showLabels showTotal animate />
    </div>
  )
}
