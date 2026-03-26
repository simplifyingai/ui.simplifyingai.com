"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Sales", value: 45000, color: "#8B5CF6" },
  { label: "Marketing", value: 32000, color: "#EC4899" },
  { label: "Development", value: 28000, color: "#3B82F6" },
  { label: "Operations", value: 15000, color: "#10B981" },
]

export default function DonutChartGradientDemo() {
  return (
    <div className="w-full max-w-md">
      <DonutChart
        data={data}
        variant="gradient"
        innerRadius={0.55}
        showLabels
        animate
        valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        centerLabel="Budget"
        showTotal={false}
        centerValue="$120k"
      />
    </div>
  )
}
