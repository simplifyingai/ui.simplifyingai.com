"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Completed", value: 68, color: "#22C55E" },
  { label: "In Progress", value: 22, color: "#F59E0B" },
  { label: "Pending", value: 10, color: "#EF4444" },
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
