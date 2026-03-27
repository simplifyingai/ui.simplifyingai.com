"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Sales", value: 45000, color: "#2563eb" },
  { label: "Marketing", value: 32000, color: "#3b82f6" },
  { label: "Development", value: 28000, color: "#60a5fa" },
  { label: "Operations", value: 15000, color: "#93c5fd" },
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
