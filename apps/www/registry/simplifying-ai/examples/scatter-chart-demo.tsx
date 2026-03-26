"use client"

import { ScatterChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "Dataset A",
    data: [
      { x: 10, y: 30 },
      { x: 40, y: 50 },
      { x: 20, y: 70 },
      { x: 60, y: 40 },
      { x: 80, y: 90 },
      { x: 30, y: 20 },
      { x: 50, y: 60 },
    ],
  },
  {
    name: "Dataset B",
    data: [
      { x: 15, y: 45 },
      { x: 35, y: 25 },
      { x: 55, y: 85 },
      { x: 75, y: 55 },
      { x: 25, y: 35 },
      { x: 45, y: 75 },
      { x: 65, y: 15 },
    ],
  },
]

const config = {
  "Dataset A": { label: "Dataset A", color: "var(--chart-1)" },
  "Dataset B": { label: "Dataset B", color: "var(--chart-2)" },
}

export default function ScatterChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ScatterChart
        data={data}
        config={config}
        showLegend
        xAxisLabel="X Value"
        yAxisLabel="Y Value"
      />
    </div>
  )
}
