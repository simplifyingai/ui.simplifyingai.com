"use client"

import { TernaryChart } from "@/registry/simplifying-ai/ui/charts/scientific/ternary-chart"

const soilData = [
  { id: "Sample 1", a: 40, b: 35, c: 25, label: "Sandy Loam" },
  { id: "Sample 2", a: 20, b: 55, c: 25, label: "Clay Loam" },
  { id: "Sample 3", a: 65, b: 20, c: 15, label: "Sandy" },
  { id: "Sample 4", a: 30, b: 40, c: 30, label: "Loam" },
  { id: "Sample 5", a: 15, b: 65, c: 20, label: "Clay" },
  { id: "Sample 6", a: 55, b: 25, c: 20, label: "Sandy Clay" },
  { id: "Sample 7", a: 35, b: 45, c: 20, label: "Silty Clay" },
  { id: "Sample 8", a: 45, b: 30, c: 25, label: "Loamy Sand" },
]

export default function TernaryChartDemo() {
  return (
    <TernaryChart
      data={soilData}
      labels={["Sand", "Clay", "Silt"]}
      showGrid
      showLabels
      gridLines={5}
    />
  )
}
