"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Chrome", value: 62.5, color: "#4285F4" },
  { label: "Safari", value: 19.3, color: "#FF9500" },
  { label: "Firefox", value: 4.2, color: "#FF7139" },
  { label: "Edge", value: 4.1, color: "#0078D7" },
  { label: "Other", value: 9.9, color: "#6B7280" },
]

export default function DonutChartDemo() {
  return (
    <div className="w-full max-w-md">
      <DonutChart data={data} innerRadius={0.65} showLabels showTotal animate />
    </div>
  )
}
