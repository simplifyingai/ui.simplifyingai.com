"use client"

import { DonutChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Used", value: 73, color: "#3B82F6" },
  { label: "Free", value: 27, color: "#E5E7EB" },
]

export default function DonutChartHalfDemo() {
  return (
    <div className="w-full max-w-md">
      <DonutChart
        data={data}
        innerRadius={0.75}
        startAngle={-Math.PI}
        endAngle={0}
        animate
        showLegend={false}
        centerLabel="Storage"
        centerValue="73%"
        showTotal={false}
        height={250}
      />
    </div>
  )
}
