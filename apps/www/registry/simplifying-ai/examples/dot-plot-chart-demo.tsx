"use client"

import { DotPlotChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Product A", value: 85, color: "#1e40af" },
  { category: "Product B", value: 72, color: "#2563eb" },
  { category: "Product C", value: 93, color: "#3b82f6" },
  { category: "Product D", value: 68, color: "#60a5fa" },
  { category: "Product E", value: 78, color: "#93c5fd" },
  { category: "Product F", value: 88, color: "#1e40af" },
]

export default function DotPlotChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <DotPlotChart
        data={data}
        orientation="horizontal"
        dotSize={10}
        showValues
      />
    </div>
  )
}
