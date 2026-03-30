"use client"

import { PolarChart } from "@/registry/simplifying-ai/ui/charts/statistical/polar-chart"

const windData = [
  { category: "N", value: 45 },
  { category: "NE", value: 32 },
  { category: "E", value: 28 },
  { category: "SE", value: 15 },
  { category: "S", value: 22 },
  { category: "SW", value: 38 },
  { category: "W", value: 52 },
  { category: "NW", value: 48 },
]

export default function PolarChartDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <PolarChart
        data={windData}
        variant="rose"
        showLabels
        showValues={false}
        showGrid
      />
    </div>
  )
}
