"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Completed", value: 68, color: "#2563eb" },
  { label: "In Progress", value: 22, color: "#3b82f6" },
  { label: "Pending", value: 10, color: "#60a5fa" },
]

export default function DonutChartSeparatedDemo() {
  return (
    <div className="w-full max-w-md">
      <DonutChart
        data={data}
        variant="separated"
        innerRadius={0.7}
        cornerRadius={8}
        showLabels
        animate
        centerLabel="Tasks"
        centerValue="156"
        showTotal={false}
      />
    </div>
  )
}
