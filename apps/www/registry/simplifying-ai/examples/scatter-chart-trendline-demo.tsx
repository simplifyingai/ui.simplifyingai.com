"use client"

import { ScatterChart } from "@/registry/simplifying-ai/ui/charts"

// Study hours vs test scores with trend line
const data = [
  {
    name: "Student Performance",
    color: "#2563eb",
    data: [
      { x: 2, y: 55 },
      { x: 3, y: 62 },
      { x: 4, y: 68 },
      { x: 5, y: 72 },
      { x: 6, y: 75 },
      { x: 7, y: 82 },
      { x: 8, y: 85 },
      { x: 9, y: 88 },
      { x: 10, y: 92 },
      { x: 4.5, y: 65 },
      { x: 5.5, y: 78 },
      { x: 6.5, y: 80 },
      { x: 7.5, y: 84 },
      { x: 8.5, y: 90 },
    ],
  },
]

export default function ScatterChartTrendlineDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ScatterChart
        data={data}
        width={500}
        height={320}
        showTrendLine
        showLegend={false}
        xAxisLabel="Study Hours"
        yAxisLabel="Test Score"
      />
    </div>
  )
}
