"use client"

import { ScatterChart } from "@/registry/simplifying-ai/ui/charts"

// Temperature vs ice cream sales (positive correlation)
const data = [
  {
    name: "Ice Cream Sales",
    color: "#2563eb",
    data: [
      { x: 55, y: 120 },
      { x: 60, y: 180 },
      { x: 65, y: 220 },
      { x: 70, y: 280 },
      { x: 75, y: 350 },
      { x: 80, y: 420 },
      { x: 85, y: 480 },
      { x: 90, y: 520 },
      { x: 58, y: 150 },
      { x: 68, y: 260 },
      { x: 78, y: 390 },
      { x: 88, y: 495 },
    ],
  },
]

export default function ScatterChartCorrelationDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ScatterChart
        data={data}
        width={500}
        height={320}
        showTrendLine
        showLegend={false}
        symbol="circle"
        size={9}
        xAxisLabel="Temperature (°F)"
        yAxisLabel="Daily Sales ($)"
      />
    </div>
  )
}
