"use client"

import { TernaryChart } from "@/registry/simplifying-ai/ui/charts/scientific/ternary-chart"

// Chemical mixture data points
const mixtureData = [
  { id: "M1", a: 50, b: 30, c: 20, label: "Mixture 1" },
  { id: "M2", a: 35, b: 45, c: 20, label: "Mixture 2" },
  { id: "M3", a: 40, b: 35, c: 25, label: "Mixture 3" },
  { id: "M4", a: 45, b: 25, c: 30, label: "Mixture 4" },
  { id: "M5", a: 30, b: 40, c: 30, label: "Mixture 5" },
  { id: "M6", a: 55, b: 30, c: 15, label: "Mixture 6" },
]

export default function TernaryChartFilled() {
  return (
    <TernaryChart
      data={mixtureData}
      labels={["Component A", "Component B", "Component C"]}
      variant="filled"
      color="#10b981"
      showGrid
      showLabels
    />
  )
}
