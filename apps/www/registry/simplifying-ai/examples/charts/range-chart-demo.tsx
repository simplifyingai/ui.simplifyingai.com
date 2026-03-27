"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts/basic/range-chart"

const temperatureData = [
  { x: "Jan", low: -5, high: 8, mid: 2 },
  { x: "Feb", low: -3, high: 10, mid: 4 },
  { x: "Mar", low: 2, high: 15, mid: 8 },
  { x: "Apr", low: 6, high: 20, mid: 13 },
  { x: "May", low: 10, high: 24, mid: 17 },
  { x: "Jun", low: 14, high: 28, mid: 21 },
  { x: "Jul", low: 16, high: 32, mid: 24 },
  { x: "Aug", low: 15, high: 31, mid: 23 },
  { x: "Sep", low: 12, high: 26, mid: 19 },
  { x: "Oct", low: 7, high: 18, mid: 12 },
  { x: "Nov", low: 2, high: 12, mid: 7 },
  { x: "Dec", low: -2, high: 8, mid: 3 },
]

export default function RangeChartDemo() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <RangeChart
        data={temperatureData}
        variant="area"
        showMidLine
        showPoints
        xAxisLabel="Month"
        yAxisLabel="Temperature (°C)"
        valueFormatter={(v) => `${v}°C`}
      />
    </div>
  )
}
