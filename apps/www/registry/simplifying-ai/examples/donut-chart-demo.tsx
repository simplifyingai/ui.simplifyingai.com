"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Chrome", value: 62.5, color: "#2563eb" },
  { label: "Safari", value: 19.3, color: "#3b82f6" },
  { label: "Firefox", value: 4.2, color: "#60a5fa" },
  { label: "Edge", value: 4.1, color: "#93c5fd" },
  { label: "Other", value: 9.9, color: "#bfdbfe" },
]

export default function DonutChartDemo() {
  return (
    <div className="w-full max-w-md">
      <DonutChart data={data} innerRadius={0.65} showLabels showTotal animate />
    </div>
  )
}
